/**
 * CraneApp UI Button Component
 * Telegram-style buttons (Primary/Secondary/Destructive)
 * Touch-friendly (48px height, ripple effect)
 */

export class Button {
  static create({ 
    variant = 'primary', 
    size = 'md', 
    icon = null, 
    label = 'Button',
    loading = false,
    disabled = false,
    onClick 
  } = {}) {
    const btn = document.createElement('button');
    btn.className = `btn btn--${variant} btn--${size}`;
    
    // States
    if (loading) btn.classList.add('loading');
    if (disabled) btn.classList.add('disabled');
    
    // Icon + Label
    btn.innerHTML = `
      ${icon ? `<span class="btn-icon">${icon}</span>` : ''}
      <span class="btn-label">${label}</span>
      <div class="ripple"></div>
    `;
    
    // Event handlers
    let rippleTimeout;
    btn.addEventListener('click', (e) => {
      if (disabled || loading) return;
      
      // Ripple effect (Telegram-style)
      const ripple = btn.querySelector('.ripple');
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      ripple.classList.remove('ripple--animate');
      ripple.offsetWidth; // Trigger reflow
      ripple.classList.add('ripple--animate');
      
      rippleTimeout = setTimeout(() => ripple.classList.remove('ripple--animate'), 600);
      
      onClick?.(e);
    });
    
    // Keyboard accessibility
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
    
    return btn;
  }
}

// Auto-register global factory
window.CraneButton = Button.create;
