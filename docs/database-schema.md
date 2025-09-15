# Schéma de base de données

Le schéma suivant est optimisé pour PostgreSQL. Il est organisé par domaines fonctionnels tout en respectant la séparation des préoccupations. Toutes les colonnes contenant des informations médicales ou personnelles sensibles sont chiffrées en base via l'extension `pgcrypto` et/ou par chiffrement applicatif avant insertion.

## Diagramme logique (texte)

```
users (id) 1---* health_profiles (user_id)
users (id) 1---* auth_providers (user_id)
health_profiles (id) 1---* allergies (profile_id)
health_profiles (id) 1---* medications (profile_id)
health_profiles (id) 1---* medical_history (profile_id)
health_profiles (id) 1---* emergency_contacts (profile_id)
health_profiles (id) 1---* medical_documents (profile_id)
users (id) 1---* appointments (user_id)
appointments (id) 1---1 teleconsultations (appointment_id)
users (id) 1---* symptom_assessments (user_id)
symptom_assessments (id) 1---* assessment_responses (assessment_id)
users (id) 1---* emergency_alerts (user_id)
emergency_alerts (id) 1---* emergency_notifications (alert_id)
users (id) 1---* audit_logs (user_id)
wearable_devices (id) 1---* wearable_readings (device_id)
```

## Tables principales

### `users`
- `id` (UUID, PK)
- `email` (citext, unique, index)
- `password_hash` (text, nullable si OAuth)
- `phone_number` (text, chiffré)
- `preferred_locale` (varchar)
- `mfa_enabled` (boolean)
- `role` (enum : employee, medical_staff, admin)
- `created_at`, `updated_at`

### `auth_providers`
- `id` (UUID, PK)
- `user_id` (FK -> users)
- `provider` (varchar)
- `provider_user_id` (text, chiffré)
- `access_token` (text, chiffré)
- `refresh_token` (text, chiffré)
- `expires_at` (timestamp)

### `health_profiles`
- `id` (UUID, PK)
- `user_id` (FK -> users)
- `blood_type` (varchar, chiffré)
- `height_cm`, `weight_kg` (numeric)
- `chronic_conditions` (jsonb chiffré)
- `lifestyle` (jsonb)
- `last_reviewed_at` (timestamp)

### `allergies`
- `id` (UUID, PK)
- `profile_id` (FK -> health_profiles)
- `substance` (text, chiffré)
- `reaction` (text, chiffré)
- `severity` (enum)

### `medications`
- `id` (UUID, PK)
- `profile_id`
- `name` (text, chiffré)
- `dosage` (text, chiffré)
- `prescribed_by` (text, chiffré)
- `start_date`, `end_date`

### `medical_history`
- `id` (UUID, PK)
- `profile_id`
- `condition` (text, chiffré)
- `diagnosed_at` (date)
- `notes` (text, chiffré)

### `emergency_contacts`
- `id` (UUID, PK)
- `profile_id`
- `full_name` (text, chiffré)
- `relation` (varchar)
- `phone_number` (text, chiffré)
- `email` (text, chiffré)

### `medical_documents`
- `id` (UUID, PK)
- `profile_id`
- `filename` (text)
- `storage_url` (text signée)
- `mime_type`
- `checksum`
- `uploaded_at`

### `symptom_assessments`
- `id` (UUID, PK)
- `user_id`
- `started_at`, `completed_at`
- `triage_level` (enum : self_care, teleconsultation, emergency)
- `recommendations` (jsonb chiffré)
- `protocol_version` (varchar)

### `assessment_responses`
- `id` (UUID, PK)
- `assessment_id`
- `step_id` (varchar)
- `question` (text)
- `answer` (jsonb)

### `appointments`
- `id` (UUID, PK)
- `user_id`
- `practitioner_id`
- `scheduled_at`
- `mode` (enum : onsite, teleconsultation)
- `status` (enum : pending, confirmed, cancelled, completed)
- `notes` (text chiffré)
- `calendar_event_id` (varchar)

### `teleconsultations`
- `appointment_id` (PK/FK)
- `meeting_url`
- `recording_url`
- `encryption_key`

### `emergency_alerts`
- `id` (UUID, PK)
- `user_id`
- `triggered_at`
- `location` (geography point, chiffré)
- `status` (enum : open, acknowledged, closed)
- `medical_snapshot` (jsonb chiffré)

### `emergency_notifications`
- `id` (UUID, PK)
- `alert_id`
- `channel` (enum : sms, email, push, voice)
- `status`
- `sent_at`
- `response_payload`

### `audit_logs`
- `id` (bigserial PK)
- `user_id`
- `actor_role`
- `action` (varchar)
- `resource_type` (varchar)
- `resource_id` (uuid)
- `ip_address`
- `user_agent`
- `payload_hash`
- `created_at`

### `wearable_devices`
- `id` (UUID, PK)
- `user_id`
- `device_type`
- `manufacturer`
- `serial_number`
- `last_sync_at`

### `wearable_readings`
- `id` (UUID, PK)
- `device_id`
- `captured_at`
- `metric` (varchar)
- `value` (numeric)
- `unit`
- `metadata` (jsonb)

## Vues et index clés

- Vues anonymisées `v_company_health_overview`, `v_incident_reports` (agrégations par service/département sans identifiants).
- Index B-tree sur `appointments.scheduled_at`, `symptom_assessments.user_id`, `emergency_alerts.status`.
- Index GIN sur colonnes JSONB (`recommendations`, `medical_snapshot`).
- Politique RLS (Row-Level Security) activée sur toutes les tables sensibles, avec rôles `app_user`, `medical_staff`, `admin`.

## Schéma SQL

Voir [`database/schema.sql`](../backend/database/schema.sql).
