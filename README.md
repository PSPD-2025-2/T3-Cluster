# T3 – Cluster Kubernetes, gRPC e Monitoramento

**Grupo**:

| Nome                | Matrícula  |
|---------------------|------------|
| Guilherme Westphall | 211061805  |
| Lucas Martins       | 221022088  |

---


## Vídeo 

[Vídeo de apresentação do T3](https://www.youtube.com/watch?v=OAVnJvgpjgg)

## Relatório

[Relatório do T3](./Relat%C3%B3rio%20T3%20-%20Kubernetes%2C%20gRPC%20e%20Monitoramento.pdf)


## Apresentação

[Apresentação T3 (slides)](./Monitoramento%20e%20Observabilidade%20em%20Cluster%20K8S.pdf)

## Visão geral da aplicação

A aplicação é um sistema bancário simples, dividido em microserviços:

- **Client Server (Node.js + gRPC)**  
  CRUD de clientes e autenticação (login).

- **Account Server (Node.js + gRPC)**  
  CRUD de contas, envio de dinheiro e listagem de transações.  
  Chama o `ClientService` via gRPC para validar o cliente antes de criar contas.

- **Stub (API Gateway – Python + FastAPI)**  
  Expõe endpoints **HTTP/REST** para o “mundo externo” e traduz as chamadas para gRPC, roteando para `client` e `account`.

- **Postgres**  
  Usado pelos serviços `client` e `account` via Prisma ORM (cada um com seu schema).

Arquivos `.proto` em `protos/` definem os serviços `ClientService` e `AccountService`, a partir dos quais são gerados os stubs gRPC usados pelos servidores e pelo stub.


## Objetivo do trabalho

O foco do trabalho não foi desenvolver a aplicação em si, mas **observar o comportamento de um cluster Kubernetes** executando essa aplicação sob carga, explorando:

- Efeito de **réplicas de microserviços** (`stub`, `client`, `account`).
- Efeito de **diferentes números de workers** no cluster.
- Uso de **autoscaling (HPA)**.
- Métricas de **throughput**, **latência**, **falhas** e **uso de recursos**.


## Cluster Kubernetes

O cluster foi criado com **kind (Kubernetes in Docker)** em um único host, simulando um ambiente multinode:

- 1 nó **control-plane**  
- 2 ou 4 nós **worker** (dependendo do cenário)

Os manifests da pasta `k8s/` definem:

- Deployments e Services para `client`, `account`, `stub` e `postgres`
- Namespace e secrets do banco
- (Em alguns cenários) Horizontal Pod Autoscaler (HPA) para `stub`, `client` e `account`


## Testes de carga com k6

Os testes de carga foram feitos com a ferramenta **k6**, usando scripts em `tests/` (por exemplo, `k6-heavy.js`, `k6-autoscaling.js`).

Todos os cenários executam, com variações de VUs e duração, um **fluxo completo**:

1. Criar cliente  
2. Criar conta  
3. Login  
4. Fazer transações  
5. Consultar transações  
6. Excluir conta e cliente

### Cenários avaliados

- **Baseline – 2 workers, 1 réplica por serviço**  
  Referência funcional, sem otimizações de escalonamento.

- **Réplica Stub – 2 workers, 3x `stub`**  
  Escala só a borda HTTP (API Gateway) para ver se o `stub` é gargalo.

- **Réplicas Serviços – 2 workers, 3x `stub`/`client`/`account`**  
  Escala toda a camada de aplicação, mantendo o Postgres fixo.

- **4 Workers – 4 workers, 1 réplica por serviço**  
  Aumenta só o número de nós do cluster, sem mudar réplicas.

- **4 Workers + 3 Réplicas – 4 workers, 3x `stub`/`client`/`account`**  
  Combina mais nós + mais réplicas para buscar maior throughput.

- **Autoscaling (HPA) – 2 workers, HPA em `stub`/`client`/`account`**  
  Usa Horizontal Pod Autoscaler para variar automaticamente o número de réplicas de acordo com uso de CPU.

Para cada cenário foram coletados principalmente:

- **Throughput** (`http_reqs/s`)  
- **Latência média** e **p95**  
- **Taxa de falhas HTTP** (`http_req_failed`)  
- **Falhas de negócio** (`checks_failed`)


## Monitoramento com Prometheus

### Papel do Prometheus

O **Prometheus** foi usado para:

- Coletar métricas do `stub-service` (ponto de entrada HTTP) e dos containers no cluster.
- Calcular, em tempo real:
  - **Throughput** total e por endpoint
  - **Latência média** e **latência P95**
  - **Uso de CPU e memória** dos pods do stub

Os gráficos e queries foram usados para correlacionar o que o k6 reportava com o comportamento interno do cluster (por exemplo, quando a CPU saturava, quando o P95 explodia, etc.).

### Exposição do endpoint `/metrics`

Para integrar a aplicação com o Prometheus:

1. O `stub-service` foi instrumentado com uma biblioteca de métricas HTTP (expondo um endpoint **`/metrics`**).  
2. Um `Service` Kubernetes (`stub-service`) expõe esse endpoint dentro do cluster.  
3. No Prometheus, o `scrape_config` inclui o serviço do stub como target, permitindo fazer *scrape* periódico de `/metrics`.

### Principais queries usadas

Alguns exemplos de consultas (queries) utilizadas na UI do Prometheus:

- **Throughput total (req/s):**

  ```promql
  sum(
    rate(http_requests_total{
      service="stub-service"
    }[15m])
  )
  ```

- **Throughput por endpoint:**

    ```promql
    sum by (endpoint)(
    rate(http_requests_total{
        service="stub-service"
    }[15m])
    )
    ```

- **Latência média**:

    ```promql
    sum(
    rate(http_request_duration_seconds_sum{
        service="stub-service"
    }[15m])
    )
    /
    sum(
    rate(http_request_duration_seconds_count{
        service="stub-service"
    }[15m])
    )
    ```

- **Latência P95**:

    ```promql
    histogram_quantile(
    0.95,
    sum by (le)(
        rate(http_request_duration_seconds_bucket{
        service="stub-service"
        }[15m])
    )
    )
    ```

- **CPU**:

    ```promql
    sum by (pod)(
    rate(container_cpu_usage_seconds_total{
        pod=~"stub-.*"
    }[5m])
    )
    ```

- **Memória**:

    ```promql
    sum by (pod)(
    container_memory_usage_bytes{
        pod=~"stub-.*"
    }
    )
    ```

## Resumo

Em conjunto, a aplicação gRPC, o cluster Kubernetes (via kind), o k6 e o Prometheus formam um pequeno laboratório para estudar:

- Como diferentes configurações de réplicas, workers e autoscaling afetam throughput, latência e erros.
- Como a observabilidade ajuda a identificar gargalos reais (como o banco de dados ou a saturação de CPU/memória) em um ambiente distribuído.

Este repositório concentra os manifests Kubernetes, scripts de teste k6, arquivos .proto e código dos microserviços usados nesses experimentos.