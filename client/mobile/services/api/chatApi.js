/**
 * CraneApp Chat API Service
 * REST endpoints for chats/groups/channels
 */

class ChatApi {
  constructor() {
    this.baseURL = 'https://api.craneapp.com/v1';
  }

  // Get user chats
  async getChats() {
    const token = localStorage.getItem('crane_token');
    const response = await fetch(`${this.baseURL}/chats`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error('Failed to load chats');
    return await response.json();
  }

  // Get chat messages
  async getMessages(chatId, limit = 50, before = null) {
    const params = new URLSearchParams({ limit });
    if (before) params.append('before', before);
    
    const token = localStorage.getItem('crane_token');
    const response = await fetch(`${this.baseURL}/chats/${chatId}/messages?${params}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Failed to load messages');
    return await response.json();
  }

  // Create group
  async createGroup(name, members) {
    const token = localStorage.getItem('crane_token');
    const response = await fetch(`${this.baseURL}/groups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name, members })
    });

    if (!response.ok) throw new Error('Failed to create group');
    return await response.json();
  }

  // Create channel
  async createChannel(name, description, privacy = 'public') {
    const token = localStorage.getItem('crane_token');
    const response = await fetch(`${this.baseURL}/channels`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name, description, privacy })
    });

    if (!response.ok) throw new Error('Failed to create channel');
    return await response.json();
  }
}

window.ChatApi = new ChatApi();
