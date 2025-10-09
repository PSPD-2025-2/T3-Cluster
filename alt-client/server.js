const fastify = require("fastify");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const app = fastify({ logger: true });

const CLIENT_PORT = process.env.CLIENT_PORT || 50051;

app.post("/login/", async (request, reply) => {
  const { email, password } = request.body;

  try {
    const client = await prisma.client.findUnique({
      where: { email },
    });

    if (client && client.password === password) {
      reply.send({
        id: client.id,
        name: client.name,
        email: client.email,
      });
    } else {
      reply.status(401).send({ error: "Invalid email or password" });
    }
  } catch (error) {
    app.log.error("Error during login:", error);
    reply.status(500).send({ error: "Internal server error" });
  }
});

app.get("/clients/", async (request, reply) => {
  try {
    const clients = await prisma.client.findMany();
    reply.send(clients);
  } catch (error) {
    app.log.error("Error fetching clients:", error);
    reply.status(500).send({ error: "Internal server error" });
  }
});

app.get("/clients/:id/", async (request, reply) => {
  const { id } = request.params;

  try {
    const client = await prisma.client.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (client) {
      reply.send(client);
    } else {
      reply.status(404).send({ error: "Client not found" });
    }
  } catch (error) {
    app.log.error("Error fetching client:", error);
    reply.status(500).send({ error: "Internal server error" });
  }
});

app.post("/clients/", async (request, reply) => {
  const { name, email, password } = request.body;

  try {
    const newClient = await prisma.client.create({
      data: { name, email, password },
    });
    reply.status(201).send(newClient);
  } catch (error) {
    app.log.error("Error creating client:", error);
    reply.status(500).send({ error: "Internal server error" });
  }
});

app.patch("/clients/:id/", async (request, reply) => {
  const { id } = request.params;
  const { name, email, password } = request.body;
  const data = {};

  if (name !== undefined) data.name = name;
  if (email !== undefined) data.email = email;
  if (password !== undefined) data.password = password;

  try {
    const updatedClient = await prisma.client.update({
      where: { id: parseInt(id, 10) },
      data: data,
    });
    reply.send(updatedClient);
  } catch (error) {
    if (error.code === 'P2025') {
      reply.status(404).send({ error: "Client not found" });
      return;
    }
    app.log.error("Error updating client:", error);
    reply.status(500).send({ error: "Internal server error" });
  }
});

app.delete("/clients/:id/", async (request, reply) => {
  const { id } = request.params;

  try {
    await prisma.client.delete({
      where: { id: parseInt(id, 10) },
    });
    reply.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      reply.status(404).send({ error: "Client not found" });
      return;
    }
    app.log.error("Error deleting client:", error);
    reply.status(500).send({ error: "Internal server error" });
  }
});

const start = async () => {
  try {
    await app.listen({port: CLIENT_PORT, host: "0.0.0.0"});
    app.log.info(`Server listening on http://0.0.0.0:${CLIENT_PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();