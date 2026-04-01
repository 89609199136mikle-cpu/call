/**
 * CraneApp UI Modal Component
 * Telegram-style bottom-sheet + full-screen overlay
 */

export class Modal {
  static create({ 
    title = '',
    content = '',
    primaryBtn = { label: 'OK', onClick: () => {} },
    secondaryBtn = null,
    fullscreen = false 
  } = {}) {
    const modal = document.createElement('div');
    modal.className = `modal ${fullscreen ? 'modal--fullscreen' : ''}`;
    
    modal.innerHTML = `
      <div class="modal-overlay" data-dismiss></div>
      <div class="modal-content">
        <div class="modal-handle"></div>
        ${title ? `<h3 class="modal-title">${title}</h3>` : ''}
        <div class="modal-body">${content}</div>
        <div class="modal-actions">
          ${secondaryBtn ? `
            <button class="btn btn--secondary">${secondaryBtn.label}</button>
          ` : ''}
          <button class="btn btn--primary">${primaryBtn.label}</button>
        </div>
      </div>
    `;
    
    const overlay = modal.querySelector('.modal-overlay');
    const primary = modal.querySelector('.btn--primary');
    const secondary = modal.querySelector('.btn--secondary');
    
    // Close handlers
    overlay.addEventListener('click', () => modal.remove());
    primary.addEventListener('click', (e) => {
      primaryBtn.onClick(e);
      modal.remove();
    });
    
    if (secondary) {
      secondary.addEventListener('click', (e) => {
        secondaryBtn.onClick?.(e);
        modal.remove();
      });
    }
    
    // ESC key
    modal.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') modal.remove();
    });
    
    // Append to body + show
    document.body.appendChild(modal);
    requestAnimationFrame(() => modal.classList.add('modal--visible'));
    
    return modal;
  }
  
  // Global modal manager
  static show(config) {
    return this.create(config);
  }
  
  static hideAll() {
    document.querySelectorAll('.modal').forEach(modal => modal.remove());
  }
}

window.CraneModal = Modal;
