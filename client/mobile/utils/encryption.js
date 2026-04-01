/**
 * CraneApp Encryption Utils
 * Client-side message encryption (AES-GCM + PBKDF2)
 * Telegram Secret Chats compatible
 */

export class Encryption {
  static async generateKey(password, salt) {
    // PBKDF2 key derivation
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );
    
    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: enc.encode(salt),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
  }

  static async encryptMessage(message, key) {
    const enc = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      enc.encode(message)
    );
    
    return {
      iv: Array.from(iv),
      data: Array.from(new Uint8Array(encrypted)),
      tag: Array.from(new Uint8Array(encrypted.slice(-16)))
    };
  }

  static async decryptMessage(encrypted, key) {
    const enc = new TextDecoder();
    const iv = new Uint8Array(encrypted.iv);
    const data = new Uint8Array(encrypted.data);
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );
    
    return enc.decode(decrypted);
  }

  // Base64 utils
  static encode(data) {
    if (data instanceof ArrayBuffer) {
      return btoa(String.fromCharCode(...new Uint8Array(data)));
    }
    return btoa(String.fromCharCode(...new Uint8Array(data.data)));
  }

  static decode(str) {
    const binary = atob(str);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }
}

window.Encryption = Encryption;
