/**
 * CraneApp Message Bubble Component
 * Telegram-style incoming/outgoing bubbles (radius 16px, tail, reactions)
 */

export class MessageBubble {
  static create({ 
    id, 
    senderId, 
    content, 
    mediaUrl, 
    mediaType, 
    replyTo, 
    reactions = {}, 
    time, 
    isOwn, 
    isRead, 
    onLongPress 
  } = {}) {
    const bubble = document.createElement('div');
    bubble.className = `message-bubble ${isOwn ? 'message-bubble--outgoing' : 'message-bubble--incoming'}`;
    bubble.dataset.messageId = id;
    
    const reactionList = Object.entries(reactions)
      .map(([emoji, users]) => `${emoji} ${users.length}`)
      .join(' ');
    
    bubble.innerHTML = `
      ${replyTo ? `
        <div class="message-reply">
          <div class="message-reply-content">${replyTo.content || 'Media'}</div>
          <div class="message-reply-from">${replyTo.senderName}</div>
        </div>
      ` : ''}
      <div class="message-content">
        ${content ? `<div class="message-text">${this.parseContent(content)}</div>` : ''}
        ${mediaUrl ? this.renderMedia(mediaUrl, mediaType) : ''}
      </div>
      <div class="message-footer">
        <span class="message-time">${time}</span>
        ${isOwn && isRead ? '<span class="message-read">✓✓</span>' : ''}
        ${reactionList ? `<span class="message-reactions">${reactionList}</span>` : ''}
      </div>
    `;
    
    // Long press menu (Telegram-style)
    let pressTimer;
    bubble.addEventListener('pointerdown', (e) => {
      pressTimer = setTimeout(() => {
        if (onLongPress) onLongPress({ id, content, senderId });
      }, 500);
    });
    
    bubble.addEventListener('pointerup', () => clearTimeout(pressTimer));
    bubble.addEventListener('pointerleave', () => clearTimeout(pressTimer));
    
    return bubble;
  }
  
  static parseContent(content) {
    // Links, mentions, hashtags
    return content
      .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>')
      .replace(/@([a-zA-Z0-9_]+)/g, '<a href="/profile/$1">@$1</a>')
      .replace(/#([a-zA-Zа-яё0-9_]+)/gi, '<span class="hashtag">#$1</span>');
  }
  
  static renderMedia(url, type) {
    const types = {
      'image': `<img src="${url}" class="message-media message-media--image" />`,
      'video': `<video src="${url}" class="message-media message-media--video" controls />`,
      'audio': `<audio src="${url}" class="message-media message-media--audio" controls />`,
      'file': `<a href="${url}" class="message-file">📎 File</a>`
    };
    return types[type] || `<a href="${url}" class="message-file">📎 ${type}</a>`;
  }
}

window.CraneMessageBubble = MessageBubble.create;
