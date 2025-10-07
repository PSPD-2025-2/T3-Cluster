import contextlib
from typing import List
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

import grpc
from client_pb2 import ClientRequest, CreateClientRequest, UpdateClientRequest, LoginRequest
from client_pb2_grpc import ClientServiceStub
from account_pb2 import AccountRequest, CreateAccountRequest, UpdateAccountRequest, SendMoneyRequest
from account_pb2_grpc import AccountServiceStub
import google.protobuf.empty_pb2 as empty
import os

CLIENT_GRPC_CHANNEL = None
CLIENT_STUB = None
CLIENT_HOST = os.getenv('CLIENT_GRPC_HOST', 'localhost')
CLIENT_PORT = os.getenv('CLIENT_GRPC_PORT', '50051')

ACCOUNT_GRPC_CHANNEL = None
ACCOUNT_STUB = None
ACCOUNT_HOST = os.getenv('ACCOUNT_GRPC_HOST', 'localhost')
ACCOUNT_PORT = os.getenv('ACCOUNT_GRPC_PORT', '50052')

class LoginModel(BaseModel):
    email: str
    password: str

class LoginResponseModel(BaseModel):
    id: int
    name: str
    email: str
    account: int
    key: str
    balance: float

class ClientModel(BaseModel):
    id: int
    name: str
    email: str

class CreateClientModel(BaseModel):
    name: str
    email: str
    password: str

class AccountModel(BaseModel):
    id: int
    client: int
    key: str
    balance: float

class CreateAccountModel(BaseModel):
    client: int
    key: str
    balance: float

class TransactionModel(BaseModel):
    id: int
    from_account: int
    to_account: str
    amount: float
    timestamp: str

class CreateTransactionModel(BaseModel):
    from_account: int
    to_account: str
    amount: float

def handle_grpc_error(e: grpc.RpcError):
    print(f"gRPC error: {e.code()} - {e.details()}")
    if e.code() == grpc.StatusCode.FAILED_PRECONDITION:
        raise HTTPException(status_code=400, detail=e.details())
    elif e.code() == grpc.StatusCode.NOT_FOUND:
        raise HTTPException(status_code=404, detail=e.details())
    elif e.code() == grpc.StatusCode.ALREADY_EXISTS:
        raise HTTPException(status_code=409, detail=e.details())
    elif e.code() == grpc.StatusCode.UNAUTHENTICATED:
        raise HTTPException(status_code=401, detail=e.details())
    elif e.code() == grpc.StatusCode.UNAVAILABLE:
        raise HTTPException(status_code=503, detail="gRPC service unavailable")
    else:
        raise HTTPException(status_code=500, detail="Internal gRPC error: " + str(e.details()))

