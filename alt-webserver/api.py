import contextlib
from typing import List
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from starlette.middleware.cors import CORSMiddleware
import httpx
import os

CLIENT_HOST = os.getenv('CLIENT_HOST', 'localhost')
CLIENT_PORT = os.getenv('CLIENT_PORT', '50051')

ACCOUNT_HOST = os.getenv('ACCOUNT_HOST', 'localhost')
ACCOUNT_PORT = os.getenv('ACCOUNT_PORT', '50052')

HTTP_CLIENT = None

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

def handle_error(e: httpx.HTTPError):
    if isinstance(e, httpx.RequestError):
        raise HTTPException(status_code=503, detail="Service Unavailable")
    elif isinstance(e, httpx.HTTPStatusError) and e.response is not None:
        raise HTTPException(status_code=e.response.status_code, detail=e.response.text)
    else:
        raise HTTPException(status_code=500, detail="Internal Server Error")
    
@contextlib.asynccontextmanager
async def lifespan(app: FastAPI):
    global HTTP_CLIENT
    HTTP_CLIENT = httpx.AsyncClient()
    yield
    await HTTP_CLIENT.aclose()

app = FastAPI(lifespan=lifespan, debug=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/login/", response_model=LoginResponseModel)
async def login(login: LoginModel):
    """Realiza login"""
    try:
        client_response = await HTTP_CLIENT.post(f"http://{CLIENT_HOST}:{CLIENT_PORT}/login/", json=login.model_dump())
        client_response.raise_for_status()
        client = client_response.json()

        account_response = await HTTP_CLIENT.get(f"http://{ACCOUNT_HOST}:{ACCOUNT_PORT}/accounts/client/{client['id']}/")
        account_response.raise_for_status()
        account = account_response.json()

        return LoginResponseModel(
            id=client['id'],
            name=client['name'],
            email=client['email'],
            account=account['id'],
            key=account['key'],
            balance=account['balance']
        )

    except httpx.HTTPError as e:
        handle_error(e)

@app.get("/clients/", response_model=List[ClientModel])
async def get_all_clients():
    """Busca e retorna todos os clientes"""
    try:
        response = await HTTP_CLIENT.get(f"http://{CLIENT_HOST}:{CLIENT_PORT}/clients/")
        response.raise_for_status()
        return response.json()
    except httpx.HTTPError as e:
        handle_error(e)    

@app.get("/clients/{id}", response_model=ClientModel)
async def get_client(id: int):
    """Busca e retorna um cliente"""
    try:
        response = await HTTP_CLIENT.get(f"http://{CLIENT_HOST}:{CLIENT_PORT}/clients/{id}/")
        response.raise_for_status()
        return response.json()
    except httpx.HTTPError as e:
        handle_error(e)   
    
@app.post("/clients/", response_model=ClientModel)
async def create_client(client: CreateClientModel):
    """Cria um novo cliente"""
    try:
        response = await HTTP_CLIENT.post(f"http://{CLIENT_HOST}:{CLIENT_PORT}/clients/", json=client.model_dump())
        response.raise_for_status()
        return response.json()
    except httpx.HTTPError as e:
        handle_error(e)
    
@app.patch("/clients/{id}", response_model=ClientModel)
async def patch_client(id: int, client: CreateClientModel):
    """Atualiza um cliente"""
    try:
        response = await HTTP_CLIENT.patch(f"http://{CLIENT_HOST}:{CLIENT_PORT}/clients/{id}/", json=client.model_dump())
        response.raise_for_status()
        return response.json()
    except httpx.HTTPError as e:
        handle_error(e)

@app.delete("/clients/{id}")
async def delete_client(id: int):
    """Apaga um cliente"""
    try:
        response = await HTTP_CLIENT.delete(f"http://{CLIENT_HOST}:{CLIENT_PORT}/clients/{id}/")
        response.raise_for_status()
        return {"detail": "Client deleted successfully."}
    except httpx.HTTPError as e:
        handle_error(e)

@app.get("/accounts/", response_model=List[AccountModel])
async def get_all_accounts():
    """Busca e retorna todas as contas"""
    try:
        response = await HTTP_CLIENT.get(f"http://{ACCOUNT_HOST}:{ACCOUNT_PORT}/accounts/")
        response.raise_for_status()
        return response.json()
    except httpx.HTTPError as e:
        handle_error(e)

@app.get("/accounts/{id}", response_model=AccountModel)
async def get_account(id: int):
    """Busca e retorna uma conta"""
    try:
        response = await HTTP_CLIENT.get(f"http://{ACCOUNT_HOST}:{ACCOUNT_PORT}/accounts/{id}/")
        response.raise_for_status()
        return response.json()
    except httpx.HTTPError as e:
        handle_error(e)
    
@app.post("/accounts/", response_model=AccountModel)
async def create_account(account: CreateAccountModel):
    """Cria uma nova conta"""
    try:
        response = await HTTP_CLIENT.post(f"http://{ACCOUNT_HOST}:{ACCOUNT_PORT}/accounts/", json=account.model_dump())
        response.raise_for_status()
        return response.json()
    except httpx.HTTPError as e:
        handle_error(e)
    
@app.patch("/accounts/{id}", response_model=AccountModel)
async def patch_account(id: int, account: CreateAccountModel):
    """Atualiza uma conta"""
    try:
        response = await HTTP_CLIENT.patch(f"http://{ACCOUNT_HOST}:{ACCOUNT_PORT}/accounts/{id}/", json=account.model_dump())
        response.raise_for_status()
        return response.json()
    except httpx.HTTPError as e:
        handle_error(e)
    
@app.delete("/accounts/{id}")
async def delete_account(id: int):
    """Apaga uma conta"""
    try:
        response = await HTTP_CLIENT.delete(f"http://{ACCOUNT_HOST}:{ACCOUNT_PORT}/accounts/{id}/")
        response.raise_for_status()
        return {"detail": "Account deleted successfully."}
    except httpx.HTTPError as e:
        handle_error(e)
    
@app.post("/transactions/", response_model=TransactionModel)
async def create_transaction(transaction: CreateTransactionModel):
    """Cria uma nova transação"""
    try:
        response = await HTTP_CLIENT.post(f"http://{ACCOUNT_HOST}:{ACCOUNT_PORT}/transactions/", json=transaction.model_dump())
        response.raise_for_status()
        return response.json()
    except httpx.HTTPError as e:
        handle_error(e)
        
@app.get("/accounts/{id}/transactions/", response_model=List[TransactionModel])
async def get_transactions_by_account(id: int):
    """Busca todas as transações de um cliente"""
    try:
        response = await HTTP_CLIENT.get(f"http://{ACCOUNT_HOST}:{ACCOUNT_PORT}/accounts/{id}/transactions/")
        response.raise_for_status()
        return response.json()
    except httpx.HTTPError as e:
        handle_error(e)