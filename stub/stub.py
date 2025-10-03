import grpc
from client_pb2 import ClientRequest, CreateClientRequest, UpdateClientRequest
from client_pb2_grpc import ClientServiceStub
import google.protobuf.empty_pb2 as empty

def run():
    with grpc.insecure_channel('localhost:50051') as channel:
        stub = ClientServiceStub(channel)

        while True:
          print("gRPC client is set up and ready to make calls.\n")
          print("Choose a method to call:\n")
          print("Available methods:\n\t 1 - CreateClient\n\t 2 - GetClient\n\t 3 - UpdateClient\n\t 4 - DeleteClient\n\t 5 - ListClients\n")
          method = int(input("Enter method name: "))

          match method:
              case 1: # CreateClient
                  try:
                    name = input("Enter client name: ")
                    email = input("Enter client email: ")
                    new_client = CreateClientRequest(name=name, email=email)
                    response = stub.CreateClient(new_client)
                    print("CreateClient Response:", response)
                  
                  except grpc.RpcError as e:
                    print(f"gRPC Error: {e.code()} - {e.details()}")
              
              case 2: # GetClient
                  id = int(input("Enter client ID: "))
                  response = stub.GetClient(ClientRequest(id=id))
                  print("GetClient Response:", response)
              
              case 3: # UpdateClient
                  id = int(input("Enter client ID: "))
                  name = input("Enter new client name: ")
                  email = input("Enter new client email: ")
                  updated_client = UpdateClientRequest(id=id, name=name, email=email)
                  response = stub.UpdateClient(updated_client)
                  print("UpdateClient Response:", response)
              
              case 4: # DeleteClient
                  id = int(input("Enter client ID: "))
                  response = stub.DeleteClient(ClientRequest(id=id))
                  print("DeleteClient Response: Client deleted successfully.")
              
              case 5: # ListClients
                  responses = stub.ListClients(empty.Empty())
                  print("ListClients Response:")
                  print(list(responses))
              
              case _:
                  print("Invalid method selected.")
        

if __name__ == '__main__':
    run()