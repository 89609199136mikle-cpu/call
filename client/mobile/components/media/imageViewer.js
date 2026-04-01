/**
 * CraneApp Image Viewer Component
 * Telegram-style full-screen image viewer (zoom, pan, share)
 */

export class ImageViewer {
  static create({ imageUrl, thumbnailUrl, onClose, onShare }) {
    const viewer = document.createElement('div');
    viewer.className = 'image-viewer';
    
    viewer.innerHTML = `
      <div class="image-viewer-overlay" data-action="close"></div>
      <div class="image-viewer-header">
        <button class="image-viewer-btn" data-action="close">←</button>
        <div class="image-viewer-info">
          <span class="image-viewer-filename">photo.jpg</span>
          <span class="image-viewer-size">2.1 MB</span>
        </div>
        <button class="image-viewer-btn" data-action="share">↗️</button>
      </div>
      <div class="image-viewer-container">
        <img src="${thumbnailUrl || imageUrl}" data-src="${imageUrl}" class="image-viewer-img" />
      </div>
    `;
    
    const img = viewer.querySelector('.image-viewer-img');
    const overlay = viewer.querySelector('.image-viewer-overlay');
    const closeBtn = viewer.querySelectorAll('[data-action="close"]');
    const shareBtn = viewer.querySelector('[data-action="share"]');
    
    // Load high-res image
    img.addEventListener('load', () => {
      if (img.dataset.src !== img.src) {
        img.src = img.dataset.src;
      }
    });
    
    // Zoom/Pan gestures
    let scale = 1, posX = 0, posY = 0;
    let isDragging = false, startX, startY;
    
    viewer.addEventListener('wheel', (e) => {
      e.preventDefault();
      scale += e.deltaY * -0.01;
      scale = Math.min(Math.max(0.5, scale), 5);
      img.style.transform = `scale(${scale})`;
    });
    
    viewer.addEventListener('pointerdown', (e) => {
      isDragging = true;
      startX = e.clientX - posX;
      startY = e.clientY - posY;
    });
    
    viewer.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      posX = e.clientX - startX;
      posY = e.clientY - startY;
      img.style.transform = `scale(${scale}) translate(${posX}px, ${posY}px)`;
    });
    
    viewer.addEventListener('pointerup', () => isDragging = false);
    
    // Double-click zoom
    viewer.addEventListener('dblclick', (e) => {
      e.preventDefault();
      scale = scale > 1 ? 1 : 3;
      img.style.transform = `scale(${scale})`;
    });
    
    // Controls
    closeBtn.forEach(btn => btn.addEventListener('click', onClose));
    overlay.addEventListener('click', onClose);
    shareBtn.addEventListener('click', onShare);
    
    document.body.appendChild(viewer);
    return viewer;
  }
}

window.CraneImageViewer = ImageViewer.create;
