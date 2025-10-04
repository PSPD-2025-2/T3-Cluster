import contextlib
from typing import List, Union
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

import grpc
from client_pb2 import ClientRequest, CreateClientRequest, UpdateClientRequest
from client_pb2_grpc import ClientServiceStub
import google.protobuf.empty_pb2 as empty
import os

GRPC_CHANNEL = None
CLIENT_STUB = None
HOST = os.getenv('GRPC_HOST', 'localhost')
PORT = os.getenv('GRPC_PORT', '8000')

class ClientModel(BaseModel):
    id: int
    name: str
    email: str

class CreateClientModel(BaseModel):
    name: str
    email: str

@contextlib.asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Initializes the gRPC connection before the app starts (startup)
    and closes it when the app shuts down (shutdown).
    """
    global GRPC_CHANNEL, CLIENT_STUB
    print(f"Connecting to gRPC server at {HOST}:{PORT}...")

    GRPC_CHANNEL = grpc.insecure_channel(f"{HOST}:{PORT}")
    CLIENT_STUB = ClientServiceStub(GRPC_CHANNEL)
    print("gRPC connection established.")

    yield

    if GRPC_CHANNEL:
        print("Closing gRPC connection...")
        GRPC_CHANNEL.close()
        print("gRPC connection closed.")

app = FastAPI(lifespan=lifespan)

@app.get("/clients/", response_model=List[ClientModel])
def get_all_clients():
    """Busca e retorna todos os clientes via gRPC"""
    if not CLIENT_STUB:
        raise HTTPException(status_code=503, detail="gRPC service not initialized")
    try:
        responses = CLIENT_STUB.ListClients(empty.Empty())
        return list(responses)
    except grpc.RpcError as e:
        print(f"gRPC error: {e}")
        raise HTTPException(status_code=500, detail="gRPC service error or unavailable")

@app.get("/clients/{id}", response_model=ClientModel)
def get_client(id: int):
    """Busca e retorna um cliente via gRPC"""
    if not CLIENT_STUB:
        raise HTTPException(status_code=503, detail="gRPC service not initialized")
    try:
        grpc_request = ClientRequest(id=id)
        response = CLIENT_STUB.GetClient(grpc_request)
        return response
    except grpc.RpcError as e:
        print(f"gRPC error: {e}")
        raise HTTPException(status_code=500, detail="gRPC service error or unavailable")
    
@app.post("/clients/", response_model=ClientModel)
def create_client(client: CreateClientModel):
    """Cria um novo cliente via gRPC"""
    if not CLIENT_STUB:
        raise HTTPException(status_code=503, detail="gRPC service not initialized")
    try:
        grpc_request = CreateClientRequest(name=client.name, email=client.email)
        response = CLIENT_STUB.CreateClient(grpc_request)
        return response
    except grpc.RpcError as e:
        print(f"gRPC error: {e}")
        raise HTTPException(status_code=500, detail="gRPC service error or unavailable")
    
@app.patch("/clients/{id}", response_model=ClientModel)
def patch_client(id: int, client: CreateClientModel):
    """Atualiza um cliente via gRPC"""
    if not CLIENT_STUB:
        raise HTTPException(status_code=503, detail="gRPC service not initialized")
    try:
        grpc_request = UpdateClientRequest(id=id, name=client.name, email=client.email)
        response = CLIENT_STUB.UpdateClient(grpc_request)
        return response
    except grpc.RpcError as e:
        print(f"gRPC error: {e}")
        raise HTTPException(status_code=500, detail="gRPC service error or unavailable")

@app.delete("/clients/{id}")
def delete_client(id: int):
    """Apaga um cliente via gRPC"""
    if not CLIENT_STUB:
        raise HTTPException(status_code=503, detail="gRPC service not initialized")
    try:
        grpc_request = ClientRequest(id=id)
        CLIENT_STUB.DeleteClient(grpc_request)
        return {"detail": "Client deleted successfully."}
    except grpc.RpcError as e:
        print(f"gRPC error: {e}")
        raise HTTPException(status_code=500, detail="gRPC service error or unavailable")

@app.get("/test/{test_id}")
def read_item(test_id: int, q: Union[str, None] = None):
    return {"test_id": test_id, "q": q}