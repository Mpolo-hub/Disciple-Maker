'use client';

import { useLanguage } from '../context/LanguageContext';

export function HealthSummaryCard({ title, value, trend, icon = '💙', description }) {
  const { t } = useLanguage();
  return (
    <section className="card" aria-live="polite">
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0, fontSize: '1.125rem' }}>
          <span aria-hidden>{icon}</span> {title}
        </h2>
        {trend && <span className="badge">{trend}</span>}
      </header>
      <p style={{ fontSize: '2rem', fontWeight: 700 }}>{value}</p>
      {description && <p style={{ opacity: 0.8 }}>{description}</p>}
      <p style={{ fontSize: '0.85rem', opacity: 0.65 }}>{t('securityNotice')}</p>
    </section>
  );
}
