'use client';

import { useEffect, useState } from 'react';
import { HealthSummaryCard } from '../../components/HealthSummaryCard';
import { EmergencyButton } from '../../components/EmergencyButton';
import { useLanguage } from '../../context/LanguageContext';
import { apiClient } from '../../lib/apiClient';

export default function DashboardPage() {
  const { t } = useLanguage();
  const [metrics, setMetrics] = useState([]);

  useEffect(() => {
    let mounted = true;
    apiClient('/admin/metrics')
      .then((data) => mounted && setMetrics(data.trends || []))
      .catch(() => mounted && setMetrics([]));
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="grid" role="region" aria-label={t('dashboard')}>
      <HealthSummaryCard title="Sessions d'auto-évaluation" value="128" trend="+12%" description="Activité sur les 30 derniers jours" icon="🩺" />
      <HealthSummaryCard title="Rendez-vous confirmés" value="42" trend="+5" description="Inclusions médicales" icon="📅" />
      <HealthSummaryCard title="Alertes urgentes" value="0" trend="stable" description="Aucun incident critique en cours" icon="🚨" />
      <section className="card" style={{ gridColumn: '1 / -1' }}>
        <h2>{t('latestReports')}</h2>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Métrique</th>
                <th>Valeur</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((row) => (
                <tr key={row.day}>
                  <td>{new Date(row.day).toLocaleDateString()}</td>
                  <td>Téléconsultations</td>
                  <td>{row.teleconsultations}</td>
                </tr>
              ))}
              {!metrics.length && (
                <tr>
                  <td colSpan={3}>Données en cours de synchronisation…</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      <section className="card" style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2>{t('emergencyCall')}</h2>
          <p>Transmet immédiatement votre fiche médicale sécurisée et votre géolocalisation.</p>
        </div>
        <EmergencyButton />
      </section>
    </div>
  );
}
