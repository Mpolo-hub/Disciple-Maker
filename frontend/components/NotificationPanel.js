'use client';

import { useNotifications } from '../context/NotificationContext';

const LEVEL_ICONS = {
  info: 'ℹ️',
  warning: '⚠️',
  success: '✅'
};

export function NotificationPanel() {
  const { notifications, clearNotifications } = useNotifications();

  if (!notifications.length) {
    return null;
  }

  return (
    <aside aria-live="polite" className="card" style={{ position: 'fixed', right: '1.5rem', bottom: '1.5rem', maxWidth: '360px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Notifications</h2>
        <button type="button" onClick={clearNotifications} className="button-primary">Effacer</button>
      </header>
      <ul style={{ listStyle: 'none', padding: 0, margin: '1rem 0 0 0' }}>
        {notifications.map((notification) => (
          <li key={notification.id} className={`alert alert--${notification.level}`}>
            <span aria-hidden>{LEVEL_ICONS[notification.level] || '🔔'}</span>
            <div>
              <p style={{ margin: 0 }}>{notification.message}</p>
              <time dateTime={notification.timestamp} style={{ fontSize: '0.75rem', opacity: 0.65 }}>
                {new Date(notification.timestamp).toLocaleTimeString()}
              </time>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
