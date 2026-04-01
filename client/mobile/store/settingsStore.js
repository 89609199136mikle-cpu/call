/**
 * CraneApp Settings Store
 * Theme + notifications + privacy + persistence
 */

class SettingsStore {
  constructor() {
    this.state = {
      theme: 'telegram',
      notifications: {
        privateChats: true,
        groups: true,
        channels: true,
        sound: 'default',
        vibrate: true
      },
      privacy: {
        phoneNumber: 'contacts',
        profilePhoto: 'everybody',
        lastSeen: 'contacts'
      },
      appearance: {
        autoNightMode: true,
        reduceMotion: false
      },
      language: 'en',
      powerSaving: false
    };
    this.listeners = [];
    this.hydrate();
  }

  hydrate() {
    const saved = window.LocalStorageManager?.getSetting('settings');
    if (saved) {
      this.state = { ...this.state, ...saved };
    }
  }

  setState(newState) {
    Object.assign(this.state, newState);
    window.LocalStorageManager?.setSetting('settings', this.state);
    this.notify();
  }

  // Theme management
  setTheme(theme) {
    this.state.theme = theme;
    document.body.className = `theme-${theme}`;
    this.notify();
  }

  toggleAutoNightMode(enabled) {
    this.state.appearance.autoNightMode = enabled;
    this.notify();
  }

  // Notifications
  toggleNotifications(type, enabled) {
    this.state.notifications[type] = enabled;
    this.notify();
  }

  setNotificationSound(sound) {
    this.state.notifications.sound = sound;
    this.notify();
  }

  // Privacy
  setPrivacySetting(category, value) {
    this.state.privacy[category] = value;
    this.notify();
  }

  // Language
  setLanguage(lang) {
    this.state.language = lang;
    document.documentElement.lang = lang;
    this.notify();
  }

  // Subscriptions
  subscribe(callback) {
    this.listeners.push(callback);
    callback(this.state);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notify() {
    this.listeners.forEach(callback => callback(this.state));
  }
}

window.SettingsStore = new SettingsStore();
