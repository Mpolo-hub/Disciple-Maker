const { getPool, encryptData, decryptData, logger } = require('@employee-health/shared');
const crypto = require('crypto');

const profiles = new Map();
const documents = new Map();

function sanitize(profile) {
  if (!profile) return null;
  return {
    id: profile.id,
    userId: profile.userId,
    bloodType: profile.bloodType,
    heightCm: profile.heightCm,
    weightKg: profile.weightKg,
    chronicConditions: profile.chronicConditions,
    lifestyle: profile.lifestyle,
    allergies: profile.allergies,
    medications: profile.medications,
    emergencyContacts: profile.emergencyContacts
  };
}

async function upsert(profile) {
  const id = profile.id || crypto.randomUUID();
  const record = {
    id,
    userId: profile.userId,
    bloodType: profile.bloodType || null,
    heightCm: profile.heightCm || null,
    weightKg: profile.weightKg || null,
    chronicConditions: profile.chronicConditions || [],
    lifestyle: profile.lifestyle || {},
    allergies: profile.allergies || [],
    medications: profile.medications || [],
    emergencyContacts: profile.emergencyContacts || []
  };
  profiles.set(id, record);
  const pool = getPool();
  if (pool) {
    try {
      await pool.query(
        `INSERT INTO health_profiles (id, user_id, blood_type, height_cm, weight_kg, chronic_conditions, lifestyle)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO UPDATE SET blood_type = EXCLUDED.blood_type, height_cm = EXCLUDED.height_cm, weight_kg = EXCLUDED.weight_kg,
         chronic_conditions = EXCLUDED.chronic_conditions, lifestyle = EXCLUDED.lifestyle, updated_at = NOW()`,
        [id, profile.userId, encryptData(profile.bloodType), profile.heightCm, profile.weightKg, encryptData(profile.chronicConditions), profile.lifestyle]
      );
    } catch (error) {
      logger.error('Failed to upsert profile into database', { error: error.message });
    }
  }
  return sanitize(record);
}

async function get(id) {
  if (profiles.has(id) && profiles.get(id).id) {
    return profiles.get(id);
  }
  const pool = getPool();
  if (!pool) return null;
  try {
    const { rows } = await pool.query('SELECT * FROM health_profiles WHERE id = $1 LIMIT 1', [id]);
    if (!rows.length) return null;
    const row = rows[0];
    const record = {
      id: row.id,
      userId: row.user_id,
      bloodType: decryptData(row.blood_type),
      heightCm: row.height_cm,
      weightKg: row.weight_kg,
      chronicConditions: decryptData(row.chronic_conditions) || [],
      lifestyle: row.lifestyle,
      allergies: [],
      medications: [],
      emergencyContacts: []
    };
    profiles.set(id, record);
    return record;
  } catch (error) {
    logger.error('Failed to fetch profile from database', { error: error.message });
    return null;
  }
}

async function listByUser(userId) {
  const result = Array.from(profiles.values()).filter((p) => p.userId === userId);
  return result.map(sanitize);
}

async function update(id, payload) {
  const existing = await get(id);
  if (!existing) {
    return upsert({ ...payload, id });
  }
  const updated = { ...existing, ...payload, id };
  profiles.set(id, updated);
  return sanitize(updated);
}

async function storeDocument(profileId, file) {
  const id = crypto.randomUUID();
  const doc = {
    id,
    profileId,
    filename: file?.originalname || 'document',
    mimeType: file?.mimetype,
    size: file?.size,
    uploadedAt: new Date().toISOString()
  };
  if (!documents.has(profileId)) {
    documents.set(profileId, []);
  }
  documents.get(profileId).push(doc);
  return doc;
}

async function listDocuments(profileId) {
  return documents.get(profileId) || [];
}

module.exports = {
  upsert,
  get,
  listByUser,
  update,
  storeDocument,
  listDocuments
};
