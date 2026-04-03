/**
 * Message Bubble component
 * Renders individual chat messages with all states
 */

import { createAvatar } from '../ui/avatar.js';
import { formatMessageTime } from '../../utils/formatDate.js';

export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
  FILE: 'file',
  STICKER: 'sticker',
  GIF: 'gif',
  VOICE: 'voice',
  SYSTEM: 'system',
};

export const MESSAGE_STATUS = {
  SENDING: 'sending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
  FAILED: 'failed',
};

/**
 * Creates a message bubble element
 * @param {Object} message
 * @param {Object} options
 * @returns {HTMLElement}
 */
export function createMessageBubble(message, {
  isOwn = false,
  showAvatar = false,
  showSenderName = false,
  onReply = null,
  onReact = null,
  onDelete = null,
  onForward = null,
  onCopy = null,
  onMediaClick = null,
}) {
  if (message.type === MESSAGE_TYPES.SYSTEM) {
    return _createSystemMessage(message);
  }

  const wrapper = document.createElement('div');
  wrapper.dataset.messageId = message.id;
  wrapper.className = `message-wrapper ${isOwn ? 'message-own' : 'message-other'}`;
  wrapper.style.cssText = `
    display:flex;
    flex-direction:${isOwn ? 'row-reverse' : 'row'};
    align-items:flex-end;
    gap:8px;
    margin:2px 16px;
    max-width:100%;
    position:relative;
  `;

  if (showAvatar && !isOwn) {
    const avatar = createAvatar({
      src: message.senderAvatar,
      name: message.senderName,
      userId: message.senderId,
      size: 32,
    });
    wrapper.appendChild(avatar);
  } else if (!isOwn) {
    const spacer = document.createElement('div');
    spacer.style.cssText = `width:32px;flex-shrink:0;`;
    wrapper.appendChild(spacer);
  }

  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';
  bubble.style.cssText = `
    max-width:min(68%, 480px);
    min-width:80px;
    padding:${message.type === MESSAGE_TYPES.IMAGE || message.type === MESSAGE_TYPES.STICKER ? '4px' : '10px 14px'};
    border-radius:${isOwn
      ? 'var(--radius-lg) var(--radius-sm) var(--radius-lg) var(--radius-lg)'
      : 'var(--radius-sm) var(--radius-lg) var(--radius-lg) var(--radius-lg)'};
    background:${isOwn ? 'var(--color-bubble-out)' : 'var(--color-bubble-in)'};
    color:var(--color-text);
    position:relative;
    word-break:break-word;
    transition:background var(--transition);
    cursor:default;
  `;

  // Reply preview
  if (message.replyTo) {
    const replyEl = _createReplyPreview(message.replyTo, isOwn);
    bubble.appendChild(replyEl);
  }

  // Sender name (in group chats)
  if (showSenderName && !isOwn) {
    const nameEl = document.createElement('div');
    nameEl.textContent = message.senderName;
    nameEl.style.cssText = `
      font-size:var(--font-size-xs);
      font-weight:600;
      color:var(--color-primary);
      margin-bottom:4px;
    `;
    bubble.appendChild(nameEl);
  }

  // Message content
  const content = _createMessageContent(message, { isOwn, onMediaClick });
  bubble.appendChild(content);

  // Reactions
  if (message.reactions && Object.keys(message.reactions).length > 0) {
    const reactionsEl = _createReactions(message.reactions, { isOwn, onReact, messageId: message.id });
    bubble.appendChild(reactionsEl);
  }

  // Meta (time + status)
  const meta = _createMeta(message, isOwn);
  bubble.appendChild(meta);

  // Context menu on right click
  bubble.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    _showContextMenu(e, message, { isOwn, onReply, onReact, onDelete, onForward, onCopy, bubble });
  });

  // Long press on mobile
  let longPressTimer;
  bubble.addEventListener('touchstart', (e) => {
    longPressTimer = setTimeout(() => {
      _showContextMenu(e.touches[0], message, { isOwn, onReply, onReact, onDelete, onForward, onCopy, bubble });
    }, 500);
  });
  bubble.addEventListener('touchend', () => clearTimeout(longPressTimer));
  bubble.addEventListener('touchmove', () => clearTimeout(longPressTimer));

  wrapper.appendChild(bubble);
  return wrapper;
}

