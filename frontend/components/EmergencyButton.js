'use client';

import { useNotifications } from '../context/NotificationContext';
import { apiClient } from '../lib/apiClient';
import { randomId } from '../lib/randomId';

export function EmergencyButton() {
  const { pushNotification } = useNotifications();

  const handleClick = async () => {
    pushNotification({ level: 'warning', message: 'Déclenchement de l\'alerte en cours...' });
    try {
      const position = await new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          return reject(new Error('La géolocalisation est indisponible'));
        }
        navigator.geolocation.getCurrentPosition(
          (result) => resolve({ lat: result.coords.latitude, lng: result.coords.longitude }),
          (error) => reject(error)
        );
      });
      const response = await apiClient('/emergency/alerts', {
        method: 'POST',
        body: JSON.stringify({ userId: randomId(), location: position })
      });
      pushNotification({ level: 'success', message: `Alerte transmise (${response.status})` });
    } catch (error) {
      pushNotification({ level: 'warning', message: error.message });
    }
  };

  return (
    <button type="button" className="button-primary" onClick={handleClick} aria-label="Déclencher l'alerte d'urgence">
      🚨 Lancer l'urgence
    </button>
  );
}
