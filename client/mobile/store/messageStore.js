/**
 * CraneApp Message Store
 * Per-chat messages + sending status + read receipts
 */

class MessageStore {
  constructor() {
    this.state = {
      currentChatId: null,
      messages: [],
      isLoading: false,
      sending: []
    };
    this.listeners = [];
  }

  setState(newState) {
    Object.assign(this.state, newState);
    this.notify();
  }

  async loadMessages(chatId) {
    this.setState({ 
      currentChatId: chatId, 
      isLoading: true 
    });

    // Mock messages
    const messages = [
      { id: Date.now()-1000, senderId: 2, content: 'Hello! How are you?', time: '14:20', isOwn: false },
      { id: Date.now()-800, senderId: 1, content: 'Hey! Doing great thanks!', time: '14:22', isOwn: true, status: 'sent' },
      { id: Date.now()-500, senderId: 2, content: 'What are you working on?', time: '14:23', isOwn: false }
    ];

    this.setState({ 
      messages, 
      isLoading: false 
    });
    
    window.messagesData = messages;
  }

  sendMessage(content) {
    const message = {
      id: Date.now(),
      senderId: window.AuthStore?.state.user?.id || 1,
      content,
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      isOwn: true,
      status: 'sending'
    };

    this.state.messages.push(message);
    this.state.sending.push(message.id);
    this.notify();

    // Simulate delivery
    setTimeout(() => {
      const msg = this.state.messages.find(m => m.id === message.id);
      if (msg) {
        msg.status = 'sent';
        this.state.sending = this.state.sending.filter(id => id !== message.id);
        this.notify();
      }
    }, 1200);
  }

  subscribe(callback) {
    this.listeners.push(callback);
    callback(this.state);
  }

  notify() {
    this.listeners.forEach(cb => cb(this.state));
  }
}

window.MessageStore = new MessageStore();
