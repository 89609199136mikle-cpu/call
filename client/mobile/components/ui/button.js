/**
 * ================================================================================
 * CRANEAPP — REUSABLE BUTTON COMPONENT
 * ================================================================================
 * Файл: client/mobile/app/components/button.js
 * Назначение: Генерация кнопок с поддержкой тем, иконок и состояний загрузки.
 * ================================================================================
 */

import iconsData from '../../../assets/icons.json';

export class Button {
    /**
     * @param {Object} options 
     * @param {string} options.text - Текст кнопки
     * @param {string} options.type - 'primary', 'secondary', 'ghost', 'danger'
     * @param {string} options.icon - Ключ иконки из icons.json (например, 'send')
     * @param {boolean} options.fullWidth - Растянуть на всю ширину
     * @param {Function} options.onClick - Обработчик клика
     * @param {string} options.id - HTML ID
     */
    constructor(options = {}) {
        this.options = {
            text: '',
            type: 'primary',
            icon: null,
            fullWidth: false,
            loading: false,
            disabled: false,
            className: '',
            ...options
        };
        
        this.element = null;
    }

    /**
     * Рендеринг HTML-структуры кнопки
     */
    render() {
        const { text, type, icon, fullWidth, disabled, className, id } = this.options;
        
        const btn = document.createElement('button');
        btn.id = id || `btn-${Math.random().toString(36).substr(2, 9)}`;
        
        // Базовые и функциональные классы
        btn.className = `crane-btn btn-${type} ${fullWidth ? 'btn-block' : ''} ${className}`;
        
        if (disabled) btn.disabled = true;

        // Внутренняя структура: [Иконка] [Текст] [Спиннер]
        btn.innerHTML = `
            <div class="btn-content">
                ${icon ? this._getIconSvg(icon) : ''}
                ${text ? `<span class="btn-text">${text}</span>` : ''}
            </div>
            <div class="btn-loader">
                <div class="spinner-dot"></div>
            </div>
        `;

        // Слушатель клика с защитой от двойного нажатия
        btn.addEventListener('click', (e) => {
            if (this.options.loading || this.options.disabled) return;
            if (this.options.onClick) this.options.onClick(e, this);
        });

        this.element = btn;
        return btn;
    }

    /**
     * Включение состояния загрузки (заменяет текст на спиннер)
     */
    setLoading(isLoading) {
        this.options.loading = isLoading;
        if (this.element) {
            this.element.classList.toggle('is-loading', isLoading);
            this.element.disabled = isLoading;
        }
    }

    /**
     * Изменение текста динамически
     */
    setText(newText) {
        this.options.text = newText;
        const textSpan = this.element?.querySelector('.btn-text');
        if (textSpan) textSpan.innerText = newText;
    }

    /**
     * Приватный метод для извлечения SVG из ассетов
     */
    _getIconSvg(iconKey) {
        // Ищем иконку в разных категориях JSON
        const path = iconsData.icons.chat[iconKey] || 
                     iconsData.icons.nav[iconKey] || 
                     iconsData.icons.actions[iconKey];

        if (!path) return '';

        return `
            <svg class="btn-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
                 stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="${path}"></path>
            </svg>
        `;
    }
}
