import { getAuthState } from '../store/authStore.js';

const ROUTES = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  PHONE_VERIFICATION: '/auth/phone-verification',
  CHATS: '/chats',
  CHAT: '/chats/:id',
  CREATE_GROUP: '/chats/create-group',
  CREATE_CHANNEL: '/chats/create-channel',
  CONTACTS: '/contacts',
  CONTACT_PROFILE: '/contacts/:id',
  CALLS: '/calls',
  CALL: '/calls/:id',
  SEARCH: '/search',
  PROFILE: '/profile',
  EDIT_PROFILE: '/profile/edit',
  SETTINGS: '/settings',
  SETTINGS_APPEARANCE: '/settings/appearance',
  SETTINGS_PRIVACY: '/settings/privacy',
  SETTINGS_DATA: '/settings/data-storage',
  SETTINGS_NOTIFICATIONS: '/settings/notifications',
  SETTINGS_POWER: '/settings/power-saving',
  SETTINGS_LANGUAGE: '/settings/language',
  SETTINGS_FEATURES: '/settings/features',
};

class NavigationManager {
  constructor() {
    this.history = [];
    this.currentRoute = null;
    this.providers = null;
    this.listeners = new Set();
  }

  async init(providers) {
    this.providers = providers;
    this._bindPopState();
    await this._resolveInitialRoute();
  }

  _bindPopState() {
    window.addEventListener('popstate', (event) => {
      const route = event.state?.route || window.location.pathname;
      this._renderRoute(route, false);
    });
  }

  async _resolveInitialRoute() {
    const auth = getAuthState();
    const path = window.location.pathname;

    if (!auth.isAuthenticated) {
      await this.navigate(ROUTES.LOGIN, { replace: true });
    } else if (path === '/' || path === '') {
      await this.navigate(ROUTES.CHATS, { replace: true });
    } else {
      await this._renderRoute(path, false);
    }
  }

  async navigate(route, options = {}) {
    const { replace = false, params = {}, state = {} } = options;

    let resolvedRoute = route;
    for (const [key, value] of Object.entries(params)) {
      resolvedRoute = resolvedRoute.replace(`:${key}`, value);
    }

    const fullState = { route: resolvedRoute, ...state };

    if (replace) {
      window.history.replaceState(fullState, '', resolvedRoute);
    } else {
      window.history.pushState(fullState, '', resolvedRoute);
      this.history.push(resolvedRoute);
    }

    await this._renderRoute(resolvedRoute);
  }

  async goBack() {
    if (this.history.length > 1) {
      this.history.pop();
      window.history.back();
    } else {
      await this.navigate(ROUTES.CHATS, { replace: true });
    }
  }

  async _renderRoute(path) {
    const root = document.getElementById('root');
    if (!root) return;

    const matchedScreen = this._matchRoute(path);

    if (!matchedScreen) {
      root.innerHTML = `<div style="color:#fff;padding:32px;text-align:center;">404 — Page not found</div>`;
      return;
    }

    root.innerHTML = '';
    root.setAttribute('data-route', path);

    try {
      const module = await import(matchedScreen.file);
      if (module.render) {
        await module.render(root, matchedScreen.params, this.providers);
      }
    } catch (error) {
      console.error('[Navigation] render error:', error);
      root.innerHTML = `<div style="color:#ff5252;padding:32px;">Failed to load screen: ${path}</div>`;
    }

    this.currentRoute = path;
    this._notifyListeners(path);
  }

  _matchRoute(path) {
    const screenMap = [
      { pattern: /^\/auth\/login$/, file: '../screens/auth/login.html', params: {} },
      { pattern: /^\/auth\/register$/, file: '../screens/auth/register.html', params: {} },
      { pattern: /^\/auth\/phone-verification$/, file: '../screens/auth/phoneVerification.html', params: {} },
      { pattern: /^\/chats$/, file: '../screens/chats/chats.html', params: {} },
      { pattern: /^\/chats\/create-group$/, file: '../screens/chats/createGroup.html', params: {} },
      { pattern: /^\/chats\/create-channel$/, file: '../screens/chats/createChannel.html', params: {} },
      { pattern: /^\/chats\/([^/]+)$/, file: '../screens/chats/chat.html', params: (m) => ({ id: m[1] }) },
      { pattern: /^\/contacts$/, file: '../screens/contacts/contacts.html', params: {} },
      { pattern: /^\/contacts\/([^/]+)$/, file: '../screens/contacts/contactProfile.html', params: (m) => ({ id: m[1] }) },
      { pattern: /^\/calls$/, file: '../screens/calls/calls.html', params: {} },
      { pattern: /^\/calls\/([^/]+)$/, file: '../screens/calls/call.html', params: (m) => ({ id: m[1] }) },
      { pattern: /^\/search$/, file: '../screens/search/search.html', params: {} },
      { pattern: /^\/profile$/, file: '../screens/profile/profile.html', params: {} },
      { pattern: /^\/profile\/edit$/, file: '../screens/profile/editProfile.html', params: {} },
      { pattern: /^\/settings$/, file: '../screens/settings/settings.html', params: {} },
      { pattern: /^\/settings\/appearance$/, file: '../screens/settings/appearance.html', params: {} },
      { pattern: /^\/settings\/privacy$/, file: '../screens/settings/privacy.html', params: {} },
      { pattern: /^\/settings\/data-storage$/, file: '../screens/settings/dataStorage.html', params: {} },
      { pattern: /^\/settings\/notifications$/, file: '../screens/settings/notifications.html', params: {} },
      { pattern: /^\/settings\/power-saving$/, file: '../screens/settings/powerSaving.html', params: {} },
      { pattern: /^\/settings\/language$/, file: '../screens/settings/language.html', params: {} },
      { pattern: /^\/settings\/features$/, file: '../screens/settings/features.html', params: {} },
    ];

    for (const screen of screenMap) {
      const match = path.match(screen.pattern);
      if (match) {
        return {
          file: screen.file,
          params: typeof screen.params === 'function' ? screen.params(match) : screen.params,
        };
      }
    }

    return null;
  }

  onRouteChange(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  _notifyListeners(route) {
    this.listeners.forEach((fn) => fn(route));
  }

  getCurrentRoute() {
    return this.currentRoute;
  }
}

const navigationManager = new NavigationManager();

export async function initNavigation(providers) {
  await navigationManager.init(providers);
}

export function navigate(route, options) {
  return navigationManager.navigate(route, options);
}

export function goBack() {
  return navigationManager.goBack();
}

export function getCurrentRoute() {
  return navigationManager.getCurrentRoute();
}

export function onRouteChange(listener) {
  return navigationManager.onRouteChange(listener);
}

export { ROUTES };
export default navigationManager;
