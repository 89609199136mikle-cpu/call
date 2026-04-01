/**
 * CraneApp UI Input Component
 * Telegram-style search/message input (48px, clear button, focus states)
 */

export class Input {
  static create({ 
    type = 'text',
    placeholder = '',
    value = '',
    maxLength = 1000,
    clearable = true,
    disabled = false,
    onChange,
    onClear 
  } = {}) {
    const input = document.createElement('div');
    input.className = 'input-container';
    
    input.innerHTML = `
      <input 
        type="${type}" 
        placeholder="${placeholder}"
        value="${value}"
        maxlength="${maxLength}"
        ${disabled ? 'disabled' : ''}
        class="input-field"
      />
      ${clearable ? '<button class="input-clear" style="display: none;">✕</button>' : ''}
    `;
    
    const field = input.querySelector('.input-field');
    const clearBtn = input.querySelector('.input-clear');
    
    // Sync value
    field.value = value;
    
    // Events
    field.addEventListener('input', () => {
      const val = field.value;
      clearBtn.style.display = val ? 'flex' : 'none';
      onChange?.(val);
    });
    
    clearBtn?.addEventListener('click', () => {
      field.value = '';
      field.focus();
      clearBtn.style.display = 'none';
      onClear?.();
    });
    
    // Focus states (Telegram blue border)
    field.addEventListener('focus', () => input.classList.add('focused'));
    field.addEventListener('blur', () => input.classList.remove('focused'));
    
    // Auto-resize textarea
    if (type === 'textarea') {
      field.addEventListener('input', () => {
        field.style.height = 'auto';
        field.style.height = Math.min(field.scrollHeight, 120) + 'px';
      });
    }
    
    return input;
  }
}

window.CraneInput = Input.create;