@contextlib.asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Initializes the gRPC connection before the app starts (startup)
    and closes it when the app shuts down (shutdown).
    """
    global CLIENT_GRPC_CHANNEL, CLIENT_STUB, ACCOUNT_GRPC_CHANNEL, ACCOUNT_STUB
    print(f"Connecting to client gRPC server at {CLIENT_HOST}:{CLIENT_PORT}...")
    print(f"Connecting to account gRPC server at {ACCOUNT_HOST}:{ACCOUNT_PORT}...")

    CLIENT_GRPC_CHANNEL = grpc.insecure_channel(f"{CLIENT_HOST}:{CLIENT_PORT}")
    CLIENT_STUB = ClientServiceStub(CLIENT_GRPC_CHANNEL)

    ACCOUNT_GRPC_CHANNEL = grpc.insecure_channel(f"{ACCOUNT_HOST}:{ACCOUNT_PORT}")
    ACCOUNT_STUB = AccountServiceStub(ACCOUNT_GRPC_CHANNEL)
    
    print("gRPC connection established.")

    yield

    if CLIENT_GRPC_CHANNEL:
        print("Closing client gRPC connection...")
        CLIENT_GRPC_CHANNEL.close()
        print("client gRPC connection closed.")

    if ACCOUNT_GRPC_CHANNEL:
        print("Closing account gRPC connection...")
        ACCOUNT_GRPC_CHANNEL.close()
        print("account gRPC connection closed.")

app = FastAPI(lifespan=lifespan)

@app.post("/login/", response_model=LoginResponseModel)
def login(login: LoginModel):
    """Realiza login via gRPC"""
    if not (CLIENT_STUB or ACCOUNT_STUB):
        raise HTTPException(status_code=503, detail="gRPC service not initialized")
    try:
        grpc_client_request = LoginRequest(email=login.email, password=login.password)
        client_response = CLIENT_STUB.Login(grpc_client_request)
        grpc_account_request = AccountRequest(id=client_response.id)
        account_response = ACCOUNT_STUB.GetAccountByClient(grpc_account_request)
        return LoginResponseModel(
            id=client_response.id,
            name=client_response.name,
            email=client_response.email,
            account=account_response.id,
            key=account_response.key,
            balance=account_response.balance
        )

    except grpc.RpcError as e:
        handle_grpc_error(e)

@app.get("/clients/", response_model=List[ClientModel])
def get_all_clients():
    """Busca e retorna todos os clientes via gRPC"""
    if not CLIENT_STUB:
        raise HTTPException(status_code=503, detail="gRPC service not initialized")
    try:
        responses = CLIENT_STUB.ListClients(empty.Empty())
        return list(responses)
    except grpc.RpcError as e:
        handle_grpc_error(e)

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
        handle_grpc_error(e)
    
@app.post("/clients/", response_model=ClientModel)
def create_client(client: CreateClientModel):
    """Cria um novo cliente via gRPC"""
    if not CLIENT_STUB:
        raise HTTPException(status_code=503, detail="gRPC service not initialized")
    try:
        grpc_request = CreateClientRequest(name=client.name, email=client.email, password=client.password)
        response = CLIENT_STUB.CreateClient(grpc_request)
        return response
    except grpc.RpcError as e:
        handle_grpc_error(e)
    
@app.patch("/clients/{id}", response_model=ClientModel)
def patch_client(id: int, client: CreateClientModel):
    """Atualiza um cliente via gRPC"""
    if not CLIENT_STUB:
        raise HTTPException(status_code=503, detail="gRPC service not initialized")
    try:
        grpc_request = UpdateClientRequest(id=id, name=client.name, email=client.email, password=client.password)
        response = CLIENT_STUB.UpdateClient(grpc_request)
        return response
    except grpc.RpcError as e:
        handle_grpc_error(e)

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
        handle_grpc_error(e)

@app.get("/accounts/", response_model=List[AccountModel])
def get_all_accounts():
    """Busca e retorna todas as contas via gRPC"""
    if not ACCOUNT_STUB:
        raise HTTPException(status_code=503, detail="gRPC service not initialized")
    try:
        responses = ACCOUNT_STUB.ListAccounts(empty.Empty())
        return list(responses)
    except grpc.RpcError as e:
        handle_grpc_error(e)

@app.get("/accounts/{id}", response_model=AccountModel)
def get_account(id: int):
    """Busca e retorna uma conta via gRPC"""
    if not ACCOUNT_STUB:
        raise HTTPException(status_code=503, detail="gRPC service not initialized")
    try:
        grpc_request = AccountRequest(id=id)
        response = ACCOUNT_STUB.GetAccount(grpc_request)
        return response
    except grpc.RpcError as e:
        handle_grpc_error(e)
    
@app.post("/accounts/", response_model=AccountModel)
def create_account(account: CreateAccountModel):
    """Cria uma nova conta via gRPC"""
    if not ACCOUNT_STUB:
        raise HTTPException(status_code=503, detail="gRPC service not initialized")
    try:
        grpc_request = CreateAccountRequest(client=account.client, key=account.key, balance=account.balance)
        response = ACCOUNT_STUB.CreateAccount(grpc_request)
        return response
    except grpc.RpcError as e:
        handle_grpc_error(e)
    
@app.patch("/accounts/{id}", response_model=AccountModel)
def patch_account(id: int, account: CreateAccountModel):
    """Atualiza uma conta via gRPC"""
    if not ACCOUNT_STUB:
        raise HTTPException(status_code=503, detail="gRPC service not initialized")
    try:
        grpc_request = UpdateAccountRequest(id=id, client=account.client, key=account.key, balance=account.balance)
        response = ACCOUNT_STUB.UpdateAccount(grpc_request)
        return response
    except grpc.RpcError as e:
        handle_grpc_error(e)
    
@app.delete("/accounts/{id}")
def delete_account(id: int):
    """Apaga uma conta via gRPC"""
    if not ACCOUNT_STUB:
        raise HTTPException(status_code=503, detail="gRPC service not initialized")
    try:
        grpc_request = AccountRequest(id=id)
        ACCOUNT_STUB.DeleteAccount(grpc_request)
        return {"detail": "Account deleted successfully."}
    except grpc.RpcError as e:
        handle_grpc_error(e)
    
@app.post("/transactions/", response_model=TransactionModel)
def create_transaction(transaction: CreateTransactionModel):
    """Cria uma nova transação via gRPC"""
    if not ACCOUNT_STUB:
        raise HTTPException(status_code=503, detail="gRPC service not initialized")
    try:
        grpc_request = SendMoneyRequest(from_account=transaction.from_account, to_account=transaction.to_account, amount=transaction.amount)
        response = ACCOUNT_STUB.SendMoney(grpc_request)
        return response
    except grpc.RpcError as e:
        handle_grpc_error(e)
        
@app.get("/accounts/{id}/transactions/", response_model=List[TransactionModel])
def get_transactions_by_account(id: int):
    """Busca todas as transações de um cliente"""
    if not ACCOUNT_STUB:
        raise HTTPException(status_code=503, detail="gRPC service not initialized")
    try:
        grpc_request = AccountRequest(id=id)
        response = ACCOUNT_STUB.ListTransactions(grpc_request)
        return list(response)
    except grpc.RpcError as e:
        handle_grpc_error(e)