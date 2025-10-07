const grpc = require("@grpc/grpc-js");
const { PrismaClient } = require("@prisma/client");
const services = require("./account_grpc_pb");
const messages = require("./account_pb");
const { Empty } = require('google-protobuf/google/protobuf/empty_pb.js');

const prisma = new PrismaClient();

const accountService = {
  listAccounts: async (call) => {
    try {
      const accounts = await prisma.account.findMany();
      console.log(accounts);
      for (const account of accounts) {
        const response = new messages.AccountResponse();
        response.setId(account.id);
        response.setClient(account.client);
        response.setKey(account.key);
        response.setBalance(account.balance);
        call.write(response);
      }
      call.end();
    } catch (error) {
      console.error("Error fetching accounts:", error);
      call.emit('error', {
        code: grpc.status.INTERNAL,
        details: "Internal server error",
      });
    }
  },
  
  getAccount: async (call, callback) => {
    try {
      const account = await prisma.account.findUnique({
        where: { id: call.request.getId() },
      });
      if (account) {
        console.log(account);
        const response = new messages.AccountResponse();
        response.setId(account.id);
        response.setClient(account.client);
        response.setKey(account.key);
        response.setBalance(account.balance);
        callback(null, response);
      } else {
        console.log("Account not found");
        callback({
          code: grpc.status.NOT_FOUND,
          details: "Account not found",
        });
      }
    } catch (error) {
      console.error("Error fetching account:", error);
      callback({
        code: grpc.status.INTERNAL,
        details: "Internal server error",
      });
    }
  },

  createAccount: async (call, callback) => {
    try {
      const account = await prisma.account.create({
        data: {
          client: call.request.getClient(),
          key: call.request.getKey(),
          balance: call.request.getBalance(),
        },
      });
      console.log("Account created:", account);
      const response = new messages.AccountResponse();
      response.setId(account.id);
      response.setClient(account.client);
      response.setKey(account.key);
      response.setBalance(account.balance);
      callback(null, response);
    } catch (error) {
      console.error("Error creating account:", error);
      if (error.code === 'P2002') { // Prisma error code for unique constraint violation
        callback({
          code: grpc.status.ALREADY_EXISTS,
          details: "Account with this key already exists",
        });
      } else {
        callback({
          code: grpc.status.INTERNAL,
          details: "Internal server error",
        });
      }
    }
  },

  updateAccount: async (call, callback) => {
    try {
      const account = await prisma.account.update({
        where: { id: call.request.getId() },
        data: {
          client: call.request.getClient(),
          key: call.request.getKey(),
          balance: call.request.getBalance(),
        },
      });
      console.log("Account updated:", account);
      const response = new messages.AccountResponse();
      response.setId(account.id);
      response.setClient(account.client);
      response.setKey(account.key);
      response.setBalance(account.balance);
      callback(null, response);
    } catch (error) {
      console.error("Error updating account:", error);
      callback({
        code: grpc.status.INTERNAL,
        details: "Internal server error",
      });
    }
  },

  deleteAccount: async (call, callback) => {
    try {
      await prisma.account.delete({
        where: { id: call.request.getId() },
      });
      console.log("Account deleted:", call.request.getId());
      callback(null, new Empty());
    } catch (error) {
      console.error("Error deleting account:", error);
      if (error.code === "P2025") {
        callback({
          code: grpc.status.NOT_FOUND,
          details: "Account not found",
        });
      } else {
        callback({
          code: grpc.status.INTERNAL,
          details: "Internal server error",
        });
      }
    }
  },

  sendMoney: async (call, callback) => {
    try {
      const fromAccount = await prisma.account.findUnique({
        where: { id: call.request.getFromAccount() },
      });
      const toAccount = await prisma.account.findUnique({
        where: { key: call.request.getToAccount() },
      });

      if (!fromAccount) {
        return callback({
          code: grpc.status.NOT_FOUND,
          details: "Source account not found",
        });
      } else if (!toAccount) {
        return callback({
          code: grpc.status.NOT_FOUND,
          details: "Destination account not found",
        });
      }

      if (fromAccount.balance < call.request.getAmount()) {
        return callback({
          code: grpc.status.FAILED_PRECONDITION,
          details: "Insufficient funds in the source account",
        });
      }

      const updatedFromAccount = await prisma.account.update({
        where: { id: fromAccount.id },
        data: { balance: fromAccount.balance - call.request.getAmount() },
      });
      
      const updatedToAccount = await prisma.account.update({
        where: { id: toAccount.id },
        data: { balance: toAccount.balance + call.request.getAmount() },
      });

      const transaction = await prisma.transaction.create({
        data: {
          from_account: fromAccount.id,
          to_account: toAccount.key,
          amount: call.request.getAmount(),
        },
      });

      const response = new messages.TransactionResponse();
      response.setId(transaction.id);
      response.setFromAccount(transaction.from_account);
      response.setToAccount(transaction.to_account);
      response.setAmount(call.request.getAmount());
      response.setTimestamp(transaction.timestamp.toISOString());
      callback(null, response);
    } catch (error) {
      console.error("Error processing transaction:", error);
      callback({
        code: grpc.status.INTERNAL,
        details: "Internal server error",
      });
    }
  },

  listTransactions: async (call) => {
    try {
      
      const account = await prisma.account.findUnique({
        where: { id: call.request.getId() },
      });
      
      if (!account) {
        console.log("Account not found");
        call.emit('error', {
          code: grpc.status.NOT_FOUND,
          details: "Account not found",
        });
        return;
      }

      const transactions = await prisma.transaction.findMany({
        where: {
          OR: [
            { from_account: account.id },
            { to_account: account.key },
          ],
        },
      });
      console.log(transactions);
      for (const transaction of transactions) {
        const response = new messages.TransactionResponse();
        response.setId(transaction.id);
        response.setFromAccount(transaction.from_account);
        response.setToAccount(transaction.to_account);
        response.setAmount(transaction.amount);
        response.setTimestamp(transaction.timestamp.toISOString());
        call.write(response);
      }
      call.end();
    } catch (error) {
      console.error("Error fetching transactions:", error);
      call.emit('error', {
        code: grpc.status.INTERNAL,
        details: "Internal server error",
      });
    }
  },
};

function main() {
  const server = new grpc.Server();
  server.addService(services.AccountServiceService, accountService);
  server.bindAsync(
      "0.0.0.0:50052",
      grpc.ServerCredentials.createInsecure(),
      (error, port) => {
        if (error) {
          console.error("Filed to bind server:", error);
          return;
        }
        console.log("gRPC server running at http://0.0.0.0:50052");
      }
    );
}

main();