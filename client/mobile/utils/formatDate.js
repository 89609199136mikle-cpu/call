/**
 * CraneApp Date Formatting
 * Telegram-style relative time + locales
 */

export const formatDate = {
  // Telegram-style chat list time (14:30 / Yesterday / Mar 10)
  chatTime(date) {
    const now = new Date();
    const d = new Date(date);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (d >= today) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    if (d >= yesterday) {
      return 'Yesterday';
    }
    
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  },

  // Message timestamp (14:20)
  messageTime(date) {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  },

  // Human readable (2h ago / yesterday / Mar 10)
  relative(date) {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes/60)}h ago`;
    if (minutes < 2880) return 'Yesterday';
    
    return new Date(date).toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric' 
    });
  }
};

window.formatDate = formatDate;
