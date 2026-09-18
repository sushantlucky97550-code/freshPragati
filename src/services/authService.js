/**
 * Pragati - Officer Authentication Service
 * Communicates with Spring Boot backend at /api/auth
 */

const TOKEN_KEY = 'railopt_auth_token';
const USER_KEY = 'railopt_auth_user';

export const authService = {
  getToken() {
    try {
      return sessionStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setToken(token) {
    try {
      if (token) {
        sessionStorage.setItem(TOKEN_KEY, token);
      } else {
        sessionStorage.removeItem(TOKEN_KEY);
      }
    } catch (e) {
      console.warn('[authService] Failed to set token in sessionStorage:', e);
    }
  },

  getUser() {
    try {
      const raw = sessionStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  setUser(user) {
    try {
      if (user) {
        sessionStorage.setItem(USER_KEY, JSON.stringify(user));
      } else {
        sessionStorage.removeItem(USER_KEY);
      }
    } catch (e) {
      console.warn('[authService] Failed to set user in sessionStorage:', e);
    }
  },

  clearSession() {
    try {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(USER_KEY);
    } catch (e) {
      console.warn('[authService] Failed to clear session:', e);
    }
  },

  async login(officerId, password) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ officerId, password })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(data.message || 'Authentication failed. Please verify credentials.');
      error.status = response.status;
      error.data = data;
      throw error;
    }

    if (data.token && data.officer) {
      this.setToken(data.token);
      this.setUser(data.officer);
    }

    return data;
  },

  async logout() {
    const token = this.getToken();
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
    } catch (err) {
      console.warn('[authService] Remote logout failed, continuing local teardown:', err);
    } finally {
      this.clearSession();
    }
  },

  async getMe() {
    const token = this.getToken();
    if (!token) return null;

    const response = await fetch('/api/auth/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    if (response.status === 401) {
      this.clearSession();
      throw new Error('Session expired');
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch officer profile: ${response.status}`);
    }

    const data = await response.json();
    if (data.officer) {
      this.setUser(data.officer);
    }
    return data.officer;
  },

  async getAuditLogs() {
    const token = this.getToken();
    const response = await fetch('/api/auth/audit-logs', {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });

    if (!response.ok) {
      throw new Error('Failed to load audit logs. Requires Administrator authorization.');
    }

    return await response.json();
  },

  async getAllOfficers() {
    const token = this.getToken();
    const response = await fetch('/api/auth/users', {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });

    if (!response.ok) {
      throw new Error('Failed to load officer directory. Requires Administrator authorization.');
    }

    return await response.json();
  }
};
