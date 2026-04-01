/**
 * CraneApp Audio Player Component
 * Telegram-style voice message player (waveform + speed)
 */

export class AudioPlayer {
  static create({ audioUrl, duration, waveform, senderName, onDelete }) {
    const player = document.createElement('div');
    player.className = 'audio-player';
    
    player.innerHTML = `
      <div class="audio-player-avatar">
        <div class="avatar avatar--32px">
          <div class="avatar-initials">${senderName[0]}</div>
        </div>
      </div>
      <div class="audio-player-content">
        <div class="audio-player-header">
          <span class="audio-player-sender">${senderName}</span>
          <span class="audio-player-duration">${this.formatTime(duration)}</span>
        </div>
        <div class="audio-player-waveform">
          <div class="audio-player-wave" style="background-image: url(${waveform})"></div>
          <div class="audio-player-progress"></div>
        </div>
        <div class="audio-player-controls">
          <button class="audio-player-btn" data-action="play">▶️</button>
          <button class="audio-player-btn speed" data-speed="1.7x">1.7x</button>
          ${onDelete ? '<button class="audio-player-btn" data-action="delete">🗑️</button>' : ''}
        </div>
      </div>
    `;
    
    const audio = new Audio(audioUrl);
    const playBtn = player.querySelector('[data-action="play"]');
    const progress = player.querySelector('.audio-player-progress');
    const speedBtn = player.querySelector('.speed');
    let currentSpeed = 1;
    
    audio.addEventListener('loadedmetadata', () => {
      player.querySelector('.audio-player-duration').textContent = this.formatTime(audio.duration);
    });
    
    audio.addEventListener('timeupdate', () => {
      const percent = (audio.currentTime / audio.duration) * 100;
      progress.style.width = percent + '%';
    });
    
    // Play/Pause + Speed
    playBtn.addEventListener('click', () => {
      if (audio.paused) {
        audio.playbackRate = currentSpeed;
        audio.play();
        playBtn.textContent = '⏸️';
      } else {
        audio.pause();
        playBtn.textContent = '▶️';
      }
    });
    
    speedBtn.addEventListener('click', () => {
      currentSpeed = currentSpeed === 1 ? 1.7 : 1;
      speedBtn.textContent = currentSpeed === 1 ? '1.7x' : '1x';
      speedBtn.classList.toggle('active', currentSpeed === 1.7);
    });
    
    // Seek
    player.querySelector('.audio-player-waveform').addEventListener('click', (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      audio.currentTime = percent * audio.duration;
    });
    
    if (onDelete) {
      player.querySelector('[data-action="delete"]').addEventListener('click', onDelete);
    }
    
    return player;
  }
  
  static formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}

window.CraneAudioPlayer = AudioPlayer.create;
