/**
 * CraneApp Header Component
 * Telegram-style header (back/title/actions)
 */

export class Header {
  static create({ 
    title = 'CraneApp', 
    showBack = false, 
    rightActions = [],
    onBack 
  } = {}) {
    const header = document.createElement('header');
    header.className = 'app-header';
    
    header.innerHTML = `
      <div class="header-left">
        ${showBack ? '<button class="header-back">←</button>' : ''}
      </div>
      <div class="header-title">${title}</div>
      <div class="header-right">
        ${rightActions.map(action => 
          `<button class="header-action" data-action="${action.key}">${action.icon}</button>`
        ).join('')}
      </div>
    `;
    
    // Back button
    const backBtn = header.querySelector('.header-back');
    if (backBtn) {
      backBtn.addEventListener('click', onBack);
    }
    
    // Right actions
    header.querySelectorAll('.header-action').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = rightActions.find(a => a.key === btn.dataset.action);
        action.onClick?.();
      });
    });
    
    return header;
  }
}

window.CraneHeader = Header.create;
