'use client';

import { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

export default function SettingsPage() {
  const { locale, setLocale, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { pushNotification } = useNotifications();
  const { user, login, logout, isAuthenticated } = useAuth();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [email, setEmail] = useState('utilisateur@example.com');
  const [password, setPassword] = useState('ChangeMe!123');

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      await login(email, password);
      pushNotification({ level: 'success', message: 'Connecté avec succès' });
    } catch (error) {
      pushNotification({ level: 'warning', message: error.message });
    }
  };

  return (
    <section className="card">
      <h1>{t('settings')}</h1>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          pushNotification({ level: 'success', message: 'Préférences enregistrées' });
        }}
      >
        <fieldset>
          <legend>Affichage</legend>
          <label htmlFor="theme-select">{t('theme')}</label>
          <select id="theme-select" value={theme} onChange={(event) => setTheme(event.target.value)}>
            <option value="dark">Sombre</option>
            <option value="light">Clair</option>
          </select>
          <label htmlFor="locale-select">{t('language')}</label>
          <select id="locale-select" value={locale} onChange={(event) => setLocale(event.target.value)}>
            <option value="fr">Français</option>
            <option value="en">English</option>
          </select>
        </fieldset>
        <fieldset>
          <legend>Notifications</legend>
          <label>
            <input type="checkbox" checked={emailNotifications} onChange={(event) => setEmailNotifications(event.target.checked)} />
            Email
          </label>
          <label>
            <input type="checkbox" checked={smsNotifications} onChange={(event) => setSmsNotifications(event.target.checked)} />
            SMS
          </label>
        </fieldset>
        <button type="submit" className="button-primary">Sauvegarder</button>
      </form>
      <section aria-labelledby="auth-section" style={{ marginTop: '1.5rem' }}>
        <h2 id="auth-section">Connexion</h2>
        {isAuthenticated ? (
          <div>
            <p>Connecté en tant que {user?.email}</p>
            <button type="button" className="button-primary" onClick={logout}>Se déconnecter</button>
          </div>
        ) : (
          <form onSubmit={handleLogin} style={{ display: 'grid', gap: '0.75rem' }}>
            <label htmlFor="email">Email professionnel</label>
            <input id="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
            <label htmlFor="password">Mot de passe</label>
            <input id="password" type="password" required value={password} onChange={(event) => setPassword(event.target.value)} />
            <button type="submit" className="button-primary">Se connecter</button>
          </form>
        )}
      </section>
    </section>
  );
}
