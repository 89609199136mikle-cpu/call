/**
 * ================================================================================
 * CRANEAPP — MODAL SYSTEM (UI COMPONENT)
 * ================================================================================
 * Файл: client/mobile/components/ui/modal.js
 * Назначение: Управление всплывающими окнами, диалогами и селекторами.
 * ================================================================================
 */

export class Modal {
    /**
     * @param {Object} options 
     * @param {string} options.title - Заголовок окна
     * @param {HTMLElement|string} options.content - Контент (HTML или узел)
     * @param {Array} options.actions - Кнопки [{text, type, onClick}]
     * @param {boolean} options.closeOnOverlay - Закрывать при клике на фон
     */
    constructor(options = {}) {
        this.options = {
            title: '',
            content: '',
            actions: [],
            closeOnOverlay: true,
            ...options
        };

        this.element = null;
        this.overlay = null;
    }

    /**
     * Создание и отображение модального окна
     */
    show() {
        // Создаем оверлей (фон)
        this.overlay = document.createElement('div');
        this.overlay.className = 'crane-modal-overlay';

        // Создаем само окно
        const modal = document.createElement('div');
        modal.className = 'crane-modal-window animate-pop-in';

        modal.innerHTML = `
            <div class="modal-header">
                <h3 class="modal-title">${this.options.title}</h3>
                <div class="modal-close-btn">&times;</div>
            </div>
            <div class="modal-body">
                ${typeof this.options.content === 'string' ? this.options.content : ''}
            </div>
            <div class="modal-footer"></div>
        `;

        // Если контент — DOM-узел, вставляем его отдельно
        if (typeof this.options.content !== 'string') {
            modal.querySelector('.modal-body').appendChild(this.options.content);
        }

        // Рендерим кнопки (экшены)
        const footer = modal.querySelector('.modal-footer');
        this.options.actions.forEach(action => {
            const btn = document.createElement('button');
            btn.className = `modal-btn btn-${action.type || 'ghost'}`;
            btn.innerText = action.text;
            btn.onclick = () => {
                if (action.onClick) action.onClick(this);
                else this.close();
            };
            footer.appendChild(btn);
        });

        this.overlay.appendChild(modal);
        document.body.appendChild(this.overlay);
        this.element = modal;

        this._setupEvents();
    }

    /**
     * Закрытие с анимацией
     */
    close() {
        if (!this.overlay) return;
        
        this.element.classList.replace('animate-pop-in', 'animate-pop-out');
        this.overlay.style.opacity = '0';

        setTimeout(() => {
            if (this.overlay && this.overlay.parentNode) {
                document.body.removeChild(this.overlay);
            }
            this.overlay = null;
            this.element = null;
        }, 300);
    }

    _setupEvents() {
        // Закрытие по кнопке-крестику
        this.element.querySelector('.modal-close-btn').onclick = () => this.close();

        // Закрытие по клику на фон
        if (this.options.closeOnOverlay) {
            this.overlay.onclick = (e) => {
                if (e.target === this.overlay) this.close();
            };
        }
    }
}
