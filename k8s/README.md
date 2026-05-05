# NexTalk — Kubernetes (k3s) Deployment

## Требования

| Инструмент | Версия |
|:--|:--|
| k3s | v1.30+ |
| kubectl | v1.30+ |
| Docker | 25+ |

---

## Шаг 1 — Установка k3s (Traefik отключён)

```bash
curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC="--disable=traefik" sh -
```

Проверка:
```bash
sudo kubectl get nodes
# → STATUS: Ready
```

Для работы без `sudo` скопируй kubeconfig:
```bash
mkdir -p ~/.kube
sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
sudo chown $(id -u):$(id -g) ~/.kube/config
```

---

## Шаг 2 — Nginx Ingress Controller

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.11.0/deploy/static/provider/cloud/deploy.yaml
```

Дождись готовности:
```bash
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=120s
```

---

## Шаг 3 — Сборка и загрузка образов

Собери образы и импортируй в k3s (без отдельного registry):
```bash
docker build -t nextalk/guild-service:latest      ./src/guild-service
docker build -t nextalk/messaging-service:latest  ./src/messaging-service
docker build -t nextalk/voice-service:latest      ./src/voice-service
docker build -t nextalk/websocket-gateway:latest  ./src/websocket-gateway

# Импорт в containerd k3s
for svc in guild-service messaging-service voice-service websocket-gateway; do
  docker save nextalk/$svc:latest | sudo k3s ctr images import -
done
```

> Альтернатива: пушни в Docker Hub и убери `imagePullPolicy: IfNotPresent` из манифестов.

---

## Шаг 4 — Конфигурация окружения

Отредактируй `k8s/01-configmap.yaml` — задай внешний адрес узла:
```yaml
data:
  ZITADEL_DOMAIN: "192.168.1.100"   # IP или hostname k3s-узла
  ZITADEL_EXTERNALPORT: "80"        # порт Nginx Ingress (по умолчанию 80)
```

Отредактируй `k8s/01-secrets.yaml` — замени дев-значения на продакшн (если нужно):
```yaml
stringData:
  postgres-password: "<strong-password>"
  zitadel-masterkey: "<exactly-32-characters>"
```

---

## Шаг 5 — Деплой

```bash
kubectl apply -f k8s/
```

Статус подов:
```bash
kubectl get pods -n nextalk -w
```

Все поды должны перейти в `Running` / `Ready`. PostgreSQL и Zitadel стартуют дольше (~60-90 сек).

---

## Шаг 6 — Проверка

### Health checks
```bash
# Все сервисы
for port in 5001 5002 5003 5004; do
  kubectl exec -n nextalk deploy/guild-service -- curl -s http://localhost:$port/healthz 2>/dev/null || true
done

# Через Ingress (из хост-системы)
curl http://localhost/api/guilds/health
curl http://localhost/.well-known/openid-configuration
```

### Grafana
Открой в браузере: `http://<ZITADEL_DOMAIN>/monitoring/grafana`  
Логин: `admin` / `admin` (из secrets)

### Prometheus
```bash
kubectl port-forward -n nextalk svc/prometheus 9090:9090
```
Открой: `http://localhost:9090`

---

## Переменные окружения

| Переменная | Источник | Описание |
|:--|:--|:--|
| `ZITADEL_DOMAIN` | ConfigMap `nextalk-config` | Внешний hostname/IP для OIDC redirect |
| `ZITADEL_EXTERNALPORT` | ConfigMap `nextalk-config` | Порт Nginx Ingress (обычно `80`) |
| `ZITADEL_PUBLIC_SCHEME` | ConfigMap `nextalk-config` | `http` или `https` |
| `postgres-password` | Secret `nextalk-secrets` | Пароль PostgreSQL |
| `postgres-dsn-nextalk` | Secret `nextalk-secrets` | Npgsql DSN для .NET-сервисов |
| `postgres-dsn-zitadel` | Secret `nextalk-secrets` | libpq DSN для Zitadel |
| `livekit-api-key` | Secret `nextalk-secrets` | LiveKit API ключ |
| `livekit-secret-key` | Secret `nextalk-secrets` | LiveKit Secret ключ |
| `zitadel-masterkey` | Secret `nextalk-secrets` | Мастер-ключ Zitadel (ровно 32 символа) |
| `grafana-admin-password` | Secret `nextalk-secrets` | Пароль Grafana admin |

---

## Структура k8s/

| Файл | Содержимое |
|:--|:--|
| `00-namespace.yaml` | Namespace `nextalk` |
| `01-configmap.yaml` | Несекретная конфигурация (домен, порты) |
| `01-secrets.yaml` | Секреты (пароли, ключи) |
| `02-postgres.yaml` | PostgreSQL StatefulSet + PVC + Service |
| `03-redis.yaml` | Redis Deployment + Service |
| `04-livekit.yaml` | LiveKit ConfigMap + Deployment + Service |
| `05-zitadel.yaml` | Zitadel StatefulSet (api + login) + Service |
| `06-guild-service.yaml` | Guild Service Deployment (replicas: 2) + Service |
| `07-messaging-service.yaml` | Messaging Service Deployment + Service |
| `08-voice-service.yaml` | Voice Service Deployment + Service |
| `09-websocket-gateway.yaml` | WebSocket Gateway Deployment + Service |
| `10-prometheus.yaml` | Prometheus ConfigMap + PVC + Deployment + Service |
| `11-grafana.yaml` | Grafana ConfigMap + PVC + Deployment + Service |
| `12-ingress.yaml` | Nginx Ingress (все маршруты) |

---

## SRE: Redis distributed cache

`guild-service` запускается в **2 репликах** — обе используют одну и ту же базу Redis (db=1).  
Это демонстрирует распределённый кеш: запрос к любому поду попадает в общий IDistributedCache.

```bash
# Убедись что оба пода используют Redis
kubectl get pods -n nextalk -l app=guild-service
# → 2 пода Running

# Проверь readiness (Redis health check входит в /readyz)
kubectl exec -n nextalk deploy/guild-service -- curl -s http://localhost:5001/readyz
```

---

## SRE: JSON-логи

Все сервисы пишут JSON-логи через Serilog + CompactJsonFormatter:

```bash
# Просмотр логов guild-service (оба пода)
kubectl logs -n nextalk -l app=guild-service --all-containers --follow

# Пример лога (позитивный — запрос выполнен):
# {"@t":"2026-01-01T12:00:00.000Z","@mt":"HTTP GET /api/guilds responded 200 in 12.3ms","CorrelationId":"req-abc","MachineName":"guild-service-7d4b-xk9p",...}

# Пример лога (негативный — ошибка):
# {"@t":"2026-01-01T12:00:01.000Z","@l":"Error","@mt":"Unhandled exception","@x":"System.Exception: ...","MachineName":"guild-service-7d4b-xk9p",...}
```

---

## Удаление

```bash
kubectl delete namespace nextalk
```

> Это удалит все ресурсы включая PersistentVolumeClaims. Данные PostgreSQL и Grafana будут потеряны.
