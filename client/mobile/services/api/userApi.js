/**
 * CraneApp User API Service
 * User profile, contacts, online status
 */

class UserApi {
  constructor() {
    this.baseURL = 'https://api.craneapp.com/v1';
  }

  // Get user profile
  async getProfile(userId = null) {
    const token = localStorage.getItem('crane_token');
    const url = userId 
      ? `${this.baseURL}/users/${userId}` 
      : `${this.baseURL}/me`;
      
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Failed to load profile');
    return await response.json();
  }

  // Update profile
  async updateProfile(data) {
    const token = localStorage.getItem('crane_token');
    const response = await fetch(`${this.baseURL}/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error('Failed to update profile');
    return await response.json();
  }

  // Get user contacts
  async getContacts() {
    const token = localStorage.getItem('crane_token');
    const response = await fetch(`${this.baseURL}/contacts`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Failed to load contacts');
    return await response.json();
  }

  // Search global users
  async searchUsers(query, limit = 20) {
    const token = localStorage.getItem('crane_token');
    const response = await fetch(`${this.baseURL}/users/search?q=${encodeURIComponent(query)}&limit=${limit}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Failed to search users');
    return await response.json();
  }

  // Block/unblock user
  async toggleBlock(userId) {
    const token = localStorage.getItem('crane_token');
    const response = await fetch(`${this.baseURL}/users/${userId}/block`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    return response.ok;
  }
}

window.UserApi = new UserApi();
