/**
 * Avatar UI component
 * Renders user/group/channel avatars with fallback initials
 */

const AVATAR_COLORS = [
  '#7a5cff', '#ff5ad6', '#00e676', '#ff9800',
  '#2196f3', '#e91e63', '#009688', '#ff5722',
];

/**
 * Gets a deterministic color for a user based on their ID or name
 */
function getAvatarColor(seed) {
  let hash = 0;
  const str = String(seed || 'default');
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

/**
 * Gets initials from a name
 */
function getInitials(name) {
  if (!name) return '?';
  const parts = String(name).trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Creates an avatar element
 * @param {Object} options
 * @param {string} [options.src] - Image URL
 * @param {string} [options.name] - Display name for initials fallback
 * @param {string} [options.userId] - Used for color generation
 * @param {number} [options.size=40] - Diameter in px
 * @param {boolean} [options.online] - Show online indicator
 * @param {boolean} [options.verified] - Show verified badge
 * @param {string} [options.shape=circle] - circle | rounded
 * @param {Function} [options.onClick]
 * @returns {HTMLElement}
 */
export function createAvatar({
  src = null,
  name = '',
  userId = null,
  size = 40,
  online = false,
  verified = false,
  shape = 'circle',
  onClick = null,
  className = '',
}) {
  const container = document.createElement('div');
  container.className = `crane-avatar ${className}`.trim();
  container.style.cssText = `
    position:relative;
    display:inline-flex;
    flex-shrink:0;
    width:${size}px;height:${size}px;
    ${onClick ? 'cursor:pointer;' : ''}
  `;

  const avatarEl = document.createElement('div');
  const borderRadius = shape === 'circle' ? '50%' : 'var(--radius-md)';
  const fontSize = Math.floor(size * 0.38) + 'px';
  const color = getAvatarColor(userId || name);

  avatarEl.style.cssText = `
    width:${size}px;height:${size}px;
    border-radius:${borderRadius};
    overflow:hidden;
    display:flex;align-items:center;justify-content:center;
    background:${color};
    color:#fff;
    font-size:${fontSize};
    font-weight:600;
    letter-spacing:0.5px;
    user-select:none;
    flex-shrink:0;
  `;

  if (src) {
    const img = document.createElement('img');
    img.src = src;
    img.alt = name || '';
    img.style.cssText = `width:100%;height:100%;object-fit:cover;`;
    img.onerror = () => {
      img.remove();
      avatarEl.textContent = getInitials(name);
    };
    avatarEl.appendChild(img);
  } else {
    avatarEl.textContent = getInitials(name);
  }

  container.appendChild(avatarEl);

  if (online) {
    const dot = document.createElement('div');
    const dotSize = Math.max(8, Math.floor(size * 0.25));
    dot.style.cssText = `
      position:absolute;
      bottom:0;right:0;
      width:${dotSize}px;height:${dotSize}px;
      background:var(--color-success);
      border-radius:50%;
      border:2px solid var(--color-bg);
    `;
    container.appendChild(dot);
  }

  if (verified) {
    const badge = document.createElement('div');
    const badgeSize = Math.max(12, Math.floor(size * 0.3));
    badge.innerHTML = `<svg width="${badgeSize}" height="${badgeSize}" viewBox="0 0 24 24"><path fill="var(--color-primary)" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>`;
    badge.style.cssText = `
      position:absolute;
      bottom:-2px;right:-2px;
      background:var(--color-panel);
      border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      width:${badgeSize + 4}px;height:${badgeSize + 4}px;
    `;
    container.appendChild(badge);
  }

  if (onClick) {
    container.addEventListener('click', onClick);
  }

  container.updateSrc = (newSrc) => {
    let img = avatarEl.querySelector('img');
    if (newSrc) {
      if (!img) {
        img = document.createElement('img');
        img.style.cssText = `width:100%;height:100%;object-fit:cover;`;
        img.onerror = () => { img.remove(); avatarEl.textContent = getInitials(name); };
        avatarEl.textContent = '';
        avatarEl.appendChild(img);
      }
      img.src = newSrc;
    } else {
      img?.remove();
      avatarEl.textContent = getInitials(name);
    }
  };

  container.setOnline = (isOnline) => {
    const dot = container.querySelector('.online-dot');
    if (dot) dot.style.display = isOnline ? 'block' : 'none';
  };

  return container;
}

/**
 * Creates a group of overlapping avatars (for group previews)
 */
export function createAvatarGroup({ users = [], size = 32, max = 3 }) {
  const group = document.createElement('div');
  group.style.cssText = `display:flex;align-items:center;`;

  const visible = users.slice(0, max);

  visible.forEach((user, i) => {
    const avatar = createAvatar({ src: user.avatar, name: user.name, userId: user.id, size });
    avatar.style.marginLeft = i === 0 ? '0' : `-${Math.floor(size * 0.3)}px`;
    avatar.style.zIndex = String(visible.length - i);
    avatar.style.border = '2px solid var(--color-bg)';
    avatar.style.borderRadius = '50%';
    group.appendChild(avatar);
  });

  if (users.length > max) {
    const extra = document.createElement('div');
    extra.style.cssText = `
      width:${size}px;height:${size}px;
      border-radius:50%;
      background:var(--color-border);
      color:var(--color-text);
      font-size:${Math.floor(size * 0.3)}px;
      font-weight:600;
      display:flex;align-items:center;justify-content:center;
      margin-left:-${Math.floor(size * 0.3)}px;
      border:2px solid var(--color-bg);
    `;
    extra.textContent = `+${users.length - max}`;
    group.appendChild(extra);
  }

  return group;
}
