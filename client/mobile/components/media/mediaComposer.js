/**
 * CraneApp Media Composer Component
 * Telegram-style media picker + composer (gallery/camera + multi-select)
 */

export class MediaComposer {
  static create({ onMediaSelect, onSend }) {
    const composer = document.createElement('div');
    composer.className = 'media-composer';
    
    composer.innerHTML = `
      <div class="media-composer-header">
        <button class="composer-close">←</button>
        <div class="composer-counter">0 selected</div>
        <button class="composer-send" style="display: none;" disabled>Send</button>
      </div>
      <div class="media-composer-tabs">
        <button class="tab-btn active" data-tab="gallery">Gallery</button>
        <button class="tab-btn" data-tab="camera">Camera</button>
        <button class="tab-btn" data-tab="files">Files</button>
      </div>
      <div class="media-composer-content">
        <div class="media-grid" data-tab="gallery"></div>
        <div class="camera-preview" data-tab="camera" style="display: none;">
          <video class="camera-video" autoplay playsinline></video>
          <canvas class="camera-canvas" style="display: none;"></canvas>
          <div class="camera-overlay">
            <button class="camera-capture">📸</button>
          </div>
        </div>
        <div class="file-list" data-tab="files" style="display: none;"></div>
      </div>
      <div class="media-composer-preview"></div>
    `;
    
    const grid = composer.querySelector('.media-grid');
    const preview = composer.querySelector('.media-composer-preview');
    const counter = composer.querySelector('.composer-counter');
    const sendBtn = composer.querySelector('.composer-send');
    let selectedMedia = [];
    
    // Gallery (File API mock - real impl uses IndexedDB)
    const mockGallery = [
      { id: 1, thumb: '/assets/images/sample1.jpg', type: 'image' },
      { id: 2, thumb: '/assets/images/sample2.jpg', type: 'image' },
      { id: 3, thumb: '/assets/images/sample3.mp4', type: 'video' }
    ];
    
    mockGallery.forEach(item => {
      const mediaCard = document.createElement('div');
      mediaCard.className = 'media-card';
      mediaCard.innerHTML = `
        <img src="${item.thumb}" class="media-thumb" />
        <div class="media-select-overlay">
          <span class="media-checkbox">☐</span>
        </div>
      `;
      mediaCard.dataset.mediaId = item.id;
      grid.appendChild(mediaCard);
    });
    
    // Selection handling
    grid.querySelectorAll('.media-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = parseInt(card.dataset.mediaId);
        const index = selectedMedia.findIndex(m => m.id === id);
        
        if (index > -1) {
          selectedMedia.splice(index, 1);
          card.classList.remove('selected');
        } else {
          selectedMedia.push(mockGallery.find(m => m.id === id));
          card.classList.add('selected');
        }
        
        this.updatePreview(preview, selectedMedia);
        this.updateCounter(counter, selectedMedia);
        this.updateSendButton(sendBtn, selectedMedia);
      });
    });
    
    // Tab switching
    composer.querySelectorAll('.tab-btn').forEach(tab => {
      tab.addEventListener('click', () => {
        composer.querySelector('.tab-btn.active')?.classList.remove('active');
        tab.classList.add('active');
        
        const tabName = tab.dataset.tab;
        composer.querySelectorAll('[data-tab]').forEach(content => {
          content.style.display = content.dataset.tab === tabName ? 'block' : 'none';
        });
      });
    });
    
    // Send
    sendBtn.addEventListener('click', () => {
      onSend?.(selectedMedia);
      composer.remove();
    });
    
    // Close
    composer.querySelector('.composer-close').addEventListener('click', () => composer.remove());
    
    document.body.appendChild(composer);
    return composer;
  }
  
  static updatePreview(preview, media) {
    preview.innerHTML = media.map(item => `
      <div class="preview-item">
        <img src="${item.thumb}" />
        <button class="preview-remove">✕</button>
      </div>
    `).join('');
  }
  
  static updateCounter(counter, media) {
    counter.textContent = `${media.length} selected`;
  }
  
  static updateSendButton(btn, media) {
    btn.disabled = media.length === 0;
    btn.style.display = media.length > 0 ? 'flex' : 'none';
  }
}

window.CraneMediaComposer = MediaComposer.create;
