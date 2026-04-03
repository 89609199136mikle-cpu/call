/**
 * CRANEAPP - UI COMPONENT: IMAGE VIEWER
 * Путь: client/mobile/components/media/imageViewer.js
 * Описание: Полноэкранный просмотрщик изображений с поддержкой закрытия жестом.
 */

export class ImageViewer {
    /**
     * @param {Object} options
     * @param {string} options.src - URL изображения
     * @param {string} options.caption - Описание (опционально)
     */
    constructor(options = {}) {
        this.src = options.src;
        this.caption = options.caption || '';
        this.overlay = null;
        this.touchStartY = 0;
    }

    /**
     * Инициализация и отображение
     */
    show() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'image-viewer-overlay fade-in';
        
        this.overlay.innerHTML = `
            <div class="viewer-header">
                <button class="viewer-close">&times;</button>
            </div>
            <div class="viewer-content">
                <img src="${this.src}" class="viewer-img zoom-in" alt="Media content">
            </div>
            ${this.caption ? `<div class="viewer-footer"><p>${this._escape(this.caption)}</p></div>` : ''}
        `;

        document.body.appendChild(this.overlay);
        this._bindEvents();
    }

    /**
     * Обработка событий (закрытие, жесты)
     */
    _bindEvents() {
        const closeBtn = this.overlay.querySelector('.viewer-close');
        const img = this.overlay.querySelector('.viewer-img');

        // Закрытие по кнопке
        closeBtn.onclick = () => this.close();

        // Закрытие при клике на пустую область
        this.overlay.onclick = (e) => {
            if (e.target === this.overlay || e.target.className === 'viewer-content') {
                this.close();
            }
        };

        // Поддержка Swipe-to-close (смахивание вниз)
        this.overlay.addEventListener('touchstart', (e) => {
            this.touchStartY = e.touches[0].clientY;
        }, { passive: true });

        this.overlay.addEventListener('touchmove', (e) => {
            const deltaY = e.touches[0].clientY - this.touchStartY;
            if (deltaY > 0) {
                img.style.transform = `translateY(${deltaY}px) scale(${1 - deltaY / 1000})`;
                this.overlay.style.backgroundColor = `rgba(0, 0, 0, ${0.9 - deltaY / 500})`;
            }
        }, { passive: true });

        this.overlay.addEventListener('touchend', (e) => {
            const deltaY = e.changedTouches[0].clientY - this.touchStartY;
            if (deltaY > 150) {
                this.close();
            } else {
                img.style.transform = '';
                this.overlay.style.backgroundColor = '';
            }
        });
    }

    close() {
        if (!this.overlay) return;
        this.overlay.classList.add('fade-out');
        setTimeout(() => {
            if (this.overlay && this.overlay.parentNode) {
                this.overlay.remove();
            }
            this.overlay = null;
        }, 250);
    }

    _escape(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
}
