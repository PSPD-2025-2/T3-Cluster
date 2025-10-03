const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const { PrismaClient } = require("@prisma/client");
const path = require("path");

const prisma = new PrismaClient();

const PROTO_PATH = path.join(__dirname, "..", "protos", "client.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
  includeDirs: [
    path.join(__dirname, "..", "protos"),
    require("google-proto-files").getProtoPath(),
  ]
});

const clientProto = grpc.loadPackageDefinition(packageDefinition);

const client = clientProto.client;

const clientService = {
  ListClients: async (call) => {
    try {
      const clients = await prisma.client.findMany();
      console.log(clients);
      clients.forEach(client => call.write(client));
      call.end();
    } catch (error) {
      console.error("Error fetching clients:", error);
      call.emit('error', {
        code: grpc.status.INTERNAL,
        details: "Internal server error",
      });
    }
  },

  GetClient: async (call, callback) => {
    try {
      const client = await prisma.client.findUnique({
        where: { id: call.request.id },
      });
      if (client) {
        console.log(client);
        callback(null, client);
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
  
  CreateClient: async (call, callback) => {
    try {
      const client = await prisma.client.create({
        data: { name: call.request.name, email: call.request.email },
      });
      console.log(client);
      callback(null, client);
    } catch (error) {
      console.error("Error creating client:", error);
      callback({
        code: grpc.status.INTERNAL,
        details: "Internal server error",
      });
    }
  },
  
  UpdateClient: async (call, callback) => {
    try {
      const client = await prisma.client.update({
        where: { id: call.request.id },
        data: { name: call.request.name, email: call.request.email },
      });
      console.log(client);
      callback(null, client);
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
  
  DeleteClient: async (call, callback) => {
    try {
      await prisma.client.delete({
        where: { id: call.request.id },
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
  server.addService(client.ClientService.service, clientService);
  server.bindAsync(
    "0.0.0.0:50051",
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
      if (error) {
        console.error("Filed to bind server:", error);
        return;
      }
      server.start();
      console.log("gRPC server running at http://0.0.0.0:50051");
    }
  );

}

main();
