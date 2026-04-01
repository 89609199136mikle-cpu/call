/**
 * CraneApp Auth Hook
 * Telegram-style authentication state management
 * Railway-ready, PWA-compatible
 */

export function useAuth() {
  const auth = {
    user: null,
    token: null,
    isLoading: false,
    isAuthenticated: false
  };

  // Initialize auth state
  function init() {
    const token = localStorage.getItem('crane_token');
    const userData = localStorage.getItem('crane_user');
    
    if (token && userData) {
      auth.token = token;
      auth.user = JSON.parse(userData);
      auth.isAuthenticated = true;
    }
  }

  // Login handler
  async function login(credentials) {
    auth.isLoading = true;
    
    try {
      // Mock API call (replace with real authApi.login)
      const response = await new Promise(resolve => {
        setTimeout(() => {
          resolve({
            success: true,
            token: 'mock-jwt-token-12345',
            user: {
              id: 1,
              name: credentials.identifier || 'John Doe',
              username: '@johndoe',
              phone: credentials.identifier || '+7 999 123-45-67',
              avatar: null
            }
          });
        }, 1500);
      });
      
      if (response.success) {
        auth.token = response.token;
        auth.user = response.user;
        auth.isAuthenticated = true;
        
        localStorage.setItem('crane_token', response.token);
        localStorage.setItem('crane_user', JSON.stringify(response.user));
        
        window.dispatchEvent(new CustomEvent('auth:login', { 
          detail: response.user 
        }));
      }
      
      return response;
    } finally {
      auth.isLoading = false;
    }
  }

  // Logout handler
  function logout() {
    auth.user = null;
    auth.token = null;
    auth.isAuthenticated = false;
    
    localStorage.removeItem('crane_token');
    localStorage.removeItem('crane_user');
    
    window.dispatchEvent(new CustomEvent('auth:logout'));
    window.location.hash = '/auth/login';
  }

  // Get current user
  function getUser() {
    return auth.user;
  }

  // Check auth status
  function isAuth() {
    return auth.isAuthenticated;
  }

  // Get auth token for API calls
  function getToken() {
    return auth.token;
  }

  // Set session manually
  function setSession(token, user) {
    auth.token = token;
    auth.user = user;
    auth.isAuthenticated = true;
    
    localStorage.setItem('crane_token', token);
    localStorage.setItem('crane_user', JSON.stringify(user));
  }

  init();

  // Expose auth methods globally for screens
  window.AuthProvider = {
    login,
    logout,
    getUser,
    isAuth,
    getToken,
    setSession,
    state: auth
  };

  return {
    user: auth.user,
    isLoading: () => auth.isLoading,
    isAuthenticated: () => auth.isAuthenticated,
    login,
    logout,
    getUser,
    isAuth,
    getToken
  };
}
