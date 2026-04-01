/**
 * CraneApp Socket Client
 * WebSocket connection + reconnection + heartbeats
 */

class SocketClient {
  constructor() {
    this.ws = null;
    this.url = 'wss://socket.craneapp.com';
    this.reconnectAttempts = 0;
    this.maxReconnects = 5;
    this.reconnectDelay = 1000;
    this.isConnected = false;
  }

  connect() {
    const token = localStorage.getItem('crane_token');
    if (!token) return;

    this.ws = new WebSocket(`${this.url}?token=${token}`);

    this.ws.onopen = () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      console.log('✅ Socket connected');
      
      // Heartbeat
      this.heartbeat = setInterval(() => {
        if (this.isConnected) this.send('ping');
      }, 30000);
      
      window.dispatchEvent(new CustomEvent('socket:connected'));
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleEvent(data);
    };

    this.ws.onclose = () => {
      this.isConnected = false;
      clearInterval(this.heartbeat);
      this.reconnect();
    };

    this.ws.onerror = (error) => {
      console.error('Socket error:', error);
    };
  }

  send(event, data = {}) {
    if (this.isConnected && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ event, data }));
    }
  }

  handleEvent(data) {
    switch (data.event) {
      case 'message':
        window.dispatchEvent(new CustomEvent('socket:message', { detail: data.data }));
        break;
      case 'user:online':
        window.dispatchEvent(new CustomEvent('socket:user-online', { detail: data.data }));
        break;
      case 'user:offline':
        window.dispatchEvent(new CustomEvent('socket:user-offline', { detail: data.data }));
        break;
      case 'call:offer':
        window.dispatchEvent(new CustomEvent('socket:call-offer', { detail: data.data }));
        break;
    }
  }

  reconnect() {
    if (this.reconnectAttempts < this.maxReconnects) {
      this.reconnectAttempts++;
      setTimeout(() => this.connect(), this.reconnectDelay * this.reconnectAttempts);
    }
  }
}

window.SocketProvider = new SocketClient();
window.SocketProvider.connect();