function _createMessageContent(message, { isOwn, onMediaClick }) {
  const content = document.createElement('div');
  content.className = 'message-content';

  switch (message.type) {
    case MESSAGE_TYPES.TEXT: {
      content.innerHTML = _parseText(message.text);
      content.style.cssText = `font-size:var(--font-size-md);line-height:1.5;`;
      break;
    }
    case MESSAGE_TYPES.IMAGE: {
      const img = document.createElement('img');
      img.src = message.url || message.thumbnail;
      img.alt = message.caption || 'Image';
      img.loading = 'lazy';
      img.style.cssText = `
        max-width:280px;max-height:320px;
        width:100%;border-radius:var(--radius-md);
        display:block;cursor:pointer;object-fit:cover;
      `;
      img.addEventListener('click', () => onMediaClick?.(message));
      content.appendChild(img);
      if (message.caption) {
        const cap = document.createElement('p');
        cap.textContent = message.caption;
        cap.style.cssText = `margin:6px 0 0;font-size:var(--font-size-sm);`;
        content.appendChild(cap);
      }
      break;
    }
    case MESSAGE_TYPES.VOICE: {
      content.appendChild(_createVoiceMessage(message));
      break;
    }
    case MESSAGE_TYPES.FILE: {
      content.appendChild(_createFileMessage(message));
      break;
    }
    case MESSAGE_TYPES.STICKER: {
      const img = document.createElement('img');
      img.src = message.url;
      img.alt = message.emoji || 'Sticker';
      img.style.cssText = `width:160px;height:160px;object-fit:contain;`;
      content.appendChild(img);
      break;
    }
    default: {
      content.textContent = message.text || '[Unsupported message]';
    }
  }

  return content;
}

function _parseText(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/(https?:\/\/[^\s<>"]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" style="color:var(--color-accent);text-decoration:none;">$1</a>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code style="background:rgba(0,0,0,0.3);padding:1px 4px;border-radius:3px;font-family:monospace;">$1</code>')
    .replace(/\n/g, '<br>');
}

function _createVoiceMessage(message) {
  const container = document.createElement('div');
  container.style.cssText = `
    display:flex;align-items:center;gap:10px;
    min-width:200px;padding:4px 0;
  `;

  const playBtn = document.createElement('button');
  let playing = false;
  let audio = null;

  playBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg>`;
  playBtn.style.cssText = `
    width:36px;height:36px;border-radius:50%;
    background:rgba(255,255,255,0.2);
    border:none;cursor:pointer;
    display:flex;align-items:center;justify-content:center;
    flex-shrink:0;transition:background var(--transition);
  `;

  const waveform = document.createElement('div');
  waveform.style.cssText = `flex:1;height:32px;display:flex;align-items:center;gap:2px;`;
  const bars = 24;
  for (let i = 0; i < bars; i++) {
    const bar = document.createElement('div');
    const h = Math.random() * 20 + 4;
    bar.style.cssText = `
      flex:1;height:${h}px;
      background:rgba(255,255,255,0.4);
      border-radius:2px;
      transition:background 0.1s;
    `;
    waveform.appendChild(bar);
  }

  const duration = document.createElement('span');
  duration.style.cssText = `font-size:var(--font-size-xs);color:rgba(255,255,255,0.7);min-width:36px;`;
  duration.textContent = message.duration || '0:00';

  playBtn.addEventListener('click', () => {
    if (!audio) {
      audio = new Audio(message.url);
      audio.addEventListener('ended', () => {
        playing = false;
        playBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg>`;
      });
    }
    if (playing) {
      audio.pause();
      playing = false;
      playBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg>`;
    } else {
      audio.play();
      playing = true;
      playBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
    }
  });

  container.appendChild(playBtn);
  container.appendChild(waveform);
  container.appendChild(duration);
  return container;
}

function _createFileMessage(message) {
  const container = document.createElement('a');
  container.href = message.url;
  container.download = message.filename;
  container.target = '_blank';
  container.rel = 'noopener noreferrer';
  container.style.cssText = `
    display:flex;align-items:center;gap:10px;
    text-decoration:none;
    min-width:200px;
    padding:4px 0;
  `;

  const icon = document.createElement('div');
  icon.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="rgba(255,255,255,0.7)"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>`;
  icon.style.cssText = `flex-shrink:0;`;

  const info = document.createElement('div');
  info.style.cssText = `display:flex;flex-direction:column;gap:2px;overflow:hidden;`;

  const name = document.createElement('span');
  name.textContent = message.filename;
  name.style.cssText = `font-size:var(--font-size-sm);color:var(--color-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;`;

  const size = document.createElement('span');
  size.textContent = message.fileSize || '';
  size.style.cssText = `font-size:var(--font-size-xs);color:rgba(255,255,255,0.6);`;

  info.appendChild(name);
  info.appendChild(size);
  container.appendChild(icon);
  container.appendChild(info);
  return container;
}

function _createReplyPreview(replyTo, isOwn) {
  const preview = document.createElement('div');
  preview.style.cssText = `
    border-left:2px solid ${isOwn ? 'rgba(255,255,255,0.5)' : 'var(--color-primary)'};
    padding:4px 8px;
    margin-bottom:6px;
    border-radius:0 var(--radius-sm) var(--radius-sm) 0;
    background:rgba(0,0,0,0.15);
    cursor:pointer;
  `;

  const name = document.createElement('div');
  name.textContent = replyTo.senderName;
  name.style.cssText = `font-size:var(--font-size-xs);font-weight:600;color:var(--color-primary);`;

  const text = document.createElement('div');
  text.textContent = replyTo.text?.slice(0, 80) || 'Media';
  text.style.cssText = `font-size:var(--font-size-xs);color:rgba(255,255,255,0.7);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;`;

  preview.appendChild(name);
  preview.appendChild(text);
  return preview;
}

