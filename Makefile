NAMESPACE   := nextalk
SERVICES    := guild-service messaging-service voice-service websocket-gateway
NODE_IP     ?= $(shell kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="InternalIP")].address}' 2>/dev/null)

.DEFAULT_GOAL := help

.PHONY: help deploy wait status logs images import probe \
        helm-install helm-upgrade helm-uninstall teardown

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
	  | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

# ── Kubernetes (raw manifests) ────────────────────────────────────────

deploy: ## Apply all k8s manifests (kubectl apply -f k8s/)
	kubectl apply -f k8s/

wait: ## Wait until all pods in namespace are Ready
	kubectl wait --namespace $(NAMESPACE) \
	  --for=condition=ready pod --selector=app --timeout=300s

status: ## Show pod / service status
	kubectl get pods,svc -n $(NAMESPACE)

logs: ## Tail logs for a service  →  make logs SERVICE=guild-service
	kubectl logs -n $(NAMESPACE) -l app=$(SERVICE) -f --tail=100

teardown: ## Delete the entire namespace (destructive!)
	kubectl delete namespace $(NAMESPACE)

# ── Helm ─────────────────────────────────────────────────────────────

helm-install: ## Install via Helm (first time)
	helm install nextalk charts/nextalk/ \
	  --namespace $(NAMESPACE) --create-namespace

helm-upgrade: ## Upgrade existing Helm release
	helm upgrade nextalk charts/nextalk/ --namespace $(NAMESPACE)

helm-uninstall: ## Uninstall Helm release
	helm uninstall nextalk -n $(NAMESPACE)

# ── Local image build & k3s import ───────────────────────────────────

images: ## Build all Docker images locally
	$(foreach svc,$(SERVICES),docker build -t nextalk/$(svc):latest ./src/$(svc);)

import: images ## Build + import images into k3s containerd (no registry needed)
	$(foreach svc,$(SERVICES),docker save nextalk/$(svc):latest | sudo k3s ctr images import -;)

# ── Smoke test ───────────────────────────────────────────────────────

probe: ## Test Redis cache hit/miss endpoint  (requires NODE_IP or pass NODE_IP=x.x.x.x)
	@echo "--- request 1 (expect: source=origin) ---"
	curl -s http://$(NODE_IP)/api/guilds/probe
	@echo ""
	@echo "--- request 2 (expect: source=cache) ---"
	curl -s http://$(NODE_IP)/api/guilds/probe
	@echo ""
