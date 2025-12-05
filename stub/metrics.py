# metrics.py (ou dentro do main)

from prometheus_client import Counter, Histogram, start_http_server

# Exemplo de métricas
HTTP_REQUESTS_TOTAL = Counter(
    "http_requests_total",
    "Total de requisições HTTP recebidas pelo stub",
    ["method", "endpoint", "status"]
)

HTTP_REQUEST_DURATION_SECONDS = Histogram(
    "http_request_duration_seconds",
    "Latência das requisições HTTP no stub",
    ["method", "endpoint"],
    buckets=[0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5]
)

def start_metrics_server(port: int = 8001):
    # Isso sobe um HTTP server em /metrics
    start_http_server(port)
    print(f"Prometheus metrics server rodando em :{port}/metrics")
