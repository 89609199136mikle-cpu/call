/**
 * Craneapp UI: Modal Component
 * Путь: client/mobile/components/ui/modal.js
 * Описание: Универсальный компонент модального окна с поддержкой анимаций и кастомного контента.
 */

export class Modal {
    /**
     * @param {Object} options
     * @param {string} options.title - Заголовок окна
     * @param {string|HTMLElement} options.content - Контент окна
     * @param {Array} options.actions - Массив кнопок [{text, type, onClick}]
     * @param {boolean} options.closeOnOverlay - Закрывать ли при клике на фон
     */
    constructor(options = {}) {
        this.options = {
            title: '',
            content: '',
            actions: [],
            closeOnOverlay: true,
            ...options
        };
        this.modalElement = null;
        this.overlayElement = null;
    }

    /**
     * Инициализация и отображение модального окна
     */
    show() {
        // Создаем оверлей
        this.overlayElement = document.createElement('div');
        this.overlayElement.className = 'crane-modal-overlay animate-fade-in';

        // Создаем контейнер окна
        this.modalElement = document.createElement('div');
        this.modalElement.className = 'crane-modal-window animate-slide-up';
        
        this.modalElement.innerHTML = `
            <div class="modal-header">
                <h3 class="modal-title">${this.options.title}</h3>
                <button class="modal-close-icon" aria-label="Close">&times;</button>
            </div>
            <div class="modal-body"></div>
            <div class="modal-footer"></div>
        `;

        // Вставляем контент
        const body = this.modalElement.querySelector('.modal-body');
        if (this.options.content instanceof HTMLElement) {
            body.appendChild(this.options.content);
        } else {
            body.innerHTML = this.options.content;
        }

        // Рендерим кнопки действий
        const footer = this.modalElement.querySelector('.modal-footer');
        this.options.actions.forEach(action => {
            const btn = document.createElement('button');
            btn.className = `modal-btn btn-${action.type || 'secondary'}`;
            btn.textContent = action.text;
            btn.onclick = () => {
                if (action.onClick) action.onClick(this);
                else this.close();
            };
            footer.appendChild(btn);
        });

        // Добавляем в DOM
        this.overlayElement.appendChild(this.modalElement);
        document.body.appendChild(this.overlayElement);

        this._bindEvents();
    }

    /**
     * Закрытие окна с удалением из DOM
     */
    close() {
        if (!this.overlayElement) return;

        // Добавляем класс для обратной анимации
        this.modalElement.classList.add('animate-exit');
        this.overlayElement.classList.add('fade-out');

        setTimeout(() => {
            if (this.overlayElement && this.overlayElement.parentNode) {
                document.body.removeChild(this.overlayElement);
            }
            this.modalElement = null;
            this.overlayElement = null;
        }, 300); // Тайминг соответствует CSS анимации
    }

    _bindEvents() {
        // Кнопка закрытия (крестик)
        this.modalElement.querySelector('.modal-close-icon').onclick = () => this.close();

        // Клик по фону
        if (this.options.closeOnOverlay) {
            this.overlayElement.onclick = (e) => {
                if (e.target === this.overlayElement) this.close();
            };
        }

        // Закрытие по ESC
        this._escHandler = (e) => {
            if (e.key === 'Escape') this.close();
        };
        document.addEventListener('keydown', this._escHandler, { once: true });
    }
}
