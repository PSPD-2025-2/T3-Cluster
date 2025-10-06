const grpc = require("@grpc/grpc-js");
const { PrismaClient } = require("@prisma/client");
const services = require("./client_grpc_pb");
const messages = require("./client_pb");

const prisma = new PrismaClient();

const clientService = {
  listClients: async (call) => {
    try {
      const clients = await prisma.client.findMany();
      console.log(clients);
      for (const client of clients) {
        const response = new messages.ClientResponse();
        response.setId(client.id);
        response.setName(client.name);
        response.setEmail(client.email);
        call.write(response);
      }
      call.end();
    } catch (error) {
      console.error("Error fetching clients:", error);
      call.emit('error', {
        code: grpc.status.INTERNAL,
        details: "Internal server error",
      });
    }
  },

  getClient: async (call, callback) => {
    try {
      const client = await prisma.client.findUnique({
        where: { id: call.request.getId() },
      });
      if (client) {
        console.log(client);
        const response = new messages.ClientResponse();
        response.setId(client.id);
        response.setName(client.name);
        response.setEmail(client.email);
        callback(null, response);
      } else {
        console.log("Client not found");
        callback({
          code: grpc.status.NOT_FOUND,
          details: "Client not found",
        });
      }
    } catch (error) {
      console.error("Error fetching client:", error);
      callback({
        code: grpc.status.INTERNAL,
        details: "Internal server error",
      });
    }
  },
  
  createClient: async (call, callback) => {
    try {
      const client = await prisma.client.create({
        data: { name: call.request.getName(), email: call.request.getEmail() },
      });
      console.log(client);
      const response = new messages.ClientResponse();
      response.setId(client.id);
      response.setName(client.name);
      response.setEmail(client.email);
      callback(null, response);
    } catch (error) {
      console.error("Error creating client:", error);
      if (error.code === 'P2002') { // Prisma error code for unique constraint violation
        callback({
          code: grpc.status.ALREADY_EXISTS,
          details: "Client with this email already exists",
        });
      } else {
        callback({
          code: grpc.status.INTERNAL,
          details: "Internal server error",
        });}
    }
  },
  
  updateClient: async (call, callback) => {
    try {
      const client = await prisma.client.update({
        where: { id: call.request.getId() },
        data: { name: call.request.getName(), email: call.request.getEmail() },
      });
      console.log(client);
      const response = new messages.ClientResponse();
      response.setId(client.id);
      response.setName(client.name);
      response.setEmail(client.email);
      callback(null, response);
    } catch (error) {
      console.error("Error updating client:", error);
      if (error.code === 'P2025') { // Prisma error code for "Record to update not found."
        callback({
          code: grpc.status.NOT_FOUND,
          details: "Client not found",
        });
      } else {
        callback({
          code: grpc.status.INTERNAL,
          details: "Internal server error",
        });
      }
    } 
  },
  
  deleteClient: async (call, callback) => {
    try {
      await prisma.client.delete({
        where: { id: call.request.getId() },
      });
      callback(null, {});
    } catch (error) {
      console.error("Error deleting client:", error);
      if (error.code === 'P2025') { // Prisma error code for "Record to delete not found."
        callback({
          code: grpc.status.NOT_FOUND,
          details: "Client not found",
        });
      } else {
        callback({
          code: grpc.status.INTERNAL,
          details: "Internal server error",
        });
      }
    }
  },
};

function main() {
  const server = new grpc.Server();
  server.addService(services.ClientServiceService, clientService);
  server.bindAsync(
    "0.0.0.0:50051",
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
      if (error) {
        console.error("Filed to bind server:", error);
        return;
      }
      console.log("gRPC server running at http://0.0.0.0:50051");
    }
  );

}

main();
