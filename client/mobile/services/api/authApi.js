/**
 * CraneApp Auth API Service
 * REST API endpoints for authentication
 * Railway-ready, JWT-based
 */

class AuthApi {
  constructor() {
    this.baseURL = 'https://api.craneapp.com/v1';
    this.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  // Login with phone/email + password/code
  async login(credentials) {
    const endpoint = credentials.code 
      ? '/auth/verify' 
      : credentials.password 
        ? '/auth/login' 
        : '/auth/start';
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        identifier: credentials.identifier || credentials.phone,
        password: credentials.password,
        code: credentials.code
      })
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return await response.json();
  }

  // Register new user
  async register(data) {
    const response = await fetch(`${this.baseURL}/auth/register`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return await response.json();
  }

  // Refresh JWT token
  async refreshToken() {
    const token = localStorage.getItem('crane_token');
    const response = await fetch(`${this.baseURL}/auth/refresh`, {
      method: 'POST',
      headers: {
        ...this.headers,
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    return await response.json();
  }

  // Logout (invalidate token)
  async logout() {
    const token = localStorage.getItem('crane_token');
    await fetch(`${this.baseURL}/auth/logout`, {
      method: 'POST',
      headers: {
        ...this.headers,
        'Authorization': `Bearer ${token}`
      }
    });
  }
}

window.AuthApi = new AuthApi();
