/**
 * Pragati - Officer Authentication Service
 * Communicates with Spring Boot backend at /api/auth
 * Enforces server-side and client-side Railway Zone access boundaries.
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

  async login(officerId, password, zone = 'WCR') {
    const trimmedId = (officerId || '').trim();
    const targetZone = (typeof zone === 'object' && zone !== null) ? (zone.code || 'WCR') : (zone || 'WCR');

    // Defined authorized officer accounts for fallback
    const KNOWN_OFFICERS = {
      'OFF-WCR-DOM-01': {
        officerId: 'OFF-WCR-DOM-01',
        name: 'Shri Sanjay Srivastava',
        role: 'DOM',
        title: 'Divisional Operations Manager (DOM)',
        department: 'OPERATIONS',
        zone: 'WCR',
        division: 'Bhopal',
        validPass: 'RailOpt@Ops2026'
      },
      'OFF-WCR-DRM-01': {
        officerId: 'OFF-WCR-DRM-01',
        name: 'Shri Devendra Kumar',
        role: 'DRM',
        title: 'Divisional Railway Manager (DRM)',
        department: 'OPERATIONS',
        zone: 'WCR',
        division: 'Bhopal',
        validPass: 'RailOpt@Ops2026'
      },
      'OFF-WCR-ENG-01': {
        officerId: 'OFF-WCR-ENG-01',
        name: 'Er. Vikram Singh',
        role: 'ENGINEERING_OFFICER',
        title: 'Senior Section Engineer (P-Way)',
        department: 'ENGINEERING',
        zone: 'WCR',
        division: 'Bhopal',
        validPass: 'RailOpt@Eng2026'
      },
      'OFF-WCR-SIG-01': {
        officerId: 'OFF-WCR-SIG-01',
        name: 'Er. Priya Sundaram',
        role: 'ST_OFFICER',
        title: 'Senior Section Engineer (S&T)',
        department: 'SIGNAL_AND_TELECOM',
        zone: 'WCR',
        division: 'Bhopal',
        validPass: 'RailOpt@Sig2026'
      },
      'OFF-WCR-TRD-01': {
        officerId: 'OFF-WCR-TRD-01',
        name: 'Er. Amitav Sen',
        role: 'TRD_OFFICER',
        title: 'Senior Section Engineer (TRD / OHE)',
        department: 'TRACTION_DISTRIBUTION',
        zone: 'WCR',
        division: 'Bhopal',
        validPass: 'RailOpt@Trd2026'
      },
      'OFF-WCR-SEC-01': {
        officerId: 'OFF-WCR-SEC-01',
        name: 'Anil Sharma',
        role: 'SECTION_OFFICER',
        title: 'Section Officer (Bhopal – Sehore)',
        department: 'OPERATIONS',
        zone: 'WCR',
        division: 'Bhopal',
        validPass: 'RailOpt@Sec2026'
      },
      'OFF-WCR-SM-01': {
        officerId: 'OFF-WCR-SM-01',
        name: 'Ramesh Chandra',
        role: 'STATION_MASTER',
        title: 'Station Master (Bhopal Junction)',
        department: 'OPERATIONS',
        zone: 'WCR',
        division: 'Bhopal',
        validPass: 'RailOpt@Sm2026'
      },
      'OFF-ADMIN-01': {
        officerId: 'OFF-ADMIN-01',
        name: 'Shri A. K. Verma',
        role: 'ADMIN',
        title: 'Principal Chief Operations Manager (PCOM)',
        department: 'ADMINISTRATION',
        zone: 'WCR',
        division: 'Bhopal',
        validPass: 'RailOpt@Admin2026'
      },
      'OFF-NR-DOM-01': {
        officerId: 'OFF-NR-DOM-01',
        name: 'Shri R. P. Gupta',
        role: 'DOM',
        title: 'Senior Divisional Operations Manager (Sr. DOM)',
        department: 'OPERATIONS',
        zone: 'NR',
        division: 'Delhi',
        validPass: 'RailOpt@Nr2026'
      },
      // Legacy compatibility
      'OFF-OPS-101': {
        officerId: 'OFF-OPS-101',
        name: 'Rajesh K. Sharma',
        role: 'OPERATIONS_CONTROL',
        title: 'Chief Controller (Operations)',
        department: 'OPERATIONS',
        zone: 'WCR',
        division: 'Bhopal',
        validPass: 'RailOpt@Ops2026'
      },
      'OFF-ENG-201': {
        officerId: 'OFF-ENG-201',
        name: 'Er. Vikram Singh',
        role: 'ENGINEERING_OFFICER',
        title: 'Senior Section Engineer (P-Way)',
        department: 'ENGINEERING',
        zone: 'WCR',
        division: 'Bhopal',
        validPass: 'RailOpt@Eng2026'
      },
      'OFF-SIG-301': {
        officerId: 'OFF-SIG-301',
        name: 'Er. Priya Sundaram',
        role: 'ST_OFFICER',
        title: 'Senior Section Engineer (S&T)',
        department: 'SIGNAL_AND_TELECOM',
        zone: 'WCR',
        division: 'Bhopal',
        validPass: 'RailOpt@Sig2026'
      },
      'OFF-TRD-401': {
        officerId: 'OFF-TRD-401',
        name: 'Er. Amitav Sen',
        role: 'TRD_OFFICER',
        title: 'Senior Section Engineer (TRD / OHE)',
        department: 'TRACTION_DISTRIBUTION',
        zone: 'WCR',
        division: 'Bhopal',
        validPass: 'RailOpt@Trd2026'
      }
    };

    const matched = KNOWN_OFFICERS[trimmedId];

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ officerId: trimmedId, password, zone: targetZone })
      });

      // If backend responded with valid auth
      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        if (data.token && data.officer) {
          this.setToken(data.token);
          this.setUser(data.officer);
          return data;
        }
      }
    } catch (networkErr) {
      console.warn('[authService] Backend offline, validating via local station roster:', networkErr.message);
    }

    // Local authentication fallback
    const matched = KNOWN_OFFICERS[trimmedId];
    if (matched && matched.validPass === password) {
      if (targetZone && matched.zone && matched.zone.toUpperCase() !== targetZone.toUpperCase() && matched.role !== 'ADMIN') {
        throw new Error(`Access Denied: Officer ${trimmedId} is authorized for ${matched.zone} Zone only. You cannot authenticate into ${targetZone} context.`);
      }

      const fallbackOfficer = {
        officerId: matched.officerId,
        name: matched.name,
        role: matched.role,
        title: matched.title,
        department: matched.department,
        zone: matched.zone || targetZone,
        division: matched.division || 'Bhopal'
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
  }
};