function _createReactions(reactions, { isOwn, onReact, messageId }) {
  const container = document.createElement('div');
  container.style.cssText = `
    display:flex;flex-wrap:wrap;gap:4px;margin-top:6px;
  `;

  for (const [emoji, users] of Object.entries(reactions)) {
    const pill = document.createElement('button');
    pill.style.cssText = `
      display:flex;align-items:center;gap:4px;
      padding:3px 8px;
      border-radius:var(--radius-full);
      background:rgba(255,255,255,0.12);
      border:1px solid rgba(255,255,255,0.2);
      color:var(--color-text);
      font-size:var(--font-size-sm);
      cursor:pointer;
      transition:background var(--transition);
    `;
    pill.innerHTML = `<span>${emoji}</span><span style="font-size:11px;opacity:0.8">${users.length}</span>`;
    pill.addEventListener('click', () => onReact?.(messageId, emoji));
    container.appendChild(pill);
  }

  return container;
}

function _createMeta(message, isOwn) {
  const meta = document.createElement('div');
  meta.style.cssText = `
    display:flex;align-items:center;justify-content:flex-end;gap:4px;
    margin-top:4px;
    font-size:10px;
    color:rgba(255,255,255,0.6);
  `;

  if (message.edited) {
    const edited = document.createElement('span');
    edited.textContent = 'edited';
    meta.appendChild(edited);
  }

  const time = document.createElement('span');
  time.textContent = formatMessageTime(message.createdAt);
  meta.appendChild(time);

  if (isOwn) {
    const statusEl = document.createElement('span');
    const statusIcons = {
      [MESSAGE_STATUS.SENDING]: '🕐',
      [MESSAGE_STATUS.SENT]: '✓',
      [MESSAGE_STATUS.DELIVERED]: '✓✓',
      [MESSAGE_STATUS.READ]: '✓✓',
      [MESSAGE_STATUS.FAILED]: '!',
    };
    statusEl.textContent = statusIcons[message.status] || '✓';
    if (message.status === MESSAGE_STATUS.READ) statusEl.style.color = 'var(--color-accent)';
    meta.appendChild(statusEl);
  }

  return meta;
}

function _createSystemMessage(message) {
  const el = document.createElement('div');
  el.style.cssText = `
    text-align:center;
    margin:8px 32px;
    padding:6px 14px;
    background:rgba(122,92,255,0.12);
    border-radius:var(--radius-full);
    font-size:var(--font-size-xs);
    color:var(--color-text-secondary);
    display:inline-flex;
    align-self:center;
  `;
  el.textContent = message.text;

  const wrapper = document.createElement('div');
  wrapper.style.cssText = `display:flex;justify-content:center;margin:4px 0;`;
  wrapper.appendChild(el);
  return wrapper;
}

function _showContextMenu(event, message, { isOwn, onReply, onReact, onDelete, onForward, onCopy, bubble }) {
  const existing = document.getElementById('crane-context-menu');
  if (existing) existing.remove();

  const menu = document.createElement('div');
  menu.id = 'crane-context-menu';
  menu.style.cssText = `
    position:fixed;
    background:var(--color-panel);
    border:1px solid var(--color-border);
    border-radius:var(--radius-md);
    padding:6px;
    z-index:900;
    box-shadow:0 8px 32px rgba(0,0,0,0.4);
    min-width:160px;
    animation:crane-modal-in 0.15s ease;
  `;

  const items = [
    { icon: '↩️', label: 'Reply', action: () => onReply?.(message) },
    { icon: '😀', label: 'React', action: () => onReact?.(message.id, null) },
    { icon: '📋', label: 'Copy', action: () => { navigator.clipboard.writeText(message.text || ''); onCopy?.(message); } },
    { icon: '➡️', label: 'Forward', action: () => onForward?.(message) },
    isOwn && { icon: '🗑️', label: 'Delete', action: () => onDelete?.(message), danger: true },
  ].filter(Boolean);

  items.forEach((item) => {
    const btn = document.createElement('button');
    btn.style.cssText = `
      display:flex;align-items:center;gap:10px;
      width:100%;padding:9px 12px;
      background:transparent;border:none;
      color:${item.danger ? 'var(--color-danger)' : 'var(--color-text)'};
      font-size:var(--font-size-md);
      cursor:pointer;border-radius:var(--radius-sm);
      text-align:left;transition:background var(--transition);
    `;
    btn.innerHTML = `<span>${item.icon}</span><span>${item.label}</span>`;
    btn.addEventListener('mouseenter', () => { btn.style.background = 'var(--color-hover)'; });
    btn.addEventListener('mouseleave', () => { btn.style.background = 'transparent'; });
    btn.addEventListener('click', () => { item.action(); menu.remove(); });
    menu.appendChild(btn);
  });

  const x = Math.min(event.clientX, window.innerWidth - 180);
  const y = Math.min(event.clientY, window.innerHeight - items.length * 44 - 20);
  menu.style.left = `${x}px`;
  menu.style.top = `${y}px`;

  document.body.appendChild(menu);

  const removeMenu = (e) => {
    if (!menu.contains(e.target)) {
      menu.remove();
      document.removeEventListener('click', removeMenu);
    }
  };
  setTimeout(() => document.addEventListener('click', removeMenu), 0);
}
