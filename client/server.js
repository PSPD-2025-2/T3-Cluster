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
    const clients = await prisma.client.findMany();
    console.log(clients);
    for (const client of clients) {
      call.write({client_name: client.name, client_email: client.email});
    }
    call.end();
  },

  GetClient: async (call, callback) => {
    const client = await prisma.client.findUnique({
      where: { id: parseInt(call.request.client_id) },
    });
    callback(null, {client_name: client.name, client_email: client.email} || { client_id: 0, client_name: "Not Found", client_email: "" });
  },
  CreateClient: async (call, callback) => {
    const client = await prisma.client.create({
      data: { name: call.request.client_name, email: call.request.client_email },
    });
    callback(null, client);
  },
  UpdateClient: async (call, callback) => {
    const client = await prisma.client.update({
      where: { id: parseInt(call.request.client_id) },
      data: { name: call.request.client_name, email: call.request.client_email },
    });
    callback(null, client);
  },
  DeleteClient: async (call, callback) => {
    await prisma.client.delete({
      where: { id: parseInt(call.request.client_id) },
    });
    callback(null, {});
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
