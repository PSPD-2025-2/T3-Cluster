const fastify = require("fastify");
const { PrismaClient } = require("@prisma/client");
const axios = require("axios");

const prisma = new PrismaClient();

const app = fastify({ logger: true });

const CLIENT_SERVICE_URL = process.env.CLIENT_SERVICE_URL || "http://localhost:50051";
const ACCOUNT_PORT = process.env.ACCOUNT_PORT || 50052;

app.get("/accounts/", async (request, reply) => {
  try {
    const accounts = await prisma.account.findMany();
    reply.send(accounts);
  } catch (error) {
    app.log.error("Error fetching accounts:", error);
    reply.status(500).send({ error: "Internal server error" });
  }
});

app.get("/accounts/:id/", async (request, reply) => {
  const { id } = request.params;

  try {
    const account = await prisma.account.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (account) {
      reply.send(account);
    } else {
      reply.status(404).send({ error: "Account not found" });
    }
  } catch (error) {
    app.log.error("Error fetching account:", error);
    reply.status(500).send({ error: "Internal server error" });
  }
});

app.get("/accounts/client/:clientId/", async (request, reply) => {
  const { clientId } = request.params;

  try {
    const accounts = await prisma.account.findFirst({
      where: { client: parseInt(clientId, 10) },
    });
    reply.send(accounts);
  } catch (error) {
    app.log.error("Error fetching accounts for client:", error);
    reply.status(500).send({ error: "Internal server error" });
  }
});

app.post("/accounts/", async (request, reply) => {
  const {client, key, balance} = request.body;

  try {
    const clientResponse = await axios.get(`${CLIENT_SERVICE_URL}/clients/${client}/`);

    if (clientResponse.status !== 200) {
      return reply.status(400).send({ error: "Client does not exist" });
    }

    const newAccount = await prisma.account.create({
      data: { client, key, balance },
    });

    reply.status(201).send(newAccount);
  } catch (error) {
    app.log.error("Error creating account:", error);
    if (error.response) {
      return reply.status(error.response.status).send({ error: error.response.data.error });
    }
    reply.status(500).send({ error: "Internal server error" });
  }
});

app.patch("/accounts/:id/", async (request, reply) => {
  const { id } = request.params;
  const { key, balance } = request.body;
  const data = {};

  if (key !== undefined) data.key = key;
  if (balance !== undefined) data.balance = balance;
  
  if (Object.keys(data).length === 0) {
    return reply.status(400).send({ error: "No fields to update" });
  }
  
  try {
    const updatedAccount = await prisma.account.update({
      where: { id: parseInt(id, 10) },
      data: data,
    });
    
    reply.send(updatedAccount);
  } catch (error) {
    app.log.error("Error updating account:", error);
    reply.status(500).send({ error: "Internal server error" });
  }
});

app.delete("/accounts/:id/", async (request, reply) => {
  const { id } = request.params;

  try {
    await prisma.account.delete({
      where: { id: parseInt(id, 10) },
    });
    reply.send({ message: "Account deleted successfully" });
  } catch (error) {
    if (error.code === 'P2025') {
      reply.status(404).send({ error: "Account not found" });
      return;
    }
    app.log.error("Error deleting account:", error);
    reply.status(500).send({ error: "Internal server error" });
  }
});

app.post("/transactions/", async (request, reply) => {
  const { from_account, to_account, amount } = request.body;

  if (from_account === to_account) {
    return reply.status(400).send({ error: "Cannot transfer to the same account" });
  }

  try {
    const fromAccount = await prisma.account.findUnique({
      where: { id: parseInt(from_account, 10) },
    });
    const toAccount = await prisma.account.findUnique({
      where: { key: to_account },
    });

    if (!fromAccount) {
      return reply.status(400).send({ error: "Source account does not exist" });
    }
    if (!toAccount) {
      return reply.status(400).send({ error: "Destination account does not exist" });
    }
    if (fromAccount.balance < amount) {
      return reply.status(400).send({ error: "Insufficient funds in source account" });
    }

    const updatedFromAccount = await prisma.account.update({
      where: { id: fromAccount.id },
      data: { balance: fromAccount.balance - amount },
    });

    const updatedToAccount = await prisma.account.update({
      where: { id: toAccount.id },
      data: { balance: toAccount.balance + amount },
    });

    const transaction = await prisma.transaction.create({
      data: {
        from_account: fromAccount.id,
        to_account: toAccount.key,
        amount,
      },
    });

    reply.status(201).send(transaction);
  } catch (error) {
    app.log.error("Error processing transaction:", error);
    reply.status(500).send({ error: "Internal server error" });
  }
});

app.get("/accounts/:id/transactions/", async (request, reply) => {
  const { id } = request.params;

  try {
    const account = await prisma.account.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!account) {
      return reply.status(404).send({ error: "Account not found" });
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [
          { from_account: account.id },
          { to_account: account.key },
        ],
      },
    });

    reply.send(transactions);
  } catch (error) {
    app.log.error("Error fetching transactions for account:", error);
    reply.status(500).send({ error: "Internal server error" });
  }
});

const start = async () => {
  try {
    await app.listen({ port: ACCOUNT_PORT, host: "0.0.0.0" });
    app.log.info(`Account service running on http://0.0.0.0:${ACCOUNT_PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();