/**
 * CraneApp Socket Provider (Socket.io Client)
 * Realtime: Messages/Typing/Online/Calls
 */

export class SocketProvider {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.reconnectAttempts = 0;
    this.init();
  }

  init() {
    // Connect when authenticated
    window.addEventListener('auth:login', () => this.connect());
    window.addEventListener('auth:logout', () => this.disconnect());
    
    // Auto-reconnect
    window.addEventListener('online', () => this.connect());
  }

  connect() {
    if (!window.AuthProvider?.isAuth()) return;
    
    this.socket = io('/ws', {
      auth: { token: window.AuthProvider.getToken() },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    this.socket.on('connect', () => {
      this.connected = true;
      this.reconnectAttempts = 0;
      console.log('Socket: Connected');
      
      window.dispatchEvent(new CustomEvent('socket:connected'));
    });

    this.socket.on('disconnect', () => {
      this.connected = false;
      console.log('Socket: Disconnected');
    });

    // Realtime events
    this.socket.on('message', (data) => {
      window.dispatchEvent(new CustomEvent('chat:message', { detail: data }));
    });

    this.socket.on('typing', (data) => {
      window.dispatchEvent(new CustomEvent('chat:typing', { detail: data }));
    });

    this.socket.on('user:online', (data) => {
      window.dispatchEvent(new CustomEvent('user:online', { detail: data }));
    });

    this.socket.on('call:offer', (data) => {
      window.dispatchEvent(new CustomEvent('call:offer', { detail: data }));
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  // Send methods
  sendMessage(chatId, content) {
    if (!this.connected) return false;
    this.socket.emit('message', { chatId, content });
    return true;
  }

  startTyping(chatId) {
    if (!this.connected) return;
    this.socket.emit('typing:start', { chatId });
  }

  stopTyping(chatId) {
    if (!this.connected) return;
    this.socket.emit('typing:stop', { chatId });
  }

  sendCallOffer(calleeId, offer) {
    if (!this.connected) return;
    this.socket.emit('call:offer', { calleeId, offer });
  }

  attach(root) {
    window.SocketProvider = this;
  }
}
