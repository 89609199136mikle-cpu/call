/**
 * CraneApp Drawer Menu Component
 * Telegram-style sidebar menu (profile + settings)
 */

export class DrawerMenu {
  static create({ user, onNavigate }) {
    const drawer = document.createElement('div');
    drawer.className = 'drawer-menu';
    
    drawer.innerHTML = `
      <div class="drawer-header">
        <div class="drawer-avatar">
          <div class="avatar avatar--64px">
            <div class="avatar-initials">${user?.firstName?.[0] || 'C'}</div>
          </div>
        </div>
        <div class="drawer-user">
          <div class="drawer-username">${user?.username || '@craneapp'}</div>
          <div class="drawer-status">Online</div>
        </div>
      </div>
      <div class="drawer-menu-items">
        <button class="menu-item" data-route="/profile">
          <span class="menu-icon">👤</span>
          <span>Profile</span>
        </button>
        <button class="menu-item" data-route="/settings">
          <span class="menu-icon">⚙️</span>
          <span>Settings</span>
        </button>
        <button class="menu-item" data-route="/saved">
          <span class="menu-icon">💾</span>
          <span>Saved Messages</span>
        </button>
        <hr>
        <button class="menu-item" data-route="/privacy">
          <span class="menu-icon">🔒</span>
          <span>Privacy & Security</span>
        </button>
        <button class="menu-item logout" data-action="logout">
          <span class="menu-icon">🚪</span>
          <span>Log Out</span>
        </button>
      </div>
    `;
    
    drawer.querySelectorAll('.menu-item').forEach(item => {
      item.addEventListener('click', () => {
        const route = item.dataset.route;
        if (route) {
          onNavigate(route);
        } else if (item.dataset.action === 'logout') {
          window.AuthProvider?.logout();
        }
        drawer.classList.remove('open');
      });
    });
    
    return drawer;
  }
  
  static toggle() {
    document.querySelector('.drawer-menu')?.classList.toggle('open');
  }
}

window.CraneDrawerMenu = DrawerMenu;
