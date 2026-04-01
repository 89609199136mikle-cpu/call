/**
 * CraneApp UI Avatar Component
 * Telegram-style (48px, gradient, online status, verified badge)
 */

export class Avatar {
  static create({ 
    src = '',
    size = 48,
    name = 'User',
    online = false,
    verified = false,
    type = 'user' // user, bot, group, channel
  } = {}) {
    const avatar = document.createElement('div');
    avatar.className = `avatar avatar--${size}px`;
    
    // Initials fallback
    const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    
    avatar.innerHTML = `
      ${src ? `<img src="${src}" alt="${name}" class="avatar-img" />` : ''}
      <div class="avatar-initials">${initials}</div>
      ${online ? '<div class="avatar-online"></div>' : ''}
      ${verified ? '<div class="avatar-verified">✅</div>' : ''}
    `;
    
    // Type-specific styling
    if (type === 'bot') avatar.classList.add('avatar--bot');
    if (type === 'group') avatar.classList.add('avatar--group');
    if (type === 'channel') avatar.classList.add('avatar--channel');
    
    // Error handling
    const img = avatar.querySelector('.avatar-img');
    img?.addEventListener('error', () => {
      img.style.display = 'none';
      avatar.querySelector('.avatar-initials').style.display = 'flex';
    });
    
    // Click to copy username (Telegram-style)
    avatar.addEventListener('click', () => {
      if (navigator.clipboard && name) {
        navigator.clipboard.writeText(name);
        // Show tooltip (handled by CSS)
        avatar.classList.add('avatar--copied');
        setTimeout(() => avatar.classList.remove('avatar--copied'), 1000);
      }
    });
    
    return avatar;
  }
}

window.CraneAvatar = Avatar.create;
