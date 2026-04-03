/**
 * CRANEAPP - UI COMPONENT: AUDIO PLAYER
 * Путь: client/mobile/components/media/audioPlayer.js
 * Описание: Плеер для голосовых сообщений и аудиофайлов с визуализацией прогресса.
 */

export class AudioPlayer {
    /**
     * @param {Object} options
     * @param {string} options.src - URL аудиофайла
     * @param {number} options.duration - Длительность в секундах (опционально)
     * @param {boolean} options.isVoiceMessage - Стилизовать ли как голосовое сообщение
     */
    constructor(options = {}) {
        this.src = options.src;
        this.duration = options.duration || 0;
        this.isVoiceMessage = options.isVoiceMessage !== false;
        this.audio = new Audio(this.src);
        this.isPlaying = false;
        this.element = null;
    }

    /**
     * Рендеринг аудиоплеера
     */
    render() {
        const container = document.createElement('div');
        container.className = `crane-audio-player ${this.isVoiceMessage ? 'voice-mode' : 'file-mode'}`;

        container.innerHTML = `
            <button class="audio-play-btn">
                <div class="play-icon"></div>
            </button>
            <div class="audio-content">
                <div class="audio-waveform">
                    <div class="waveform-bg"></div>
                    <div class="waveform-progress"></div>
                </div>
                <div class="audio-info">
                    <span class="audio-time">0:00</span>
                    ${this.isVoiceMessage ? '' : '<span class="audio-filename">audio_file.mp3</span>'}
                </div>
            </div>
        `;

        this.element = container;
        this._bindEvents();
        return container;
    }

    _bindEvents() {
        const playBtn = this.element.querySelector('.audio-play-btn');
        const progress = this.element.querySelector('.waveform-progress');
        const timeDisplay = this.element.querySelector('.audio-time');

        // Toggle Play/Pause
        playBtn.onclick = () => {
            if (this.isPlaying) {
                this.audio.pause();
            } else {
                // Остановить другие плееры (опционально)
                this.audio.play();
            }
        };

        this.audio.onplay = () => {
            this.isPlaying = true;
            this.element.classList.add('playing');
        };

        this.audio.onpause = () => {
            this.isPlaying = false;
            this.element.classList.remove('playing');
        };

        // Обновление прогресса
        this.audio.ontimeupdate = () => {
            const pct = (this.audio.currentTime / this.audio.duration) * 100;
            progress.style.width = `${pct}%`;
            timeDisplay.textContent = this._formatTime(this.audio.currentTime);
        };

        this.audio.onloadedmetadata = () => {
            timeDisplay.textContent = this._formatTime(this.audio.duration);
        };

        this.audio.onended = () => {
            this.isPlaying = false;
            this.element.classList.remove('playing');
            progress.style.width = '0%';
        };
    }

    _formatTime(seconds) {
        if (isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    destroy() {
        this.audio.pause();
        this.audio.src = '';
        this.element?.remove();
    }
}
