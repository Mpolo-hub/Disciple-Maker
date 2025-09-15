'use client';

import { useEffect, useState } from 'react';
import { EmergencyButton } from '../../components/EmergencyButton';
import { apiClient } from '../../lib/apiClient';

export default function EmergencyPage() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    apiClient('/emergency/alerts')
      .then(setAlerts)
      .catch(() => setAlerts([]));
  }, []);

  return (
    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
      <section className="card">
        <h1>Espace urgence</h1>
        <p>Transmettez immédiatement votre position et votre profil médical aux secours.</p>
        <EmergencyButton />
        <p style={{ marginTop: '1rem', fontSize: '0.85rem', opacity: 0.7 }}>En mode hors-ligne, les informations d'urgence stockées localement restent accessibles.</p>
      </section>
      <section className="card">
        <h2>Historique des alertes</h2>
        <ul>
          {alerts.map((alert) => (
            <li key={alert.id}>
              <strong>{alert.status}</strong> — {new Date(alert.triggeredAt || alert.createdAt).toLocaleString()}
            </li>
          ))}
          {!alerts.length && <li>Aucune alerte récente.</li>}
        </ul>
      </section>
    </div>
  );
}
