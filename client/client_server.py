import grpc
from common.client_pb2 import ClientResponse
from common.client_pb2_grpc import ClientServiceServicer, add_ClientServiceServicer_to_server
from concurrent import futures
from client.database import Database
import google.protobuf.empty_pb2 as empty

class ClientService(ClientServiceServicer):
    def __init__(self):
        super().__init__()
        self.db = Database()

    def ListClients(self, request, context):
        print("Listing all clients")
        if clients := self.db.selectall():
            for id, client in self.db.selectall().items():
                print({id : client})
                yield ClientResponse(client_name=client['name'], client_email=client['email'])
        else:
            print(clients)
            yield ClientResponse()

    def GetClient(self, request, context):
        try:
            cid = request.client_id
            client = self.db.select(cid)
            print(f"Found client: {client}")
            return ClientResponse(client_name=client['name'], client_email=client['email'])

        except ValueError:
            context.set_code(grpc.StatusCode.NOT_FOUND)
            context.set_details('Client not found')
            return ClientResponse()

    def CreateClient(self, request, context):
        try:
            self.db.insert(name=request.client_name, email=request.client_email)
            print(f"Created client: {request.client_name}, {request.client_email}")
            return ClientResponse(client_name=request.client_name, client_email=request.client_email)
        
        except ValueError as e:
            print(f"Error: {e}")
            context.set_code(grpc.StatusCode.ALREADY_EXISTS)
            context.set_details('Client with this email already exists')
            return ClientResponse()
    
    def UpdateClient(self, request, context):
        try:
            client = self.db.update(id=request.client_id, name=request.client_name, email=request.client_email)
            print(f"Updated client: {client}")
            return ClientResponse(client_name=client["name"], client_email=client["email"])
        
        except ValueError as e:
            print(f"Error: {e}")
            context.set_code(grpc.StatusCode.NOT_FOUND)
            context.set_details(e)
            return ClientResponse()

    def DeleteClient(self, request, context):
        try:
            self.db.delete(id=request.client_id)
            print(f"Deleted client with id={request.client_id}")
            return empty.Empty()
        except ValueError as e:
            print(f"Error: {e}")
            context.set_code(grpc.StatusCode.NOT_FOUND)
            context.set_details(e)
            return ClientResponse()
    

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    add_ClientServiceServicer_to_server(ClientService(), server)
    server.add_insecure_port('[::]:50051')
    server.start()
    print("ClientService server started on port 50051")
    server.wait_for_termination()

if __name__ == '__main__':
    serve()