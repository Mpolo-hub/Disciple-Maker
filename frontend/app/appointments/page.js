'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../lib/apiClient';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { randomId } from '../../lib/randomId';

export default function AppointmentsPage() {
  const { user } = useAuth();
  const { pushNotification } = useNotifications();
  const [appointments, setAppointments] = useState([]);
  const [scheduledAt, setScheduledAt] = useState('');
  const [availability, setAvailability] = useState([]);

  const loadAppointments = () => {
    apiClient('/appointments')
      .then(setAppointments)
      .catch(() => setAppointments([]));
  };

  useEffect(() => {
    loadAppointments();
    apiClient('/availability')
      .then((data) => setAvailability(data.slots || []))
      .catch(() => setAvailability([]));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await apiClient('/appointments', {
        method: 'POST',
        body: JSON.stringify({
          userId: user?.id || randomId(),
          practitionerId: randomId(),
          scheduledAt,
          mode: 'teleconsultation'
        })
      });
      pushNotification({ level: 'success', message: 'Rendez-vous planifié' });
      setScheduledAt('');
      loadAppointments();
    } catch (error) {
      pushNotification({ level: 'warning', message: error.message });
    }
  };

  return (
    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
      <section className="card">
        <h1>Mes rendez-vous</h1>
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Mode</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => (
              <tr key={appointment.id}>
                <td>{new Date(appointment.scheduledAt).toLocaleString()}</td>
                <td>{appointment.mode}</td>
                <td>{appointment.status}</td>
              </tr>
            ))}
            {!appointments.length && (
              <tr>
                <td colSpan={3}>Aucun rendez-vous pour le moment.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
      <section className="card">
        <h2>Planifier une téléconsultation</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="scheduledAt">Créneau</label>
          <select id="scheduledAt" value={scheduledAt} required onChange={(event) => setScheduledAt(event.target.value)}>
            <option value="">Sélectionner…</option>
            {availability.map((slot) => (
              <option key={slot.start} value={slot.start}>{new Date(slot.start).toLocaleString()}</option>
            ))}
          </select>
          <button type="submit" className="button-primary">Confirmer</button>
        </form>
      </section>
    </div>
  );
}
