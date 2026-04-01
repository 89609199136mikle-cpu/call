/**
 * CraneApp Chat Store
 * Chats list + active chat + unread counts
 */

class ChatStore {
  constructor() {
    this.state = {
      chats: [],
      activeChat: null,
      unreadCounts: {},
      isLoading: false
    };
    this.listeners = [];
    this.hydrate();
  }

  hydrate() {
    const cached = window.LocalStorageManager?.getQuickCache('chats');
    if (cached) {
      this.state.chats = cached;
    }
  }

  setState(newState) {
    Object.assign(this.state, newState);
    window.LocalStorageManager?.setQuickCache('chats', this.state.chats);
    this.notify();
  }

  async loadChats() {
    this.setState({ isLoading: true });
    
    // Mock API response
    const chats = [
      { id: 1, name: 'Alice Johnson', lastMessage: 'Hey! How are you?', time: '14:30', unread: 3, online: true },
      { id: 2, name: 'Team Project', lastMessage: 'New task assigned', time: '10:15', unread: 1, group: true },
      { id: 3, name: 'Bob Wilson', lastMessage: 'See you tomorrow', time: '09:45', unread: 0, online: false }
    ];
    
    this.setState({ 
      chats, 
      isLoading: false,
      unreadCounts: chats.reduce((acc, chat) => {
        acc[chat.id] = chat.unread;
        return acc;
      }, {})
    });
    
    window.chatsData = chats;
  }

  setActiveChat(chatId) {
    const chat = this.state.chats.find(c => c.id == chatId);
    this.setState({ activeChat: chat });
    window.activeChatId = chatId;
  }

  updateUnread(chatId, count) {
    const chat = this.state.chats.find(c => c.id == chatId);
    if (chat) {
      chat.unread = count;
      this.state.unreadCounts[chatId] = count;
      this.notify();
    }
  }

  subscribe(callback) {
    this.listeners.push(callback);
    callback(this.state); // Initial state
  }

  notify() {
    this.listeners.forEach(cb => cb(this.state));
  }
}

window.ChatStore = new ChatStore();
