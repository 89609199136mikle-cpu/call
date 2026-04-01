/**
 * CraneApp LocalStorage Manager
 * Settings + drafts + quick cache
 * Fallback for non-IndexedDB browsers
 */

class LocalStorageManager {
  constructor() {
    this.namespace = 'craneapp_';
    this.init();
  }

  init() {
    // Migrate old data if needed
    if (localStorage.getItem('chats')) {
      this.set('chats_v1', JSON.parse(localStorage.getItem('chats')));
      localStorage.removeItem('chats');
    }
  }

  // Settings (theme, notifications, privacy)
  setSetting(key, value) {
    localStorage.setItem(this.namespace + 'setting_' + key, JSON.stringify(value));
  }

  getSetting(key, defaultValue = null) {
    try {
      const value = localStorage.getItem(this.namespace + 'setting_' + key);
      return value ? JSON.parse(value) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  // Chat drafts
  setDraft(chatId, draft) {
    localStorage.setItem(this.namespace + 'draft_' + chatId, draft);
  }

  getDraft(chatId) {
    return localStorage.getItem(this.namespace + 'draft_' + chatId) || '';
  }

  // Quick cache (30min TTL)
  setQuickCache(key, data, ttl = 30 * 60 * 1000) {
    const cache = {
      data,
      expiry: Date.now() + ttl
    };
    localStorage.setItem(this.namespace + 'cache_' + key, JSON.stringify(cache));
  }

  getQuickCache(key) {
    try {
      const cached = localStorage.getItem(this.namespace + 'cache_' + key);
      if (!cached) return null;
      
      const { data, expiry } = JSON.parse(cached);
      return Date.now() < expiry ? data : null;
    } catch {
      return null;
    }
  }

  // Clear drafts for chat
  clearDraft(chatId) {
    localStorage.removeItem(this.namespace + 'draft_' + chatId);
  }

  // Get all drafts
  getAllDrafts() {
    const drafts = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.namespace + 'draft_')) {
        const chatId = key.replace(this.namespace + 'draft_', '');
        drafts[chatId] = this.getDraft(chatId);
      }
    }
    return drafts;
  }
}

window.LocalStorageManager = new LocalStorageManager();
