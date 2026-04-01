/**
 * CraneApp Message API Service
 * Send/receive message endpoints
 */

class MessageApi {
  constructor() {
    this.baseURL = 'https://api.craneapp.com/v1';
  }

  // Send text message
  async sendMessage(chatId, content) {
    const token = localStorage.getItem('crane_token');
    const response = await fetch(`${this.baseURL}/chats/${chatId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ content })
    });

    if (!response.ok) throw new Error('Failed to send message');
    return await response.json();
  }

  // Send media message
  async sendMedia(chatId, file, type = 'photo') {
    const token = localStorage.getItem('crane_token');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('chatId', chatId);

    const response = await fetch(`${this.baseURL}/media/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });

    if (!response.ok) throw new Error('Failed to upload media');
    return await response.json();
  }

  // Mark messages as read
  async markRead(chatId, messageIds) {
    const token = localStorage.getItem('crane_token');
    const response = await fetch(`${this.baseURL}/chats/${chatId}/read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ messageIds })
    });

    return response.ok;
  }
}

window.MessageApi = new MessageApi();
