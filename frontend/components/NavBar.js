'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

const links = [
  { href: '/dashboard', key: 'dashboard' },
  { href: '/profile', key: 'profile' },
  { href: '/symptom-checker', key: 'symptomChecker' },
  { href: '/appointments', key: 'appointments' },
  { href: '/emergency', key: 'emergency' },
  { href: '/admin', key: 'admin' },
  { href: '/settings', key: 'settings' }
];

export function NavBar() {
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuth();
  const { t, locale, setLocale } = useLanguage();
  const { theme, setTheme } = useTheme();

  return (
    <nav aria-label="Navigation principale">
      <div>
        <Link href="/dashboard" aria-label="Accueil">
          <strong>HealthCare+</strong>
        </Link>
      </div>
      <div className="nav-links">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="nav-link" aria-current={pathname === link.href ? 'page' : undefined}>
            {t(link.key)}
          </Link>
        ))}
      </div>
      <div>
        <label className="visually-hidden" htmlFor="lang-select">{t('language')}</label>
        <select
          id="lang-select"
          value={locale}
          onChange={(event) => setLocale(event.target.value)}
          aria-label="Sélection de la langue"
        >
          <option value="fr">Français</option>
          <option value="en">English</option>
        </select>
        <button type="button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="button-primary" aria-label="Changer de thème">
          {t('theme')}: {theme === 'dark' ? '🌙' : '☀️'}
        </button>
        {isAuthenticated ? (
          <button type="button" onClick={logout} className="button-primary" aria-label="Se déconnecter">
            {user?.email}
          </button>
        ) : (
          <Link href="/settings" className="button-primary">SSO</Link>
        )}
      </div>
    </nav>
  );
}
