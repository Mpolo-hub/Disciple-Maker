const repository = require('../repositories/profileRepository');

async function listProfiles(userId) {
  if (!userId) {
    return [];
  }
  return repository.listByUser(userId);
}

async function getProfile(id) {
  const profile = await repository.get(id);
  if (!profile) {
    return null;
  }
  const documents = await repository.listDocuments(id);
  return { ...profile, documents };
}

async function upsertProfile(payload) {
  return repository.upsert(payload);
}

async function updateProfile(id, payload) {
  return repository.update(id, payload);
}

async function storeDocument(profileId, file) {
  return repository.storeDocument(profileId, file);
}

async function listDocuments(profileId) {
  return repository.listDocuments(profileId);
}

module.exports = {
  listProfiles,
  getProfile,
  upsertProfile,
  updateProfile,
  storeDocument,
  listDocuments
};
