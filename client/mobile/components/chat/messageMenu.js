/**
 * CraneApp Message Context Menu
 * Telegram-style long-press menu (reply/forward/edit/delete)
 */

export class MessageMenu {
  static show({ id, content, senderId }, position) {
    // Remove existing menu
    document.querySelectorAll('.message-menu').forEach(menu => menu.remove());
    
    const menu = document.createElement('div');
    menu.className = 'message-menu';
    menu.style.left = position.x + 'px';
    menu.style.top = position.y + 'px';
    
    const isOwn = senderId === window.AuthProvider?.getUser()?.id;
    menu.innerHTML = `
      <button class="menu-item" data-action="reply">Reply</button>
      <button class="menu-item" data-action="forward">Forward</button>
      ${isOwn ? '<button class="menu-item" data-action="edit">Edit</button>' : ''}
      ${isOwn ? '<button class="menu-item danger" data-action="delete">Delete</button>' : ''}
    `;
    
    document.body.appendChild(menu);
    
    // Auto-hide
    const hideMenu = () => {
      menu.remove();
      document.removeEventListener('click', hideMenu);
    };
    
    document.addEventListener('click', hideMenu);
    
    // Actions
    menu.querySelectorAll('.menu-item').forEach(item => {
      item.addEventListener('click', () => {
        const action = item.dataset.action;
        window.dispatchEvent(new CustomEvent('message:action', {
          detail: { id, action }
        }));
        hideMenu();
      });
    });
    
    return menu;
  }
}

window.CraneMessageMenu = MessageMenu;
