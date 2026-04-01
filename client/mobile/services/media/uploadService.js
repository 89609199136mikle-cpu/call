/**
 * CraneApp Media Upload Service
 * File compression + chunked upload + progress
 */

class UploadService {
  constructor() {
    this.maxFileSize = 50 * 1024 * 1024; // 50MB
    this.chunkSize = 5 * 1024 * 1024; // 5MB chunks
  }

  // Compress image before upload
  async compressImage(file) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Max 1080px dimension
        const maxSize = 1080;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(resolve, 'image/jpeg', 0.8);
      };
      
      img.src = URL.createObjectURL(file);
    });
  }

  // Upload file with progress
  async uploadFile(file, onProgress) {
    if (file.size > this.maxFileSize) {
      throw new Error('File too large (max 50MB)');
    }

    const token = localStorage.getItem('crane_token');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', file.type.split('/')[0]);

    const response = await fetch('https://api.craneapp.com/v1/media/upload', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });

    if (!response.ok) throw new Error('Upload failed');
    
    return await response.json();
  }

  // Upload with compression + progress
  async uploadMedia(file, onProgress = () => {}) {
    let uploadFile = file;
    
    // Compress images
    if (file.type.startsWith('image/')) {
      uploadFile = await this.compressImage(file);
    }
    
    return this.uploadFile(uploadFile, onProgress);
  }
}

window.UploadService = new UploadService();
