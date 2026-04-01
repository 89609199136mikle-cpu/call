/**
 * CraneApp GIF Viewer Component
 * Telegram-style GIF preview/player (autoplay, share, save)
 */

export class GifViewer {
  static create({ gifUrl, previewUrl, senderName, onShare, onSave }) {
    const viewer = document.createElement('div');
    viewer.className = 'gif-viewer';
    
    viewer.innerHTML = `
      <div class="gif-viewer-overlay"></div>
      <div class="gif-viewer-header">
        <button class="gif-viewer-close">←</button>
        <div class="gif-viewer-sender">${senderName}</div>
      </div>
      <div class="gif-viewer-container">
        <img src="${previewUrl || gifUrl}" class="gif-viewer-gif" data-src="${gifUrl}" />
      </div>
      <div class="gif-viewer-actions">
        <button class="gif-action" data-action="share">↗️ Share</button>
        <button class="gif-action" data-action="save">💾 Save</button>
        <button class="gif-action" data-action="copy">📋 Copy link</button>
      </div>
    `;
    
    const gif = viewer.querySelector('.gif-viewer-gif');
    const closeBtn = viewer.querySelector('.gif-viewer-close');
    const actions = viewer.querySelectorAll('.gif-action');
    
    // Load full GIF
    gif.addEventListener('load', () => {
      gif.src = gif.dataset.src;
      gif.classList.add('loaded');
    });
    
    // Autoplay on hover (Telegram-style)
    gif.addEventListener('mouseenter', () => gif.play?.());
    gif.addEventListener('mouseleave', () => gif.pause?.());
    
    // Actions
    closeBtn.addEventListener('click', () => viewer.remove());
    
    actions.forEach(action => {
      action.addEventListener('click', () => {
        const actionType = action.dataset.action;
        if (actionType === 'share') onShare?.(gifUrl);
        if (actionType === 'save') onSave?.(gifUrl);
        if (actionType === 'copy') {
          navigator.clipboard.writeText(gifUrl);
          action.textContent = 'Copied!';
          setTimeout(() => action.textContent = 'Copy link', 2000);
        }
      });
    });
    
    // Overlay close
    viewer.querySelector('.gif-viewer-overlay').addEventListener('click', () => viewer.remove());
    
    document.body.appendChild(viewer);
    return viewer;
  }
}

window.CraneGifViewer = GifViewer.create;
