# Plateforme de prise en charge sanitaire des employés

Cette plateforme full-stack fournit un parcours de santé complet pour les employés, depuis la déclaration des symptômes jusqu'à la prise en charge d'urgence et le reporting conformité. Le projet est organisé en architecture microservices (Node.js/Express + PostgreSQL) avec un frontend Next.js moderne et responsive.

## Contenu du dépôt

```
backend/
  gateway/                # API Gateway (Express)
  services/               # Microservices (auth, profil, triage, rendez-vous, urgence, admin)
  packages/shared/        # Librairie partagée (sécurité, audit, base de données)
  database/schema.sql     # Schéma PostgreSQL
frontend/                 # Application Next.js (React)
docs/                     # Architecture, schéma, guides utilisateurs/administrateurs, tests, OpenAPI
.env.example              # Variables d'environnement à personnaliser
docker-compose.yml        # Orchestration locale
```

## Démarrage rapide (développement)

```bash
# Installer les dépendances
cd backend && npm install
cd ../frontend && npm install

# Lancer les services en mode développement
cd ../backend
npm run start:dev
# Dans une autre console
cd ../frontend && npm run dev
```

Le frontend est accessible sur http://localhost:3000 et l'API Gateway sur http://localhost:8080.

## Déploiement

- Utilisez `docker compose up --build` pour exécuter l'ensemble de la stack localement.
- Consultez `docs/deployment/guide.md` pour les recommandations de production (Kubernetes, CI/CD, sécurité).

## Documentation

- [Architecture technique](docs/architecture.md)
- [Schéma de base de données](docs/database-schema.md)
- [Spécification OpenAPI](docs/api/openapi.yaml)
- [Plan de tests automatisés](docs/testing-plan.md)
- [Guide utilisateur](docs/guides/user-guide.md)
- [Guide administrateur](docs/guides/admin-guide.md)

## Conformité et sécurité

- Chiffrement des données sensibles (AES-256-GCM + pgcrypto).
- Authentification JWT + OAuth2 avec MFA.
- Journal d'audit complet et export SIEM.
- Respect RGPD/HIPAA, accessibilité WCAG 2.1 AA, mode hors-ligne PWA.

