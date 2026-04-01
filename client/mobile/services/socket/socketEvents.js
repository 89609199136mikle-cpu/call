/**
 * CraneApp Socket Events Handler
 * High-level socket methods + event dispatching
 */

class SocketEvents {
  constructor() {
    this.handlers = new Map();
    this.initEventListeners();
  }

  // Send message to chat
  sendMessage(chatId, content) {
    window.SocketProvider.send('message:send', {
      chatId,
      content,
      timestamp: Date.now()
    });
  }

  // Start call (WebRTC signaling)
  startCall(contactId, type = 'voice') {
    window.SocketProvider.send('call:offer', {
      to: contactId,
      type,
      sdp: null // WebRTC SDP will be added later
    });
  }

  // Answer call
  answerCall(callId, sdp) {
    window.SocketProvider.send('call:answer', {
      callId,
      sdp
    });
  }

  // ICE candidate exchange (WebRTC)
  sendIceCandidate(callId, candidate) {
    window.SocketProvider.send('call:ice-candidate', {
      callId,
      candidate
    });
  }

  // Typing indicator
  sendTyping(chatId, isTyping) {
    window.SocketProvider.send('typing', {
      chatId,
      isTyping
    });
  }

  // Read receipts
  sendRead(chatId, messageIds) {
    window.SocketProvider.send('message:read', {
      chatId,
      messageIds
    });
  }

  // Register event handlers
  on(event, callback) {
    this.handlers.set(event, callback);
  }

  // Initialize global event listeners
  initEventListeners() {
    // Message received
    window.addEventListener('socket:message', (e) => {
      const { handlers } = this;
      handlers.get('message')?.(e.detail);
      
      // Dispatch to hooks
      window.dispatchEvent(new CustomEvent('chat:message', { detail: e.detail }));
    });

    // User online/offline
    window.addEventListener('socket:user-online', (e) => {
      handlers.get('user:online')?.(e.detail);
      window.dispatchEvent(new CustomEvent('user:online', { detail: e.detail }));
    });

    window.addEventListener('socket:user-offline', (e) => {
      handlers.get('user:offline')?.(e.detail);
      window.dispatchEvent(new CustomEvent('user:offline', { detail: e.detail }));
    });

    // Call events
    window.addEventListener('socket:call-offer', (e) => {
      handlers.get('call:offer')?.(e.detail);
      window.dispatchEvent(new CustomEvent('call:offer', { detail: e.detail }));
    });

    window.addEventListener('socket:call-answer', (e) => {
      handlers.get('call:answer')?.(e.detail);
    });

    // Typing indicator
    window.addEventListener('socket:typing', (e) => {
      handlers.get('typing')?.(e.detail);
    });
  }
}

window.SocketEvents = new SocketEvents();
