kubectl create namespace monitoring

helm install prometheus prometheus-community/prometheus \
  --namespace monitoring
