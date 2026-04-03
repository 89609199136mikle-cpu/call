/**
 * Message context menu component
 */

export function createMessageMenu({ message, isOwn, onReply, onReact, onDelete, onForward, onCopy, onPin, anchorX, anchorY }) {
  const existing = document.getElementById('crane-msg-menu');
  if (existing) existing.remove();

  const menu = document.createElement('div');
  menu.id = 'crane-msg-menu';
  menu.role = 'menu';
  menu.style.cssText = `
    position:fixed;
    background:var(--color-panel);
    border:1px solid var(--color-border);
    border-radius:var(--radius-md);
    padding:6px 0;
    z-index:900;
    box-shadow:0 8px 40px rgba(0,0,0,0.5);
    min-width:180px;
    animation:crane-modal-in 0.15s ease;
    overflow:hidden;
  `;

  const items = [
    {
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z"/></svg>`,
      label: 'Reply',
      action: () => onReply?.(message),
    },
    {
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm4.24 16L12 15.45 7.77 18l1.12-4.81-3.73-3.23 4.92-.42L12 5l1.92 4.53 4.92.42-3.73 3.23L16.23 18z"/></svg>`,
      label: 'React',
      action: () => onReact?.(message.id),
    },
    {
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>`,
      label: 'Copy',
      action: () => { navigator.clipboard?.writeText(message.text || ''); onCopy?.(message); },
    },
    {
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M14 9V5l7 7-7 7v-4.1c-5 0-8.5 1.6-11 5.1 1-5 4-10 11-11z"/></svg>`,
      label: 'Forward',
      action: () => onForward?.(message),
    },
    {
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/></svg>`,
      label: 'Pin',
      action: () => onPin?.(message),
    },
    isOwn && {
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>`,
      label: 'Delete',
      action: () => onDelete?.(message),
      danger: true,
    },
  ].filter(Boolean);

  items.forEach((item) => {
    const btn = document.createElement('button');
    btn.role = 'menuitem';
    btn.style.cssText = `
      display:flex;align-items:center;gap:12px;
      width:100%;padding:10px 16px;
      background:transparent;border:none;
      color:${item.danger ? 'var(--color-danger)' : 'var(--color-text)'};
      font-size:var(--font-size-md);cursor:pointer;
      text-align:left;transition:background var(--transition);
    `;
    btn.innerHTML = `<span style="opacity:0.7;display:flex;align-items:center;">${item.icon}</span><span>${item.label}</span>`;
    btn.addEventListener('mouseenter', () => { btn.style.background = 'var(--color-hover)'; });
    btn.addEventListener('mouseleave', () => { btn.style.background = 'transparent'; });
    btn.addEventListener('click', () => { item.action(); close(); });
    menu.appendChild(btn);
  });

  const x = Math.min(anchorX, window.innerWidth - 200);
  const y = Math.min(anchorY, window.innerHeight - items.length * 44);
  menu.style.left = `${x}px`;
  menu.style.top = `${y}px`;

  document.body.appendChild(menu);

  function close() {
    menu.remove();
    document.removeEventListener('click', outsideClick);
  }

  function outsideClick(e) {
    if (!menu.contains(e.target)) close();
  }

  setTimeout(() => document.addEventListener('click', outsideClick), 0);
  return { close };
}
