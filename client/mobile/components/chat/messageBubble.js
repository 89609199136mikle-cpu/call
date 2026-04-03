/**
 * CRANEAPP - UI COMPONENT: MESSAGE BUBBLE
 * Путь: client/mobile/components/chat/messageBubble.js
 * Описание: Отрисовка отдельного облака сообщения (текст, время, статус).
 */

export class MessageBubble {
    /**
     * @param {Object} data 
     * @param {string} data.id - ID сообщения
     * @param {string} data.text - Содержание
     * @param {string} data.timestamp - Время отправки (ISO)
     * @param {boolean} data.isOwn - Флаг: моё сообщение или чужое
     * @param {string} data.status - Статус (sent, delivered, read)
     */
    constructor(data) {
        this.data = data;
    }

    /**
     * Форматирование времени из ISO строки
     */
    _formatTime(isoString) {
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    /**
     * Генерация HTML-разметки сообщения
     */
    render() {
        const { text, timestamp, isOwn, status } = this.data;
        const alignClass = isOwn ? 'msg-own' : 'msg-inbound';
        
        const bubble = document.createElement('div');
        bubble.className = `message-bubble-container ${alignClass}`;
        bubble.dataset.id = this.data.id;

        bubble.innerHTML = `
            <div class="bubble">
                <div class="bubble-content">
                    <span class="bubble-text">${this._escapeHTML(text)}</span>
                </div>
                <div class="bubble-meta">
                    <span class="bubble-time">${this._formatTime(timestamp)}</span>
                    ${isOwn ? `<span class="bubble-status status-${status}">${this._getStatusIcon(status)}</span>` : ''}
                </div>
            </div>
        `;

        return bubble;
    }

    /**
     * Защита от XSS (безопасный вывод текста)
     */
    _escapeHTML(str) {
        const p = document.createElement('p');
        p.textContent = str;
        return p.innerHTML;
    }

    /**
     * Возвращает иконку статуса (SVG или символ)
     */
    _getStatusIcon(status) {
        switch (status) {
            case 'sent': return '✓';
            case 'delivered': return '✓✓';
            case 'read': return '<span class="read-check">✓✓</span>';
            default: return '';
        }
    }
}
