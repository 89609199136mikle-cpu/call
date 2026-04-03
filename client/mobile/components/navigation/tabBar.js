/**
 * CRANEAPP - UI COMPONENT: TAB BAR
 * Путь: client/mobile/components/navigation/tabBar.js
 * Описание: Нижняя панель навигации для переключения между главными экранами.
 */

export class TabBar {
    /**
     * @param {Object} options
     * @param {string} options.initialTab - ID начальной вкладки
     * @param {Function} options.onTabChange - Колбэк при смене вкладки
     */
    constructor(options = {}) {
        this.onTabChange = options.onTabChange || (() => {});
        this.activeTabId = options.initialTab || 'chats';
        this.tabs = [
            { id: 'contacts', label: 'Контакты', icon: '👤' },
            { id: 'calls', label: 'Звонки', icon: '📞' },
            { id: 'chats', label: 'Чаты', icon: '💬', badge: 0 },
            { id: 'settings', label: 'Настройки', icon: '⚙️' }
        ];
        this.element = null;
    }

    /**
     * Рендеринг панели
     */
    render() {
        this.element = document.createElement('nav');
        this.element.className = 'crane-tab-bar';

        this.tabs.forEach(tab => {
            const button = document.createElement('button');
            button.className = `tab-item ${this.activeTabId === tab.id ? 'active' : ''}`;
            button.dataset.id = tab.id;

            button.innerHTML = `
                <div class="tab-icon-wrapper">
                    <span class="tab-icon">${tab.icon}</span>
                    ${tab.badge > 0 ? `<span class="tab-badge">${tab.badge}</span>` : ''}
                </div>
                <span class="tab-label">${tab.label}</span>
            `;

            button.onclick = () => this._handleTabClick(tab.id);
            this.element.appendChild(button);
        });

        return this.element;
    }

    /**
     * Обновление счетчика сообщений (Badge)
     */
    updateBadge(tabId, count) {
        const tab = this.tabs.find(t => t.id === tabId);
        if (tab) {
            tab.badge = count;
            const btn = this.element.querySelector(`[data-id="${tabId}"] .tab-icon-wrapper`);
            const existingBadge = btn.querySelector('.tab-badge');
            
            if (count > 0) {
                if (existingBadge) {
                    existingBadge.textContent = count > 99 ? '99+' : count;
                } else {
                    const badge = document.createElement('span');
                    badge.className = 'tab-badge';
                    badge.textContent = count;
                    btn.appendChild(badge);
                }
            } else if (existingBadge) {
                existingBadge.remove();
            }
        }
    }

    _handleTabClick(id) {
        if (this.activeTabId === id) return;

        // Визуальное переключение
        this.element.querySelectorAll('.tab-item').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.id === id);
        });

        this.activeTabId = id;
        this.onTabChange(id);
    }
}
