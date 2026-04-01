/**
 * CraneApp Reaction Bar Component
 * Telegram-style emoji reactions (+/-)
 */

export class ReactionBar {
  static create({ reactions, onReact }) {
    const bar = document.createElement('div');
    bar.className = 'reaction-bar';
    
    const emojis = ['👍', '❤️', '😂', '😮', '😢', '😡'];
    bar.innerHTML = emojis.map(emoji => {
      const count = reactions[emoji]?.length || 0;
      const hasReacted = reactions[emoji]?.includes(window.AuthProvider?.getUser()?.id);
      return `
        <button class="reaction-btn ${hasReacted ? 'reacted' : ''}" data-emoji="${emoji}">
          ${emoji} ${count > 0 ? count : ''}
        </button>
      `;
    }).join('');
    
    bar.querySelectorAll('.reaction-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const emoji = btn.dataset.emoji;
        onReact(emoji);
      });
    });
    
    return bar;
  }
}

window.CraneReactionBar = ReactionBar.create;
