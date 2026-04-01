/**
 * CraneApp Messages Hook
 * Real-time message management for active chat
 */

export function useMessages(chatId) {
  const messages = {
    list: [],
    isLoading: false,
    sending: new Set()
  };

  // Load messages for chat
  async function loadMessages() {
    messages.isLoading = true;
    
    try {
      // Mock messages (replace with messageApi.getMessages(chatId))
      messages.list = [
        { id: 1, senderId: 2, content: 'Hello! How are you today?', time: '14:20', isOwn: false },
        { id: 2, senderId: 1, content: 'Hey Alice! I\'m doing great, thanks!', time: '14:22', isOwn: true },
        { id: 3, senderId: 2, content: 'Great to hear! What are you working on?', time: '14:23', isOwn: false }
      ];
      
      window.messagesData = messages.list;
      window.dispatchEvent(new CustomEvent('messages:loaded'));
      
    } finally {
      messages.isLoading = false;
    }
  }

  // Send message
  async function sendMessage(content) {
    const messageId = Date.now();
    messages.sending.add(messageId);
    
    const message = {
      id: messageId,
      senderId: window.AuthProvider.getUser()?.id || 1,
      content,
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      isOwn: true,
      status: 'sending'
    };
    
    messages.list.push(message);
    window.dispatchEvent(new CustomEvent('messages:sent'));
    
    // Socket emit
    window.SocketProvider.sendMessage(chatId, content);
    
    // Simulate delivery
    setTimeout(() => {
      messages.sending.delete(messageId);
      message.status = 'sent';
    }, 1000);
  }

  // Socket events
  window.addEventListener('socket:message-received', (e) => {
    if (e.detail.chatId == chatId && !e.detail.isOwn) {
      messages.list.push(e.detail);
      window.dispatchEvent(new CustomEvent('messages:received'));
    }
  });

  loadMessages();

  window.MessageProvider = {
    loadMessages,
    sendMessage,
    state: messages
  };

  return {
    messages: () => messages.list,
    isLoading: () => messages.isLoading,
    isSending: (id) => messages.sending.has(id),
    sendMessage,
    loadMessages
  };
}
