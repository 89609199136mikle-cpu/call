/**
 * CraneApp Navigation System
 * Telegram-style TabBar + Stack Navigator (Mobile/Desktop)
 * Vanilla JS Router (Hash + History API)
 */

export class Navigation {
  constructor() {
    this.currentRoute = window.location.hash.slice(1) || '/chats';
    this.isMobile = window.innerWidth < 768;
    this.routes = {
      '/auth/login': 'screens/auth/login.html',
      '/auth/register': 'screens/auth/register.html',
      '/auth/phone': 'screens/auth/phoneVerification.html',
      '/chats': 'screens/chats/chats.html',
      '/chat/:id': 'screens/chats/chat.html',
      '/contacts': 'screens/contacts/contacts.html',
      '/calls': 'screens/calls/calls.html',
      '/profile': 'screens/profile/profile.html',
      '/settings': 'screens/settings/settings.html',
      '*': '/chats'
    };
    this.init();
  }

  init() {
    // Hash routing + History API fallback
    window.addEventListener('hashchange', () => this.navigate());
    window.addEventListener('popstate', () => this.navigate());
    
    // Init current route
    this.navigate();
  }

  async navigate(path = null) {
    if (path) {
      window.location.hash = path;
      return;
    }

    this.currentRoute = window.location.hash.slice(1) || '/chats';
    const route = this.matchRoute(this.currentRoute);
    await this.loadScreen(route);
    this.updateTabBar();
    this.updateHeader();
  }

  matchRoute(path) {
    for (const [route, screen] of Object.entries(this.routes)) {
      const regex = new RegExp(`^${route.replace(/:[^\/]+/g, '([^\/]+)')}$`);
      if (regex.test(path)) return { screen, params: this.extractParams(route, path) };
    }
    return { screen: this.routes['*'], params: {} };
  }

  extractParams(route, path) {
    const params = {};
    const paramNames = route.match(/:[^\/]+/g)?.map(p => p.slice(1)) || [];
    const values = path.match(/[^\/]+/g) || [];
    paramNames.forEach((name, i) => params[name] = values[i]);
    return params;
  }

  async loadScreen({ screen, params }) {
    try {
      // Load screen HTML + init
      const response = await fetch(screen);
      const html = await response.text();
      document.getElementById('app-content').innerHTML = html;
      
      // Init screen with params
      const screenModule = await import(screen.replace('.html', '.js'));
      if (screenModule.initScreen) {
        screenModule.initScreen(params);
      }
    } catch (error) {
      console.error('Navigation error:', error);
      this.navigate('/chats');
    }
  }

  updateTabBar() {
    const tabItems = document.querySelectorAll('.tab-bar-item');
    tabItems.forEach(item => {
      const href = item.dataset.href;
      item.classList.toggle('active', this.currentRoute === href || href.startsWith(this.currentRoute));
    });
  }

  updateHeader() {
    const headerTitle = document.querySelector('.header-title');
    const backBtn = document.querySelector('.header-back');
    
    if (this.currentRoute === '/chats' || this.currentRoute.startsWith('/auth')) {
      headerTitle.textContent = 'CraneApp';
      backBtn.style.display = 'none';
    } else {
      headerTitle.textContent = this.getTitle(this.currentRoute);
      backBtn.style.display = 'flex';
      backBtn.onclick = () => this.navigate('/chats');
    }
  }

  getTitle(path) {
    const titles = {
      '/contacts': 'Contacts',
      '/calls': 'Calls', 
      '/profile': 'Profile',
      '/settings': 'Settings'
    };
    return titles[path] || 'Chat';
  }

  render(parent) {
    parent.innerHTML = `
      <div id="app-content"></div>
      <nav class="tab-bar">
        <button class="tab-bar-item active" data-href="/chats">
          <span class="icon">💬</span>
          <span>Chats</span>
        </button>
        <button class="tab-bar-item" data-href="/contacts">
          <span class="icon">👥</span>
          <span>Contacts</span>
        </button>
        <button class="tab-bar-item" data-href="/calls">
          <span class="icon">📞</span>
          <span>Calls</span>
        </button>
        <button class="tab-bar-item" data-href="/settings">
          <span class="icon">⚙️</span>
          <span>Settings</span>
        </button>
      </nav>
    `;

    // Tab bar click handlers
    document.querySelectorAll('.tab-bar-item').forEach(item => {
      item.addEventListener('click', () => {
        const href = item.dataset.href;
        this.navigate(href);
        item.classList.add('active');
      });
    });
  }
}
