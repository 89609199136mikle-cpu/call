/**
 * CRANEAPP - UI COMPONENT: HEADER
 * Путь: client/mobile/components/navigation/header.js
 * Описание: Верхняя панель навигации с поддержкой динамического контента и кнопками действий.
 */

export class Header {
    /**
     * @param {Object} options
     * @param {string} options.title - Заголовок (имя пользователя или название раздела)
     * @param {string} options.subtitle - Подзаголовок (статус "в сети" или количество участников)
     * @param {string} options.avatarUrl - URL аватара для режима чата
     * @param {boolean} options.showBack - Показывать ли кнопку "Назад"
     * @param {Array} options.actions - Кнопки справа [{icon, onClick}]
     * @param {Function} options.onBack - Обработчик нажатия "Назад"
     */
    constructor(options = {}) {
        this.options = {
            title: 'Craneapp',
            subtitle: '',
            avatarUrl: '',
            showBack: false,
            actions: [],
            onBack: () => window.history.back(),
            ...options
        };
        this.element = null;
    }

    /**
     * Рендеринг хедера
     */
    render() {
        this.element = document.createElement('header');
        this.element.className = 'crane-header';

        const leftSection = document.createElement('div');
        leftSection.className = 'header-left';

        // Кнопка назад
        if (this.options.showBack) {
            const backBtn = document.createElement('button');
            backBtn.className = 'header-btn back-btn';
            backBtn.innerHTML = '‹'; // Или SVG иконка
            backBtn.onclick = () => this.options.onBack();
            leftSection.appendChild(backBtn);
        }

        // Аватар (если есть)
        if (this.options.avatarUrl) {
            const avatar = document.createElement('img');
            avatar.className = 'header-avatar';
            avatar.src = this.options.avatarUrl;
            leftSection.appendChild(avatar);
        }

        // Текстовая информация
        const info = document.createElement('div');
        info.className = 'header-info';
        info.innerHTML = `
            <h1 class="header-title">${this._escape(this.options.title)}</h1>
            ${this.options.subtitle ? `<span class="header-subtitle">${this._escape(this.options.subtitle)}</span>` : ''}
        `;
        leftSection.appendChild(info);

        // Правая секция с кнопками
        const rightSection = document.createElement('div');
        rightSection.className = 'header-right';
        this.options.actions.forEach(action => {
            const btn = document.createElement('button');
            btn.className = 'header-btn action-btn';
            btn.innerHTML = action.icon;
            btn.onclick = action.onClick;
            rightSection.appendChild(btn);
        });

        this.element.appendChild(leftSection);
        this.element.appendChild(rightSection);

        return this.element;
    }

    /**
     * Обновление статуса (например, "печатает..." или "в сети")
     */
    updateSubtitle(text) {
        const sub = this.element.querySelector('.header-subtitle');
        if (sub) sub.textContent = text;
    }

    _escape(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
}
