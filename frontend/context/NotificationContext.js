'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { randomId } from '../lib/randomId';

const NotificationContext = createContext({
  notifications: [],
  pushNotification: () => {},
  clearNotifications: () => {}
});

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const pushNotification = useCallback((notification) => {
    setNotifications((current) => [
      { id: randomId(), level: 'info', timestamp: new Date().toISOString(), ...notification },
      ...current
    ].slice(0, 10));
  }, []);

  const clearNotifications = useCallback(() => setNotifications([]), []);

  const value = useMemo(() => ({ notifications, pushNotification, clearNotifications }), [notifications, pushNotification, clearNotifications]);

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  return useContext(NotificationContext);
}
