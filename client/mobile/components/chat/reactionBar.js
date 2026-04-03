/**
 * Reaction Bar component
 * Quick emoji reactions picker shown on message long-press/right-click
 */

const DEFAULT_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🔥', '👎', '🎉'];

/**
 * Shows a floating reaction bar near a message
 * @param {Object} options
 * @param {string} options.messageId
 * @param {number} options.anchorX
 * @param {number} options.anchorY
 * @param {Function} options.onSelect
 * @param {string[]} [options.reactions]
 * @returns {{ el: HTMLElement, close: Function }}
 */
export function createReactionBar({ messageId, anchorX, anchorY, onSelect, reactions = DEFAULT_REACTIONS }) {
  const existing = document.getElementById('crane-reaction-bar');
  if (existing) existing.remove();

  const bar = document.createElement('div');
  bar.id = 'crane-reaction-bar';
  bar.style.cssText = `
    position:fixed;
    display:flex;align-items:center;gap:4px;
    background:var(--color-panel);
    border:1px solid var(--color-border);
    border-radius:var(--radius-full);
    padding:6px 10px;
    box-shadow:0 8px 32px rgba(0,0,0,0.4);
    z-index:950;
    animation:crane-reaction-in 0.2s cubic-bezier(0.34,1.56,0.64,1);
  `;

  ensureReactionStyles();

  reactions.forEach((emoji) => {
    const btn = document.createElement('button');
    btn.textContent = emoji;
    btn.style.cssText = `
      background:none;border:none;
      font-size:22px;cursor:pointer;
      padding:4px;border-radius:50%;
      transition:transform 0.15s ease,background 0.15s;
      display:flex;align-items:center;justify-content:center;
      width:38px;height:38px;
    `;
    btn.addEventListener('mouseenter', () => {
      btn.style.transform = 'scale(1.35)';
      btn.style.background = 'var(--color-hover)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'scale(1)';
      btn.style.background = 'none';
    });
    btn.addEventListener('click', () => {
      onSelect?.(messageId, emoji);
      close();
    });
    bar.appendChild(btn);
  });

  // Position
  const BAR_WIDTH = reactions.length * 46 + 20;
  const x = Math.max(8, Math.min(anchorX - BAR_WIDTH / 2, window.innerWidth - BAR_WIDTH - 8));
  const y = Math.max(8, anchorY - 60);
  bar.style.left = `${x}px`;
  bar.style.top = `${y}px`;

  document.body.appendChild(bar);

  function close() {
    bar.remove();
    document.removeEventListener('click', outsideClick);
  }

  function outsideClick(e) {
    if (!bar.contains(e.target)) close();
  }

  setTimeout(() => document.addEventListener('click', outsideClick), 0);

  return { el: bar, close };
}

function ensureReactionStyles() {
  if (document.getElementById('crane-reaction-styles')) return;
  const style = document.createElement('style');
  style.id = 'crane-reaction-styles';
  style.textContent = `
    @keyframes crane-reaction-in {
      from { opacity:0; transform:scale(0.7) translateY(8px); }
      to   { opacity:1; transform:scale(1) translateY(0); }
    }
  `;
  document.head.appendChild(style);
}
