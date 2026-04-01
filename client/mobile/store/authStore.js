/**
 * CraneApp Auth Store
 * Centralized auth state + persistence + hydration
 */

class AuthStore {
  constructor() {
    this.state = {
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
      loginStep: 'phone' // phone -> password -> code
    };
    this.listeners = [];
    this.hydrate();
  }

  hydrate() {
    const token = localStorage.getItem('crane_token');
    const userData = localStorage.getItem('crane_user');
    
    if (token && userData) {
      this.state.token = token;
      this.state.user = JSON.parse(userData);
      this.state.isAuthenticated = true;
    }
  }

  setState(newState) {
    Object.assign(this.state, newState);
    this.persist();
    this.notify();
  }

  persist() {
    if (this.state.token && this.state.user) {
      localStorage.setItem('crane_token', this.state.token);
      localStorage.setItem('crane_user', JSON.stringify(this.state.user));
    }
  }

  // Auth actions
  async login(credentials) {
    this.setState({ isLoading: true });
    
    try {
      // Simulate API delay
      await new Promise(r => setTimeout(r, 1200));
      
      const user = {
        id: Date.now(),
        name: credentials.identifier || 'User',
        username: `@user${Math.floor(Math.random()*1000)}`,
        phone: credentials.identifier || '+79991234567',
        avatar: null
      };
      
      this.setState({
        user,
        token: `jwt_${Date.now()}`,
        isAuthenticated: true,
        isLoading: false
      });
      
      window.dispatchEvent(new CustomEvent('auth:success'));
      return { success: true, user };
    } catch (error) {
      this.setState({ isLoading: false });
      return { success: false, error: error.message };
    }
  }

  logout() {
    localStorage.removeItem('crane_token');
    localStorage.removeItem('crane_user');
    this.setState({
      user: null,
      token: null,
      isAuthenticated: false
    });
    window.location.hash = '/auth/login';
  }

  // Subscriptions
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  notify() {
    this.listeners.forEach(callback => callback(this.state));
  }
}

window.AuthStore = new AuthStore();
