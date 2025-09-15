'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../lib/apiClient';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

const emptyProfile = {
  userId: '',
  bloodType: '',
  heightCm: '',
  weightKg: '',
  allergies: [],
  medications: [],
  emergencyContacts: []
};

export default function ProfilePage() {
  const { user } = useAuth();
  const { pushNotification } = useNotifications();
  const [profile, setProfile] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const cached = window.localStorage.getItem('profile:cache');
    if (cached) {
      setProfile(JSON.parse(cached));
    }
    apiClient('/profiles', { headers: { 'x-user-id': user.id } })
      .then((profiles) => {
        const target = Array.isArray(profiles) ? profiles[0] : profiles;
        if (target) {
          setProfile({ ...emptyProfile, ...target });
          window.localStorage.setItem('profile:cache', JSON.stringify({ ...emptyProfile, ...target }));
        }
      })
      .finally(() => setLoading(false));
  }, [user]);

  const updateField = (field) => (event) => {
    setProfile((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const payload = { ...profile, userId: user?.id };
      await apiClient('/profiles', { method: 'POST', headers: { 'x-user-id': user?.id }, body: JSON.stringify(payload) });
      window.localStorage.setItem('profile:cache', JSON.stringify(payload));
      pushNotification({ level: 'success', message: 'Profil mis à jour' });
    } catch (error) {
      pushNotification({ level: 'warning', message: error.message });
    }
  };

  if (loading) {
    return <p>Chargement du profil…</p>;
  }

  return (
    <section className="card" aria-labelledby="profile-title">
      <h1 id="profile-title">Mon profil de santé</h1>
      <form onSubmit={handleSubmit}>
        <fieldset>
          <legend>Informations générales</legend>
          <label htmlFor="bloodType">Groupe sanguin</label>
          <input id="bloodType" value={profile.bloodType || ''} onChange={updateField('bloodType')} />
          <label htmlFor="height">Taille (cm)</label>
          <input id="height" type="number" min="0" value={profile.heightCm || ''} onChange={updateField('heightCm')} />
          <label htmlFor="weight">Poids (kg)</label>
          <input id="weight" type="number" min="0" value={profile.weightKg || ''} onChange={updateField('weightKg')} />
        </fieldset>
        <fieldset>
          <legend>Contacts d'urgence</legend>
          <textarea
            rows={4}
            value={profile.emergencyContacts?.map((contact) => `${contact.fullName || ''} ${contact.phoneNumber || ''}`).join('\n') || ''}
            onChange={(event) =>
              setProfile((current) => ({
                ...current,
                emergencyContacts: event.target.value
                  .split('\n')
                  .filter(Boolean)
                  .map((line) => ({ fullName: line.trim() }))
              }))
            }
            placeholder="Nom - téléphone"
          />
        </fieldset>
        <button type="submit" className="button-primary">Enregistrer</button>
      </form>
    </section>
  );
}
