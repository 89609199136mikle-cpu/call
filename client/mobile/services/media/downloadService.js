/**
 * CraneApp Media Download Service
 * Caching + background download + offline viewing
 */

class DownloadService {
  constructor() {
    this.cache = new Map();
  }

  // Download media file
  async downloadMedia(mediaId, url) {
    // Check cache first
    const cached = this.cache.get(mediaId);
    if (cached) return cached;

    const token = localStorage.getItem('crane_token');
    
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Download failed');

    const blob = await response.blob();
    const cachedBlob = new Blob([blob], { type: blob.type });
    
    // Cache blob URL (24h TTL)
    const blobUrl = URL.createObjectURL(cachedBlob);
    this.cache.set(mediaId, blobUrl);
    
    // Cleanup old cache
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
      this.cache.delete(mediaId);
    }, 24 * 60 * 60 * 1000);
    
    return blobUrl;
  }

  // Preload multiple media files
  async preloadMedia(mediaIds) {
    const promises = mediaIds.map(async (media) => {
      try {
        await this.downloadMedia(media.id, media.url);
      } catch (e) {
        console.warn('Preload failed:', media.id);
      }
    });
    return Promise.all(promises);
  }

  // Clear all cache
  clearCache() {
    this.cache.forEach(url => URL.revokeObjectURL(url));
    this.cache.clear();
  }
}

window.DownloadService = new DownloadService();
