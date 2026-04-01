/**
 * CraneApp - Main Mobile Application Entry Point
 * Telegram Clone v1.0 - Production Ready (Railway Deploy)
 * Vanilla JS + Context API Pattern (React Native Style)
 */

import { AuthProvider } from './providers/authProvider.js';
import { ThemeProvider } from './providers/themeProvider.js';
import { SocketProvider } from './providers/socketProvider.js';
import { Navigation } from '../navigation.js';

class CraneApp {
  constructor() {
    this.root = document.createElement('div');
    this.root.id = 'craneapp-root';
    this.initProviders();
    this.initNavigation();
    this.initEventListeners();
  }

  initProviders() {
    // Wrap app with all providers (Context API pattern)
    this.providers = [
      new ThemeProvider(),
      new AuthProvider(),
      new SocketProvider()
    ];
  }

  initNavigation() {
    this.navigation = new Navigation();
    this.render();
  }

  initEventListeners() {
    // Global app events
    window.addEventListener('resize', () => this.handleResize());
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
    
    // PWA install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
    });
  }

  render() {
    document.body.innerHTML = '';
    document.body.appendChild(this.root);
    
    // Provider wrapper structure
    this.providers.forEach(provider => {
      provider.attach(this.root);
    });
    
    this.navigation.render(this.root);
  }

  handleResize() {
    const isMobile = window.innerWidth < 768;
    document.body.classList.toggle('mobile', isMobile);
    document.body.classList.toggle('desktop', !isMobile);
  }

  handleOnline() {
    console.log('CraneApp: Back online');
  }

  handleOffline() {
    console.log('CraneApp: Offline - Using cache');
  }

  async installPWA() {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      console.log(`PWA install: ${outcome}`);
    }
  }
}

// Global app instance + init
const app = new CraneApp();
window.craneApp = app;

// Export for screens/components
window.CraneApp = CraneApp;
