const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/v1';

export async function apiClient(path, { method = 'GET', headers = {}, body } = {}) {
  const token = typeof window !== 'undefined' ? window.localStorage.getItem('auth:token') : null;
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers
    },
    body
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'API error');
  }
  return response.json();
}
