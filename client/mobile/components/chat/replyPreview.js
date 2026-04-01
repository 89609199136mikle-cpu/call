/**
 * CraneApp Reply Preview Component
 * Telegram-style quoted message preview
 */

export class ReplyPreview {
  static create({ message, onRemove }) {
    const preview = document.createElement('div');
    preview.className = 'reply-preview';
    
    preview.innerHTML = `
      <div class="reply-preview-avatar">
        <div class="avatar avatar--24px">
          <div class="avatar-initials">${message.senderName[0]}</div>
        </div>
      </div>
      <div class="reply-preview-content">
        <div class="reply-preview-sender">${message.senderName}</div>
        <div class="reply-preview-text">${message.content?.slice(0, 50) || '[Media]'}</div>
      </div>
      <button class="reply-preview-remove">✕</button>
    `;
    
    preview.querySelector('.reply-preview-remove').addEventListener('click', () => {
      onRemove();
      preview.remove();
    });
    
    return preview;
  }
}

window.CraneReplyPreview = ReplyPreview.create;
