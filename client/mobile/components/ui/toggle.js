/**
 * CraneApp UI Toggle Switch
 * Telegram-style iOS toggle (animated track/thumb)
 */

export class Toggle {
  static create({ 
    checked = false, 
    disabled = false,
    onChange 
  } = {}) {
    const toggle = document.createElement('label');
    toggle.className = 'toggle-container';
    
    toggle.innerHTML = `
      <input type="checkbox" ${checked ? 'checked' : ''} ${disabled ? 'disabled' : ''} class="toggle-input" />
      <div class="toggle-track">
        <div class="toggle-thumb"></div>
      </div>
    `;
    
    const input = toggle.querySelector('.toggle-input');
    
    input.addEventListener('change', () => {
      if (!disabled) {
        onChange?.(input.checked);
      }
    });
    
    // Keyboard accessibility
    toggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        input.checked = !input.checked;
        input.dispatchEvent(new Event('change'));
      }
    });
    
    return toggle;
  }
}

window.CraneToggle = Toggle.create;
