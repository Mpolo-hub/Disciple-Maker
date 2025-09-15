'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../lib/apiClient';

export default function AdminPage() {
  const [metrics, setMetrics] = useState([]);
  const [audit, setAudit] = useState([]);

  useEffect(() => {
    apiClient('/admin/metrics')
      .then((data) => setMetrics(data.trends || []))
      .catch(() => setMetrics([]));
    apiClient('/admin/audit')
      .then(setAudit)
      .catch(() => setAudit([]));
  }, []);

  return (
    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
      <section className="card">
        <h1>Tableau de bord santé</h1>
        <ul>
          {metrics.map((row) => (
            <li key={row.day}>
              {new Date(row.day).toLocaleDateString()} — {row.total} consultations (dont {row.teleconsultations} distantes)
            </li>
          ))}
          {!metrics.length && <li>En attente de données.</li>}
        </ul>
      </section>
      <section className="card">
        <h2>Journal d'audit</h2>
        <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
          <ul>
            {audit.map((entry) => (
              <li key={entry.id}>
                <strong>{entry.action}</strong> — {entry.actor_role} — {new Date(entry.created_at || entry.createdAt).toLocaleString()}
              </li>
            ))}
            {!audit.length && <li>Aucun événement recensé.</li>}
          </ul>
        </div>
      </section>
    </div>
  );
}
