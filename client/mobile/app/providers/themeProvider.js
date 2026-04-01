/**
 * CraneApp Theme Provider
 * Telegram Dark/Light/TelegramBlue themes (CSS Variables + localStorage)
 */

export class ThemeProvider {
  constructor() {
    this.currentTheme = 'telegram'; // telegram, dark, light
    this.init();
  }

  init() {
    // Load saved theme
    const savedTheme = localStorage.getItem('craneapp_theme') || 'telegram';
    this.setTheme(savedTheme);
    
    // Listen for theme changes
    window.addEventListener('theme:change', (e) => {
      this.setTheme(e.detail.theme);
    });
  }

  setTheme(theme) {
    this.currentTheme = theme;
    localStorage.setItem('craneapp_theme', theme);
    
    // Update CSS variables (Telegram pixel-perfect)
    document.documentElement.style.setProperty('--bg-primary', this.getThemeVar(theme, 'bg-primary'));
    document.documentElement.style.setProperty('--bg-secondary', this.getThemeVar(theme, 'bg-secondary'));
    document.documentElement.style.setProperty('--bg-message-in', this.getThemeVar(theme, 'bg-message-in'));
    document.documentElement.style.setProperty('--bg-message-out', this.getThemeVar(theme, 'bg-message-out'));
    document.documentElement.style.setProperty('--text-primary', this.getThemeVar(theme, 'text-primary'));
    document.documentElement.style.setProperty('--accent-primary', '#2AABEE'); // Telegram Blue
    document.documentElement.style.setProperty('--border-default', this.getThemeVar(theme, 'border-default'));
    
    // Body class
    document.body.className = `theme-${theme}`;
    
    // Emit change event
    window.dispatchEvent(new CustomEvent('theme:updated', { detail: { theme } }));
  }

  getThemeVar(theme, varName) {
    const themes = {
      telegram: {
        'bg-primary': '#0F0F10',
        'bg-secondary': '#1E1F22', 
        'bg-message-in': '#1C1D1F',
        'bg-message-out': '#2B5278',
        'text-primary': '#FFFFFF',
        'border-default': '#374049'
      },
      dark: {
        'bg-primary': '#000000',
        'bg-secondary': '#0F1419',
        'bg-message-in': '#131722',
        'bg-message-out': '#007AFF',
        'text-primary': '#EDEEF0',
        'border-default': '#2A2E35'
      },
      light: {
        'bg-primary': '#EFEFEF',
        'bg-secondary': '#F5F6F7',
        'bg-message-in': '#FFFFFF',
        'bg-message-out': '#2AABEE',
        'text-primary': '#000000',
        'border-default': '#E1E5E9'
      }
    };
    return themes[theme]?.[varName] || themes.telegram[varName];
  }

  toggleTheme() {
    const themes = ['telegram', 'dark', 'light'];
    const currentIndex = themes.indexOf(this.currentTheme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    this.setTheme(nextTheme);
  }

  attach(root) {
    window.ThemeProvider = this;
    
    // Inject base CSS variables
    const style = document.createElement('style');
    style.textContent = `
      :root {
        --spacing-xs: 4px;
        --spacing-sm: 8px;
        --spacing-md: 12px;
        --spacing-lg: 16px;
        --spacing-xl: 24px;
        --border-radius: 10px;
        --border-radius-lg: 16px;
        --font-size-sm: 12px;
        --font-size-base: 14px;
        --font-size-lg: 16px;
        --font-size-xl: 17px;
        transition: background-color 0.22s ease-out, color 0.22s ease-out;
      }
      * { box-sizing: border-box; }
      body { font-family: -apple-system, SF Pro, system-ui, sans-serif; margin: 0; }
      .mobile { max-width: 390px; margin: 0 auto; }
    `;
    document.head.appendChild(style);
  }
}
