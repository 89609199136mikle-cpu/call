/**
 * CRANEAPP - UI COMPONENT: MODAL
 * Путь: client/mobile/components/ui/modal.js
 */

export class Modal {
    /**
     * @param {Object} options 
     * @param {string} options.title - Заголовок окна
     * @param {string|HTMLElement} options.content - Основной текст или HTML-узел
     * @param {Array} options.actions - Массив кнопок: [{ text, type, onClick }]
     * @param {boolean} options.overlayClose - Закрывать ли при клике на фон (default: true)
     */
    constructor(options = {}) {
        this.options = {
            title: 'Оповещение',
            content: '',
            actions: [],
            overlayClose: true,
            ...options
        };
        this.overlay = null;
        this.modal = null;
    }

    /**
     * Создание структуры модального окна в DOM
     */
    _create() {
        // Создаем затемняющий фон (Overlay)
        this.overlay = document.createElement('div');
        this.overlay.className = 'crane-modal-overlay fade-in';

        // Создаем само окно
        this.modal = document.createElement('div');
        this.modal.className = 'crane-modal-window scale-up';

        // Шапка окна
        const header = document.createElement('div');
        header.className = 'modal-header';
        header.innerHTML = `
            <span class="modal-title">${this.options.title}</span>
            <button class="modal-close-x">&times;</button>
        `;

        // Тело окна
        const body = document.createElement('div');
        body.className = 'modal-body';
        if (this.options.content instanceof HTMLElement) {
            body.appendChild(this.options.content);
        } else {
            body.innerHTML = `<p>${this.options.content}</p>`;
        }

        // Подвал (Кнопки действий)
        const footer = document.createElement('div');
        footer.className = 'modal-footer';

        if (this.options.actions.length === 0) {
            // Если кнопок нет, добавляем дефолтную "ОК"
            this.options.actions.push({
                text: 'Понятно',
                type: 'primary',
                onClick: (m) => m.close()
            });
        }

        this.options.actions.forEach(action => {
            const btn = document.createElement('button');
            btn.className = `modal-btn btn-${action.type || 'secondary'}`;
            btn.textContent = action.text;
            btn.onclick = () => action.onClick(this);
            footer.appendChild(btn);
        });

        // Сборка
        this.modal.appendChild(header);
        this.modal.appendChild(body);
        this.modal.appendChild(footer);
        this.overlay.appendChild(this.modal);

        // События закрытия
        header.querySelector('.modal-close-x').onclick = () => this.close();
        if (this.options.overlayClose) {
            this.overlay.onclick = (e) => {
                if (e.target === this.overlay) this.close();
            };
        }
    }

    /**
     * Показать окно
     */
    show() {
        if (!this.overlay) this._create();
        document.body.appendChild(this.overlay);
        document.body.style.overflow = 'hidden'; // Блокируем скролл фона
    }

    /**
     * Скрыть и удалить окно из DOM
     */
    close() {
        if (!this.overlay) return;
        
        // Добавляем класс анимации выхода
        this.modal.classList.add('scale-down');
        this.overlay.classList.add('fade-out');

        // Удаляем после завершения анимации (300ms)
        setTimeout(() => {
            if (this.overlay && this.overlay.parentNode) {
                document.body.removeChild(this.overlay);
            }
            document.body.style.overflow = '';
            this.overlay = null;
        }, 250);
    }
}
