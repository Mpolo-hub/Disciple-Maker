# Architecture technique de la plateforme de prise en charge sanitaire

## Vue d'ensemble

La solution est organisée sous la forme d'une architecture microservices conteneurisée. Chaque domaine fonctionnel est isolé dans un service Node.js/Express spécialisé, orchestré par un API Gateway sécurisé. Le frontend est développé avec Next.js/React et consomme exclusivement l'API RESTful exposée par le gateway. Les données persistantes sont stockées dans une base PostgreSQL hautement disponible et répliquée. Les notifications, la mise en cache et les files d'attente utilisent des services managés (ex. Redis, SMTP, WebPush).

```
Navigateur / Mobile (Next.js + PWA)
           |
    [API Gateway]
      /  |   \   \__ Observabilité (Winston, OpenTelemetry, ELK)
     /   |    \
 Auth  Profil  Rendez-vous  Triage  Urgence  Admin/Reporting
  |      |         |          |       |           |
  \____ Services partagés (Audit, Crypto, IAM, Bus d'événements)
           |
        PostgreSQL (données métiers chiffrées)
           |
        Data Lake / BI (exports anonymisés)
```

## Composants principaux

| Composant | Description | Principales responsabilités |
|-----------|-------------|-----------------------------|
| Frontend Next.js | Application web responsive, multi-langue, PWA | Interfaces utilisateurs, mode hors-ligne, notifications, visioconférence via WebRTC, intégration objets connectés via Web Bluetooth/WebUSB |
| API Gateway | Proxy intelligent Express.js + http-proxy-middleware | Authentification JWT/OAuth2, rate limiting, agrégation de réponses, transformation FHIR/HL7, audit centralisé |
| Auth Service | Service de gestion des identités | Enregistrement, login, flux OAuth2, gestion MFA, rafraîchissement de tokens |
| Profile Service | Gestion des profils de santé chiffrés | CRUD profils, stockage documents, gestion des contacts d'urgence |
| Triage Service | Moteur d'aide à la décision | Analyse symptomatique, arbre décisionnel paramétrable, recommandations |
| Appointments Service | Gestion des rendez-vous | Synchronisation calendriers, notifications, visioconférence |
| Emergency Service | Traitement des alertes urgentes | Géolocalisation, notifications multi-canaux, transmission de dossiers |
| Admin Service | Supervision et conformité | Tableaux de bord anonymisés, reporting RGPD/HIPAA, gestion des rôles |
| Shared Package | Bibliothèque transversale | Sécurité (chiffrement, tokens), configuration, journal d'audit, connecteurs base de données |
| PostgreSQL | Base de données relationnelle | Stockage transactionnel, vues matérialisées anonymisées |
| Object Storage | Stockage sécurisé des documents | Chiffrement côté serveur, signature d'URL |
| Notification Hub | Multi-canaux (email, SMS, push) | Envoi asynchrone, gestion des consentements |

## Sécurité et conformité

- **Authentification** : JWT signés (RS256) avec rotation, compatibilité OAuth2/OIDC pour l'authentification SSO d'entreprise. Support MFA (TOTP, WebAuthn) via le service d'authentification.
- **Autorisation** : RBAC/ABAC géré par l'Admin Service avec propagation des permissions via claims JWT et vérification côté services.
- **Chiffrement** :
  - Au repos : colonnes sensibles chiffrées (PGP_SYM_ENCRYPT) + chiffrement applicatif via `@employee-health/shared` (AES-256-GCM).
  - En transit : TLS obligatoire (HTTPS), mutual TLS possible entre microservices.
- **Audit** : Journal immuable (append-only) stocké dans PostgreSQL + export vers SIEM. Chaque action critique est tracée avec identifiant utilisateur, empreinte des données et timestamp.
- **RGPD/HIPAA** : gestion des consentements, droit à l'oubli, traçabilité des traitements, minimisation des données. Les documents médicaux sont stockés chiffrés avec contrôle d'accès strict.
- **Disponibilité** : déploiement conteneurisé (Docker/Kubernetes), readiness/liveness probes, auto-scaling horizontal, backups quotidiens avec restauration testée.

## Flux principaux

1. **Symptom Checker**
   - L'utilisateur décrit ses symptômes (texte + sélection guidée).
   - Le service Triage applique l'arbre décisionnel (moteur JSON + règles métier).
   - Le résultat propose automédication, téléconsultation ou urgence selon le protocole de l'entreprise.
   - Les données sont persistées dans `symptom_assessments` (chiffrées).

2. **Prise de rendez-vous**
   - Le frontend interroge `Appointments Service` via Gateway.
   - Synchronisation avec le calendrier d'entreprise (Microsoft Graph/Google Workspace) via webhooks.
   - Notifications email/push envoyées par Notification Hub.
   - Téléconsultation via WebRTC (SFU externe recommandé).

3. **Gestion d'urgence**
   - Bouton urgence déclenche envoi GPS + profil médical condensé.
   - Le service Emergency contacte les secours (API 112/911 ou prestataire) et notifie les responsables.
   - Les actions sont auditées et un ticket incident est créé pour suivi.

4. **Tableaux de bord anonymisés**
   - Les données agrégées sont calculées via vues matérialisées anonymisées (k-anonymity, suppression identifiants).
   - Exports compatibles PowerBI/Tableau via API Admin.

## Observabilité

- Traces distribuées : OpenTelemetry -> Jaeger/Tempo.
- Logs structurés JSON -> ELK stack.
- Metrics Prometheus (temps réponse, taux d'erreur, latence triage, disponibilité services).
- Alerting via Grafana/Alertmanager.

## Déploiement cible

- Conteneurisation (Docker) + orchestrateur (Kubernetes ou Docker Swarm).
- Secrets gérés via Vault/Secrets Manager.
- Pipelines CI/CD (GitHub Actions) : lint + tests + scans SAST/DAST + déploiement.
- Environnements isolés (dev, staging, prod) avec données anonymisées en staging.

## Résilience et performance

- Mise en cache (Redis) pour les lectures non sensibles (catalogues, protocoles).
- Files d'attente (RabbitMQ/SQS) pour les tâches longues (envoi documents, notifications).
- Cibles SLA < 200 ms pour endpoints critiques (auth, triage initial, urgence) grâce à CDN + caching + autoscaling.
- Mode hors-ligne géré via cache PWA (Workbox) et base IndexedDB pour données locales temporaires.

## Intégrations externes

- **HL7/FHIR** : mapping via module Gateway, transformateurs JSON <-> FHIR.
- **Objets connectés** : ingestion via Webhooks + API BLE/ANT+, stockées dans `wearable_readings`.
- **Interop hospitaliers** : connecteurs paramétrables (SFTP, API REST, messages HL7).

## Gestion des configurations

- Configurations centralisées via fichiers `.env` + Vault.
- Versionning des protocoles médicaux (JSON) dans un bucket S3 avec signatures.
- Feature flags (ex. LaunchDarkly) pour déploiement progressif.

## Sécurité applicative

- Validation systématique des payloads (Joi + celebrate).
- Rate limiting, throttling, WAF.
- Tests de sécurité (OWASP ZAP) intégrés au pipeline.
- Politique CORS restrictive et Content Security Policy.

Cette architecture sert de base pour le code livré dans le dépôt (`backend`, `frontend`, `docs`).
