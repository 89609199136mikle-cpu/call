/**
 * CraneApp Cache Manager
 * IndexedDB + LRU cache + offline-first
 */

class CacheManager {
  constructor() {
    this.dbName = 'CraneAppCache';
    this.version = 1;
    this.cache = new Map();
    this.initDB();
  }

  async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        db.createObjectStore('chats', { keyPath: 'id' });
        db.createObjectStore('messages', { keyPath: 'id' });
        db.createObjectStore('media', { keyPath: 'id' });
      };
    });
  }

  // Cache chats (with TTL)
  async setChats(chats, ttl = 5 * 60 * 1000) {
    const tx = this.db.transaction('chats', 'readwrite');
    const store = tx.objectStore('chats');
    
    chats.forEach(chat => {
      chat.cacheExpiry = Date.now() + ttl;
      store.put(chat);
    });
  }

  // Get cached chats
  async getChats() {
    const tx = this.db.transaction('chats', 'readonly');
    const store = tx.objectStore('chats');
    const request = store.getAll();
    
    return new Promise(resolve => {
      request.onsuccess = () => {
        const validChats = request.result.filter(chat => 
          !chat.cacheExpiry || chat.cacheExpiry > Date.now()
        );
        resolve(validChats);
      };
    });
  }

  // Cache messages
  async setMessages(chatId, messages, ttl = 24 * 60 * 60 * 1000) {
    const tx = this.db.transaction('messages', 'readwrite');
    const store = tx.objectStore('messages');
    
    messages.forEach(msg => {
      msg.chatId = chatId;
      msg.cacheExpiry = Date.now() + ttl;
      store.put(msg);
    });
  }

  // Clear expired cache
  async clearExpired() {
    const tx = this.db.transaction(['chats', 'messages'], 'readwrite');
    ['chats', 'messages'].forEach(storeName => {
      const store = tx.objectStore(storeName);
      const request = store.getAll();
      
      request.onsuccess = () => {
        request.result.forEach(item => {
          if (item.cacheExpiry && item.cacheExpiry < Date.now()) {
            store.delete(item.id);
          }
        });
      };
    });
  }
}

window.CacheManager = new CacheManager();
