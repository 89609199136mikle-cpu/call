/**
 * CraneApp Message Input Component
 * Telegram-style composer (attach/emoji/voice/send + typing)
 */

export class MessageInput {
  static create({ chatId, onSend, onAttach, onEmoji, onVoice }) {
    const input = document.createElement('div');
    input.className = 'message-input-container';
    
    input.innerHTML = `
      <div class="message-input-left">
        <button class="message-input-btn" data-action="attach">📎</button>
        <button class="message-input-btn" data-action="emoji">😊</button>
      </div>
      <div class="message-input-main">
        <div class="message-input-field" contenteditable="true" placeholder="Type a message..."></div>
      </div>
      <div class="message-input-right">
        <button class="message-input-btn" data-action="voice">🎤</button>
        <button class="message-input-send" data-action="send">➤</button>
      </div>
    `;
    
    const field = input.querySelector('.message-input-field');
    const sendBtn = input.querySelector('.message-input-send');
    
    // Auto-resize
    field.addEventListener('input', () => {
      field.style.height = 'auto';
      field.style.height = Math.min(field.scrollHeight, 120) + 'px';
      sendBtn.style.display = field.textContent.trim() ? 'flex' : 'none';
    });
    
    // Typing indicator
    let typingTimer;
    field.addEventListener('input', () => {
      window.SocketProvider?.startTyping(chatId);
      clearTimeout(typingTimer);
      typingTimer = setTimeout(() => {
        window.SocketProvider?.stopTyping(chatId);
      }, 2000);
    });
    
    // Button handlers
    input.querySelectorAll('.message-input-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        if (action === 'attach') onAttach?.();
        if (action === 'emoji') onEmoji?.();
        if (action === 'voice') onVoice?.();
        if (action === 'send') {
          const content = field.textContent.trim();
          if (content) {
            onSend(content);
            field.textContent = '';
            field.style.height = 'auto';
            sendBtn.style.display = 'none';
          }
        }
      });
    });
    
    // Enter to send
    field.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendBtn.click();
      }
    });
    
    return input;
  }
}

window.CraneMessageInput = MessageInput.create;
