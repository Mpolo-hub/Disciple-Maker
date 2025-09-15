# Plan de tests automatisés

## Pyramide de tests

1. **Tests unitaires** (Jest) sur chaque service :
   - Validation des schémas Joi.
   - Services métiers (triage, notifications, encryption).
2. **Tests d'intégration** :
   - Supertest sur routes Express via API Gateway.
   - Tests de persistance (utilisation de `pg` + base éphémère). 
3. **Tests contractuels** :
   - Dredd ou Schemathesis sur le fichier OpenAPI.
4. **Tests end-to-end** :
   - Playwright/Cypress sur le frontend (scénarios profils, triage, urgence).
5. **Tests performance** :
   - k6 ou Artillery (latence < 200 ms, montée en charge 500 rps).
6. **Tests sécurité** :
   - OWASP ZAP automatisé, npm audit, Snyk.

## Automatisation CI/CD

- Pipeline GitHub Actions (`.github/workflows/ci.yml`) comprenant :
  1. `npm ci` pour frontend et backend (workspaces).
  2. `npm run lint` et `npm test` (tous les services).
  3. `npm run test:e2e` (Playwright headless).
  4. `npm run test:contract` (Schemathesis sur gateway).
  5. `npm run build` (frontend + docker images).
  6. `trivy image` et `npm audit`.

## Jeux de données

- Fixtures anonymisées pour tests intégration.
- Génération de données synthétiques via `@faker-js/faker`.

## Critères d'acceptation

- Couverture minimale 80% sur services critiques (auth, emergency).
- Temps réponse moyenne < 200 ms sur endpoints `POST /emergency/alerts` et `POST /symptom-checker/sessions` lors des tests de charge.
- Aucun test critique en échec avant déploiement.

