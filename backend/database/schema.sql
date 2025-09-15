-- PostgreSQL schema for Employee Health Platform
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE user_role AS ENUM ('employee', 'medical_staff', 'admin');
CREATE TYPE appointment_mode AS ENUM ('onsite', 'teleconsultation');
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE triage_level AS ENUM ('self_care', 'teleconsultation', 'emergency');
CREATE TYPE allergy_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE emergency_status AS ENUM ('open', 'acknowledged', 'closed');
CREATE TYPE notification_channel AS ENUM ('sms', 'email', 'push', 'voice');

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email CITEXT UNIQUE NOT NULL,
    password_hash TEXT,
    phone_number BYTEA,
    preferred_locale VARCHAR(5) DEFAULT 'fr',
    role user_role NOT NULL DEFAULT 'employee',
    mfa_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS auth_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(64) NOT NULL,
    provider_user_id BYTEA NOT NULL,
    access_token BYTEA,
    refresh_token BYTEA,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS health_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blood_type BYTEA,
    height_cm NUMERIC(5,2),
    weight_kg NUMERIC(5,2),
    chronic_conditions BYTEA,
    lifestyle JSONB,
    last_reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS allergies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES health_profiles(id) ON DELETE CASCADE,
    substance BYTEA NOT NULL,
    reaction BYTEA,
    severity allergy_severity,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS medications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES health_profiles(id) ON DELETE CASCADE,
    name BYTEA NOT NULL,
    dosage BYTEA,
    prescribed_by BYTEA,
    start_date DATE,
    end_date DATE
);

CREATE TABLE IF NOT EXISTS medical_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES health_profiles(id) ON DELETE CASCADE,
    condition BYTEA NOT NULL,
    diagnosed_at DATE,
    notes BYTEA
);

CREATE TABLE IF NOT EXISTS emergency_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES health_profiles(id) ON DELETE CASCADE,
    full_name BYTEA NOT NULL,
    relation VARCHAR(64),
    phone_number BYTEA,
    email BYTEA
);

CREATE TABLE IF NOT EXISTS medical_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES health_profiles(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    storage_url TEXT NOT NULL,
    mime_type VARCHAR(128) NOT NULL,
    checksum TEXT,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS symptom_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    triage triage_level,
    recommendations BYTEA,
    protocol_version VARCHAR(32) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assessment_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID NOT NULL REFERENCES symptom_assessments(id) ON DELETE CASCADE,
    step_id VARCHAR(64) NOT NULL,
    question TEXT NOT NULL,
    answer JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    practitioner_id UUID,
    scheduled_at TIMESTAMPTZ NOT NULL,
    mode appointment_mode NOT NULL DEFAULT 'onsite',
    status appointment_status NOT NULL DEFAULT 'pending',
    notes BYTEA,
    calendar_event_id VARCHAR(128),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS teleconsultations (
    appointment_id UUID PRIMARY KEY REFERENCES appointments(id) ON DELETE CASCADE,
    meeting_url TEXT,
    recording_url TEXT,
    encryption_key BYTEA,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS emergency_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    triggered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    location BYTEA,
    status emergency_status NOT NULL DEFAULT 'open',
    medical_snapshot BYTEA,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS emergency_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_id UUID NOT NULL REFERENCES emergency_alerts(id) ON DELETE CASCADE,
    channel notification_channel NOT NULL,
    status VARCHAR(32) NOT NULL,
    sent_at TIMESTAMPTZ,
    response_payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wearable_devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_type VARCHAR(64) NOT NULL,
    manufacturer VARCHAR(64),
    serial_number VARCHAR(64),
    last_sync_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS wearable_readings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID NOT NULL REFERENCES wearable_devices(id) ON DELETE CASCADE,
    captured_at TIMESTAMPTZ NOT NULL,
    metric VARCHAR(64) NOT NULL,
    value NUMERIC(12,4) NOT NULL,
    unit VARCHAR(16) NOT NULL,
    metadata JSONB
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID,
    actor_role user_role,
    action VARCHAR(128) NOT NULL,
    resource_type VARCHAR(128) NOT NULL,
    resource_id UUID,
    ip_address INET,
    user_agent TEXT,
    payload_hash TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE VIEW v_company_health_overview AS
SELECT
    date_trunc('month', a.scheduled_at) AS month,
    a.status,
    COUNT(*) FILTER (WHERE a.mode = 'teleconsultation') AS teleconsultations,
    COUNT(*) FILTER (WHERE a.mode = 'onsite') AS onsite_visits,
    COUNT(DISTINCT a.user_id) AS distinct_employees
FROM appointments a
GROUP BY 1,2;

CREATE VIEW v_incident_reports AS
SELECT
    date_trunc('week', e.triggered_at) AS week,
    e.status,
    COUNT(*) AS incident_count
FROM emergency_alerts e
GROUP BY 1,2;

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled_at ON appointments(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_assessments_user ON symptom_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_status ON emergency_alerts(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
