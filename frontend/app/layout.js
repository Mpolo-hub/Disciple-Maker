import './globals.css';
import { Providers } from '../context/Providers';
import { NavBar } from '../components/NavBar';
import { NotificationPanel } from '../components/NotificationPanel';

export const metadata = {
  title: 'Plateforme santé employés',
  description: 'Suivi complet du parcours de santé des collaborateurs'
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className="dark">
        <Providers>
          <NavBar />
          <main>{children}</main>
          <NotificationPanel />
        </Providers>
      </body>
    </html>
  );
}
