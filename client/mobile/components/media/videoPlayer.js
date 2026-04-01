/**
 * CraneApp Video Player Component
 * Telegram-style video preview/player (inline + fullscreen)
 */

export class VideoPlayer {
  static create({ videoUrl, thumbnailUrl, poster, onClose }) {
    const player = document.createElement('div');
    player.className = 'video-player';
    
    player.innerHTML = `
      <div class="video-player-overlay" data-action="close"></div>
      <div class="video-player-container">
        <video 
          src="${videoUrl}" 
          poster="${thumbnailUrl || poster}" 
          class="video-player-video"
          playsinline
          preload="metadata"
          webkit-playsinline
        >
        </video>
        <div class="video-player-play-overlay">
          <div class="video-player-play-btn">▶️</div>
        </div>
        <div class="video-player-controls">
          <div class="video-player-progress">
            <div class="video-player-progress-filled"></div>
          </div>
          <div class="video-player-time">0:00 / 0:00</div>
        </div>
      </div>
    `;
    
    const video = player.querySelector('.video-player-video');
    const playOverlay = player.querySelector('.video-player-play-overlay');
    const progress = player.querySelector('.video-player-progress-filled');
    const time = player.querySelector('.video-player-time');
    const overlay = player.querySelector('.video-player-overlay');
    
    // Play/Pause
    playOverlay.addEventListener('click', () => video.play());
    video.addEventListener('click', () => {
      if (video.paused) video.play();
      else video.pause();
    });
    
    // Controls visibility
    let controlsTimeout;
    const showControls = () => {
      clearTimeout(controlsTimeout);
      player.classList.add('controls-visible');
      controlsTimeout = setTimeout(() => {
        player.classList.remove('controls-visible');
      }, 3000);
    };
    
    player.addEventListener('mousemove', showControls);
    player.addEventListener('touchstart', showControls);
    
    // Progress + Time
    video.addEventListener('loadedmetadata', () => {
      time.textContent = this.formatTime(0) + ' / ' + this.formatTime(video.duration);
    });
    
    video.addEventListener('timeupdate', () => {
      const percent = (video.currentTime / video.duration) * 100;
      progress.style.width = percent + '%';
      time.textContent = this.formatTime(video.currentTime) + ' / ' + this.formatTime(video.duration);
    });
    
    // Close
    overlay.addEventListener('click', onClose);
    
    document.body.appendChild(player);
    return player;
  }
  
  static formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}

window.CraneVideoPlayer = VideoPlayer.create;
