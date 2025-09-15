# Guide de déploiement

## Prérequis
- Docker >= 20.x et Docker Compose
- Node.js >= 18.x (pour développement local)
- Accès à un cluster Kubernetes (optionnel mais recommandé pour la production)
- Accès à un service de gestion de secrets (Vault, AWS Secrets Manager, Azure Key Vault)

## Déploiement local (Docker Compose)

```bash
cp .env.example .env
# Adapter les variables (JWT_SECRET, DATABASE_URL, etc.)
docker compose up --build
```

Services exposés :
- Frontend : http://localhost:3000
- API Gateway : http://localhost:8080
- PostgreSQL : port 5432 (avec volume persistant)

## Structure Docker

- Chaque microservice dispose d'un `Dockerfile` basé sur `node:18-alpine` avec création d'un utilisateur non-root.
- Le frontend est construit via `next build` puis servi avec `next start`.
- Le gateway assure la terminaison TLS en production (derrière un reverse proxy type Traefik/Nginx).

## Déploiement staging/production (Kubernetes)

1. Construire et pousser les images :
   ```bash
   docker build -t registry.example.com/health/auth-service:1.0.0 backend/services/auth-service
   # Répéter pour chaque service / frontend
   docker push registry.example.com/health/auth-service:1.0.0
   ```
2. Appliquer les manifests Kubernetes (fichiers exemples dans `deploy/k8s`) :
   ```bash
   kubectl apply -f deploy/k8s/postgres.yaml
   kubectl apply -f deploy/k8s/backend
   kubectl apply -f deploy/k8s/frontend
   ```
3. Configurer l'ingress (TLS, WAF, limites de débit).
4. Activer l'autoscaling HPA sur CPU/RAM et latence.
5. Planifier les sauvegardes PostgreSQL via Velero ou pgBackRest.

## Gestion des secrets

- Variables sensibles dans `.env` non versionné (voir `.env.example`).
- Utilisation recommandée de HashiCorp Vault + agents sidecar pour l'injection dynamique.
- Rotation des clés d'encryption et des certificats (ACME/Let's Encrypt ou PKI interne).

## Observabilité

- Deploy `prometheus` + `grafana` pour la collecte de métriques.
- Configurer les dashboards fournis (`deploy/observability/*`).
- Exporter les logs structurés vers un ELK/EFK stack.

## Stratégie de mises à jour

- CI/CD (GitHub Actions) déclenche : lint -> tests -> build -> scan -> déploiement.
- Déploiement progressif (canary/blue-green) via Argo Rollouts ou Flagger.
- Rollback automatisé en cas d'échec (monitoring latence/error rate).

## Sauvegardes et reprise

- Sauvegardes PostgreSQL quotidiennes + WAL shipping, rétention 30 jours.
- Snapshots chiffrés pour le stockage objets (documents médicaux).
- Tests de restauration trimestriels documentés.

## Sécurité

- Images signées (Cosign) + Policy Gatekeeper.
- Scans de vulnérabilité (Trivy/Grype) intégrés au pipeline.
- Politique réseau Zero-Trust (NetworkPolicies Kubernetes).
- WAF/IDS (ModSecurity, Cloudflare) devant le gateway.

