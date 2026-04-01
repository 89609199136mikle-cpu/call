/**
 * CraneApp Auth Context Provider
 * JWT Auth + User State Management (Zustand Pattern)
 */

export class AuthProvider {
  constructor() {
    this.user = null;
    this.token = null;
    this.isAuthenticated = false;
    this.init();
  }

  init() {
    // Restore session from localStorage
    const savedToken = localStorage.getItem('craneapp_token');
    const savedUser = localStorage.getItem('craneapp_user');
    
    if (savedToken && savedUser) {
      this.token = savedToken;
      this.user = JSON.parse(savedUser);
      this.isAuthenticated = true;
      this.setAuthHeader();
    }
    
    // Listen for auth events
    window.addEventListener('storage', (e) => {
      if (e.key === 'craneapp_logout') {
        this.logout();
      }
    });
  }

  async login(credentials) {
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) throw new Error('Login failed');

      const { accessToken, user } = await response.json();
      this.setSession(accessToken, user);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async register(userData) {
    try {
      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      if (!response.ok) throw new Error('Registration failed');

      const { accessToken, user } = await response.json();
      this.setSession(accessToken, user);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  setSession(token, user) {
    this.token = token;
    this.user = user;
    this.isAuthenticated = true;
    
    localStorage.setItem('craneapp_token', token);
    localStorage.setItem('craneapp_user', JSON.stringify(user));
    this.setAuthHeader();
    
    // Emit auth event
    window.dispatchEvent(new CustomEvent('auth:login', { 
      detail: { user } 
    }));
  }

  logout() {
    this.token = null;
    this.user = null;
    this.isAuthenticated = false;
    
    localStorage.removeItem('craneapp_token');
    localStorage.removeItem('craneapp_user');
    this.clearAuthHeader();
    
    window.dispatchEvent(new CustomEvent('auth:logout'));
  }

  setAuthHeader() {
    if (this.token) {
      window.authHeader = { Authorization: `Bearer ${this.token}` };
    }
  }

  clearAuthHeader() {
    delete window.authHeader;
  }

  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('craneapp_refresh');
      const response = await fetch('/api/v1/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });

      if (response.ok) {
        const { accessToken, user } = await response.json();
        this.setSession(accessToken, user);
        return true;
      }
    } catch (error) {
      this.logout();
    }
    return false;
  }

  // Provider API (Context-like)
  getUser() { return this.user; }
  isAuth() { return this.isAuthenticated; }
  getToken() { return this.token; }

  attach(root) {
    // Expose auth globally (Context pattern)
    window.AuthProvider = this;
    
    // Auto-refresh token on 401
    window.addEventListener('fetch:error', async (e) => {
      if (e.detail.status === 401) {
        const refreshed = await this.refreshToken();
        if (!refreshed) window.location.hash = '/auth/login';
      }
    });
  }
}
