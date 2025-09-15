'use client';

import { useState } from 'react';
import { apiClient } from '../../lib/apiClient';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { randomId } from '../../lib/randomId';

export default function SymptomCheckerPage() {
  const { user } = useAuth();
  const { pushNotification } = useNotifications();
  const [symptoms, setSymptoms] = useState('');
  const [session, setSession] = useState(null);
  const [answer, setAnswer] = useState('');

  const startSession = async (event) => {
    event.preventDefault();
    try {
      const response = await apiClient('/symptom-checker/sessions', {
        method: 'POST',
        body: JSON.stringify({ userId: user?.id || randomId(), symptoms: symptoms.split(',').map((item) => item.trim()).filter(Boolean) })
      });
      setSession(response);
      pushNotification({ level: 'info', message: 'Session démarrée' });
    } catch (error) {
      pushNotification({ level: 'warning', message: error.message });
    }
  };

  const sendAnswer = async (event) => {
    event.preventDefault();
    if (!session) return;
    try {
      const response = await apiClient(`/symptom-checker/sessions/${session.id}/responses`, {
        method: 'POST',
        body: JSON.stringify({ stepId: 'severe', answer: answer === 'oui' })
      });
      setSession(response);
      pushNotification({ level: 'success', message: `Recommandation: ${response.recommendation}` });
    } catch (error) {
      pushNotification({ level: 'warning', message: error.message });
    }
  };

  return (
    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
      <section className="card">
        <h1>Assistant symptômes</h1>
        <p>Décrivez vos symptômes pour obtenir une recommandation personnalisée.</p>
        <form onSubmit={startSession}>
          <label htmlFor="symptoms">Symptômes (séparés par des virgules)</label>
          <textarea id="symptoms" rows={4} required value={symptoms} onChange={(event) => setSymptoms(event.target.value)} />
          <button type="submit" className="button-primary">Analyser</button>
        </form>
      </section>
      {session && (
        <section className="card">
          <h2>Recommandation</h2>
          <p><strong>Niveau:</strong> {session.recommendation || 'en cours'}</p>
          <form onSubmit={sendAnswer}>
            <label htmlFor="answer">Avez-vous des symptômes sévères ?</label>
            <select id="answer" value={answer} onChange={(event) => setAnswer(event.target.value)}>
              <option value="">Sélectionner…</option>
              <option value="oui">Oui</option>
              <option value="non">Non</option>
            </select>
            <button type="submit" className="button-primary">Mettre à jour</button>
          </form>
          <div>
            <h3>Historique</h3>
            <ul>
              {session.steps?.map((step) => (
                <li key={step.timestamp}>{step.stepId} : {String(step.answer)}</li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}
