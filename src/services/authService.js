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
    const trimmedId = (officerId || '').trim();

    // Defined authorized officer accounts
    const KNOWN_OFFICERS = {
      'OFF-OPS-101': {
        officerId: 'OFF-OPS-101',
        name: 'Rajesh K. Sharma',
        role: 'OPERATIONS_CONTROL',
        title: 'Chief Controller (Operations)',
        department: 'OPERATIONS',
        division: 'NCR - Prayagraj Division',
        validPass: 'RailOpt@Ops2026'
      },
      'OFF-ENG-201': {
        officerId: 'OFF-ENG-201',
        name: 'Er. Vikram Singh',
        role: 'ENGINEERING_OFFICER',
        title: 'Senior Section Engineer (P-Way)',
        department: 'ENGINEERING',
        division: 'NCR - Prayagraj Division',
        validPass: 'RailOpt@Eng2026'
      },
      'OFF-SIG-301': {
        officerId: 'OFF-SIG-301',
        name: 'Er. Priya Sundaram',
        role: 'ST_OFFICER',
        title: 'Senior Section Engineer (S&T)',
        department: 'SIGNAL_AND_TELECOM',
        division: 'NCR - Prayagraj Division',
        validPass: 'RailOpt@Sig2026'
      },
      'OFF-TRD-401': {
        officerId: 'OFF-TRD-401',
        name: 'Er. Amitav Sen',
        role: 'TRD_OFFICER',
        title: 'Senior Section Engineer (TRD / OHE)',
        department: 'TRACTION_DISTRIBUTION',
        division: 'NCR - Prayagraj Division',
        validPass: 'RailOpt@Trd2026'
      },
      'OFF-ADMIN-01': {
        officerId: 'OFF-ADMIN-01',
        name: 'Shri A. K. Verma',
        role: 'ADMIN',
        title: 'Principal Chief Operations Manager (PCOM)',
        department: 'ADMINISTRATION',
        division: 'NCR - Prayagraj Division',
        validPass: 'RailOpt@Admin2026'
      }
    };

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ officerId: trimmedId, password })
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.token && data.officer) {
        this.setToken(data.token);
        this.setUser(data.officer);
        return data;
      }
    } catch (networkErr) {
      console.warn('[authService] Backend unreachable, falling back to local verification:', networkErr.message);
    }

    // Local authentication fallback
    const matched = KNOWN_OFFICERS[trimmedId];
    if (matched && matched.validPass === password) {
      const fallbackOfficer = {
        officerId: matched.officerId,
        name: matched.name,
        role: matched.role,
        title: matched.title,
        department: matched.department,
        division: matched.division
      };
      const fallbackToken = 'simulated_jwt_' + Date.now();
      this.setToken(fallbackToken);
      this.setUser(fallbackOfficer);
      return {
        authenticated: true,
        token: fallbackToken,
        officer: fallbackOfficer
      };
    }

    throw new Error('Invalid Officer ID or Password. Please verify credentials.');
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

    if (token.startsWith('simulated_jwt_')) {
      return this.getUser();
    }

    try {
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

      if (response.ok) {
        const data = await response.json();
        if (data.officer) {
          this.setUser(data.officer);
        }
        return data.officer;
      }
    } catch (err) {
      console.warn('[authService] getMe remote check failed, using cached profile:', err.message);
    }

    return this.getUser();
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
