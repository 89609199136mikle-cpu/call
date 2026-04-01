/**
 * CraneApp Tab Bar Component
 * Telegram-style bottom navigation (56px, icons + badges + active state)
 * Railway-ready, mobile-first (390px)
 */

export class TabBar {
  static create({ 
    activeTab = 'chats', 
    unreadCounts = {}, 
    onTabChange 
  } = {}) {
    const tabBar = document.createElement('nav');
    tabBar.className = 'tab-bar';
    
    // Telegram tabs structure (4 tabs)
    const tabs = [
      { id: 'chats', icon: '💬', label: 'Chats', count: unreadCounts.chats || 0 },
      { id: 'contacts', icon: '👥', label: 'Contacts', count: unreadCounts.contacts || 0 },
      { id: 'calls', icon: '📞', label: 'Calls', count: unreadCounts.calls || 0 },
      { id: 'settings', icon: '⚙️', label: 'Settings', count: 0 }
    ];
    
    tabBar.innerHTML = tabs.map(tab => `
      <button 
        class="tab-bar-item ${activeTab === tab.id ? 'active' : ''}" 
        data-tab="${tab.id}"
      >
        <span class="tab-icon">${tab.icon}</span>
        <span class="tab-label">${tab.label}</span>
        ${tab.count > 0 ? `<span class="tab-badge">${tab.count > 99 ? '99+' : tab.count}</span>` : ''}
      </button>
    `).join('');
    
    // Tab click handlers (Telegram smooth transition)
    tabBar.querySelectorAll('.tab-bar-item').forEach(item => {
      item.addEventListener('## client/mobile/components/navigation/tabBar.js
```javascript
/**
 * CraneApp Tab Bar Component
 * Telegram-style bottom navigation (56px height, icons + labels + badges)
 * Vanilla JS, touch-friendly, Railway production-ready
 */

export class TabBar {
  constructor({ 
    activeTab = 'chats', 
    badgeCounts = {}, 
    onTabChange 
  } = {}) {
    this.activeTab = activeTab;
    this.badgeCounts = badgeCounts;
    this.onTabChange = onTabChange;
    this.render();
    this.bindEvents();
  }

  render() {
    const tabs = [
      { id: 'chats', icon: '💬', label: 'Chats', badgeKey: 'chats' },
      { id: 'contacts', icon: '👥', label: 'Contacts', badgeKey: 'contacts' },
      { id: 'calls', icon: '📞', label: 'Calls', badgeKey: 'calls' },
      { id: 'settings', icon: '⚙️', label: 'Settings', badgeKey: null }
    ];

    this.element = document.createElement('nav');
    this.element.className = 'tab-bar';
    
    this.element.innerHTML = tabs.map(tab => {
      const badge = this.badgeCounts[tab.badgeKey] || 0;
      const isActive = this.activeTab === tab.id;
      return `
        <button class="tab-bar-item ${isActive ? 'active' : ''}" data-tab="${tab.id}">
          <span class="tab-icon">${tab.icon}</span>
          <span class="tab-label">${tab.label}</span>
          ${badge > 0 ? `<span class="tab-badge">${badge > 99 ? '99+' : badge}</span>` : ''}
        </button>
      `;
    }).join('');
  }

  bindEvents() {
    this.element.querySelectorAll('.tab-bar-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Deactivate current tab
        this.element.querySelector('.active')?.classList.remove('active');
        
        // Activate clicked tab
        const tabId = item.dataset.tab;
        item.classList.add('active');
        this.activeTab = tabId;
        
        // Callback
        this.onTabChange?.(tabId);
        
        // Navigation
        window.location.hash = `/${tabId}`;
      });

      // Haptic feedback (mobile)
      item.addEventListener('touchstart', (e) => {
        if (navigator.vibrate) navigator.vibrate(20);
      });
    });
  }

  // Update badge counts
  updateBadges(counts) {
    this.badgeCounts = counts;
    this.element.querySelectorAll('.tab-badge').forEach(badge => {
      const tabId = badge.closest('.tab-bar-item').dataset.tab;
      const count = this.badgeCounts[tabId] || 0;
      badge.textContent = count > 99 ? '99+' : count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    });
  }

  // Set active tab programmatically
  setActiveTab(tabId) {
    this.element.querySelector('.active')?.classList.remove('active');
    const activeItem = this.element.querySelector(`[data-tab="${tabId}"]`);
    activeItem?.classList.add('active');
    this.activeTab = tabId;
  }

  // Attach to DOM
  attach(parent) {
    parent.appendChild(this.element);
    return this.element;
  }
}

// Global factory (Telegram-style usage)
window.CraneTabBar = (config) => new TabBar(config);
