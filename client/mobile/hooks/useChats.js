/**
 * CraneApp Chats Hook
 * Real-time chat state management + socket integration
 */

export function useChats() {
  const chats = {
    list: [],
    activeChat: null,
    isLoading: false,
    unreadCounts: {}
  };

  // Load chats from cache/API
  async function loadChats() {
    chats.isLoading = true;
    
    try {
      // Mock data (replace with chatApi.getChats())
      chats.list = [
        { 
          id: 1, 
          name: 'Alice Johnson', 
          lastMessage: 'Hey! How are you?', 
          time: '14:30', 
          unread: 3, 
          online: true 
        },
        { 
          id: 2, 
          name: 'Bob Wilson', 
          lastMessage: 'See you tomorrow', 
          time: '10:15', 
          unread: 0, 
          online: false 
        }
      ];
      
      window.chatsData = chats.list;
      window.dispatchEvent(new CustomEvent('chats:updated'));
      
    } finally {
      chats.isLoading = false;
    }
  }

  // Set active chat
  function setActiveChat(chatId) {
    chats.activeChat = chats.list.find(chat => chat.id == chatId);
    window.activeChatId = chatId;
  }

  // Update unread count
  function updateUnread(chatId, count) {
    const chat = chats.list.find(c => c.id == chatId);
    if (chat) {
      chat.unread = count;
      chats.unreadCounts[chatId] = count;
      window.dispatchEvent(new CustomEvent('chats:unread-updated'));
    }
  }

  // Socket event listeners
  function initSocketEvents() {
    window.addEventListener('socket:message', (e) => {
      const chat = chats.list.find(c => c.id == e.detail.chatId);
      if (chat && chats.activeChat?.id != e.detail.chatId) {
        chat.lastMessage = e.detail.content;
        chat.unread++;
        chats.unreadCounts[chat.id] = chat.unread;
      }
      window.dispatchEvent(new CustomEvent('chats:updated'));
    });

    window.addEventListener('socket:user-online', (e) => {
      const chat = chats.list.find(c => c.id == e.detail.chatId);
      if (chat) chat.online = true;
      window.dispatchEvent(new CustomEvent('chats:updated'));
    });
  }

  // Initialize
  loadChats();
  initSocketEvents();

  // Global provider
  window.ChatProvider = {
    loadChats,
    setActiveChat,
    updateUnread,
    state: chats
  };

  return {
    chats: () => chats.list,
    activeChat: () => chats.activeChat,
    isLoading: () => chats.isLoading,
    unreadCounts: () => chats.unreadCounts,
    loadChats,
    setActiveChat,
    updateUnread
  };
}
