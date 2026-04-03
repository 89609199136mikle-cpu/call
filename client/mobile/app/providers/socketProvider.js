import { socketClient } from '../../services/socket/socketClient.js';
import { registerSocketEvents } from '../../services/socket/socketEvents.js';
import { getAuthState } from '../../store/authStore.js';

const RECONNECT_DELAY = 3000;
const MAX_RECONNECT_ATTEMPTS = 10;

export class SocketProvider {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.reconnectAttempts = 0;
    this.reconnectTimer = null;
    this.listeners = new Map();
  }

  async init() {
    const auth = getAuthState();
    if (!auth.isAuthenticated || !auth.token) {
      console.warn('[SocketProvider] not authenticated, skipping socket init');
      return;
    }

    await this._connect(auth.token);
  }

  async _connect(token) {
    try {
      this.socket = await socketClient.connect({
        token,
        onConnect: () => this._onConnect(),
        onDisconnect: (reason) => this._onDisconnect(reason),
        onError: (error) => this._onError(error),
      });

      registerSocketEvents(this.socket, {
        onMessage: (data) => this._emit('message', data),
        onTyping: (data) => this._emit('typing', data),
        onPresence: (data) => this._emit('presence', data),
        onCallIncoming: (data) => this._emit('call:incoming', data),
        onCallSignal: (data) => this._emit('call:signal', data),
        onCallEnd: (data) => this._emit('call:end', data),
        onNotification: (data) => this._emit('notification', data),
        onMessageRead: (data) => this._emit('message:read', data),
        onMessageDeleted: (data) => this._emit('message:deleted', data),
        onReaction: (data) => this._emit('reaction', data),
      });
    } catch (error) {
      console.error('[SocketProvider] connection error:', error);
      this._scheduleReconnect(token);
    }
  }

  _onConnect() {
    this.connected = true;
    this.reconnectAttempts = 0;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this._emit('connect', null);
    console.info('[SocketProvider] connected');
  }

  _onDisconnect(reason) {
    this.connected = false;
    this._emit('disconnect', reason);
    console.warn('[SocketProvider] disconnected:', reason);

    if (reason !== 'io client disconnect') {
      const auth = getAuthState();
      if (auth.token) this._scheduleReconnect(auth.token);
    }
  }

  _onError(error) {
    console.error('[SocketProvider] socket error:', error);
    this._emit('error', error);
  }

  _scheduleReconnect(token) {
    if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.error('[SocketProvider] max reconnect attempts reached');
      return;
    }

    const delay = RECONNECT_DELAY * Math.pow(1.5, this.reconnectAttempts);
    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(async () => {
      console.info(`[SocketProvider] reconnect attempt ${this.reconnectAttempts}`);
      await this._connect(token);
    }, delay);
  }

  emit(event, data) {
    if (!this.socket || !this.connected) {
      console.warn(`[SocketProvider] cannot emit "${event}" — not connected`);
      return false;
    }
    this.socket.emit(event, data);
    return true;
  }

  on(event, listener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(listener);
    return () => this.off(event, listener);
  }

  off(event, listener) {
    this.listeners.get(event)?.delete(listener);
  }

  _emit(event, data) {
    this.listeners.get(event)?.forEach((fn) => fn(data));
  }

  isConnected() {
    return this.connected;
  }

  async disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.socket) {
      await socketClient.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }
}
