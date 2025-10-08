# Trabalho 1 PSPD - Microserviços & gRPC

Repositório do Trabalho 1 da disciplina de PSPD - Prof. Fernando William Cruz.

## Descrição

Este projeto implementa um sistema bancário simples usando uma arquitetura de microserviços. A comunicação principal entre os serviços é realizada via **gRPC**, enquanto um **API Gateway (Stub)** em Python expõe os endpoints HTTP para clientes externos.

Os microserviços são:
1.  **Client Server (Node.js)**: Gerenciamento de clientes.
2.  **Account Server (Node.js)**: Gerenciamento de contas e transações.
3.  **Stub (Python/FastAPI)**: API Gateway e tradução HTTP para gRPC.

## 📐 Arquitetura do Projeto

O sistema é dividido em três camadas principais:

| Componente | Tecnologia | Função | Comunicação | Porta Padrão |
| :--- | :--- | :--- | :--- | :--- |
| **Client Server** | Node.js, Prisma (PostgreSQL) | CRUD e autenticação de clientes. | gRPC | `50051` |
| **Account Server** | Node.js, Prisma (PostgreSQL) | CRUD de contas e lógica transacional. | gRPC (Externo) e gRPC (Interno: chama Client Server) | `50052` |
| **Stub (API Gateway)** | Python, FastAPI, gRPC-Python | Expõe endpoints HTTP e roteia para os serviços gRPC. | HTTP (Externo) e gRPC (Interno) | `8000` (interno), `30080` (externo via NodePort) |

### Database

Ambos os serviços (`client` e `account`) utilizam **PostgreSQL** com **Prisma** como ORM, cada um gerenciando seus próprios schemas (`client` e `account`).

## 📁 Estrutura do Repositório

```T1-WebServer-gRPCStub/
.
├── account/                  # Código do Microserviço Account
│   ├── prisma/               # Schemas e Migrations do Prisma (Account)
|   ├── Dockerfile            # Dockerfile do Account Server
│   ├── account_pb.js         # Arquivos gRPC gerados
│   ├── client_pb.js          # Arquivos gRPC do Client (para comunicação interna)
│   └── server.js             # Lógica do servidor gRPC Account
|
├── client/                   # Código do Microserviço Client
│   ├── prisma/               # Schemas e Migrations do Prisma (Client)
|   ├── Dockerfile            # Dockerfile do Client Server
|   ├── client_pb.js          # Arquivos gRPC gerados
│   └── server.js             # Lógica do servidor gRPC Client
|
├── k8s/                      # Configurações de Deploy para Kubernetes
│   ├── namespace.yaml        # Namespace para o deploy
│   ├── secrets-dev.yaml      # Secrets para o banco de dados
│   ├── postgres.yaml         # Deployment/Service do PostgreSQL
│   ├── client_server.yaml    # Deployment/Service do Client Server
│   ├── account_server.yaml   # Deployment/Service do Account Server
│   └── stub.yaml             # Deployment/Service do Stub (API Gateway)
|
├── protos/                   # Arquivos de definição de serviço gRPC (.proto)
│   ├── account.proto         # Definição do AccountService
│   └── client.proto          # Definição do ClientService
|
└── stub/                     # API Gateway (FastAPI)
    ├── Dockerfile            # Dockerfile do Stub
    ├── account_pb2.py        # Arquivos gRPC gerados
    ├── client_pb2.py         # Arquivos gRPC gerados
    ├── api.py                # Implementação dos Endpoints REST e lógica de roteamento gRPC
    └── requirements.txt      # Dependências Python
```

## 📦 Definições gRPC (Protobuf)

Os arquivos `.proto` definem a interface de serviço e as mensagens de dados:

- `protos/client.proto`: Define o `ClientService` com métodos para CRUD de clientes e Login.

- `protos/account.proto`: Define o `AccountService` com métodos para CRUD de contas, SendMoney e ListTransactions.

A definição de serviço no Account Server é um bom exemplo de inter-serviço (Service-to-Service): o método CreateAccount no Account Server faz uma chamada gRPC para o ClientService.GetClient no Client Server para validar a existência do cliente antes de criar a conta.

## 🛠️ Configuração e Deploy

### Pré-requisitos

Para rodar o projeto localmente ou em Kubernetes, você precisará de:
* Docker
* Kubernetes Cluster (Minikube)
* `kubectl` (para deploy no Kubernetes)

### Deploy no Kubernetes

O método de deploy recomendado usa os arquivos YAML fornecidos no diretório `k8s/`.

#### 1. Criar o Namespace e Secrets

Aplique o namespace e os secrets de banco de dados. O `secrets-dev.yaml` define o `client-db-url` e as credenciais padrão para o `postgres` (usuário: `postgres`, senha: `postgrespw`, db: `clientdb`).

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secrets-dev.yaml
```

#### 2. Deploy do Banco de Dados

Implante o PostgreSQL.

```bash
kubectl apply -f k8s/postgres.yaml
```

#### 3. Deploy dos Microserviços

Implante o servidor de clientes e o servidor de contas. Eles se comunicam internamente usando os nomes de serviço definidos em `k8s/` (`clientserver:50051` e `accountserver:50052`)

```bash
kubectl apply -f k8s/client_server.yaml
kubectl apply -f k8s/account_server.yaml
```

> **Nota sobre migrations**: As migrations do Prisma são aplicadas automaticamente no startup dos serviços.

#### 4. Deploy do Stub (API Gateway)

Implante o servidor FastAPI, que atua como API Gateway.

```bash
kubectl apply -f k8s/stub.yaml
```

O `stub-service` expõe a porta `30080` do nó (via `NodePort`). Para acessar a API:

```bash
# Obtenha o IP do seu nó (e.g., Minikube IP)
MINIKUBE_IP=$(minikube ip)
# URL de acesso: http://$MINIKUBE_IP:30080/docs
```

## 🚀 Endpoints da API Gateway (Stub)

O servidor Stub (FastAPI) expõe os seguintes endpoints HTTP, roteando as chamadas para os respectivos serviços gRPC:

Método |           Caminho            | Descrição                      |            Rota gRPC
:-----:|:----------------------------:|:-------------------------------|:------------------------------:
 POST  |           /login/            | Realiza o login do cliente.    |       ClientService.Login
 POST  |          /clients/           | Cria um novo cliente.          |   ClientService.CreateClient
  GET  |          /clients/           | Lista todos os clientes.       |    ClientService.ListClients
  GET  |        /clients/{id}         | Busca um cliente por ID.       |     ClientService.GetClient
 PATCH |        /clients/{id}         | Atualiza dados de um cliente.  |   ClientService.UpdateClient
DELETE |        /clients/{id}         | Apaga um cliente.              |   ClientService.DeleteClient
 POST  |          /accounts/          | Cria uma nova conta bancária.  |  AccountService.CreateAccount
  GET  |          /accounts/          | Lista todas as contas.         |   AccountService.ListAccounts
  GET  |        /accounts/{id}        | Busca uma conta por ID.        |    AccountService.GetAccount
 PATCH |        /accounts/{id}        | Atualiza dados de uma conta.   |  AccountService.UpdateAccount
DELETE |        /accounts/{id}        | Apaga uma conta.               |  AccountService.DeleteAccount
 POST  |        /transactions/        | Envia dinheiro entre contas.   |    AccountService.SendMoney
  GET  | /accounts/{id}/transactions/ | Lista transações de uma conta. | AccountService.ListTransactions