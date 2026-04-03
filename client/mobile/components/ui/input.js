export const INPUT_TYPES = {
  TEXT: 'text',
  PASSWORD: 'password',
  EMAIL: 'email',
  TEL: 'tel',
  NUMBER: 'number',
  SEARCH: 'search',
  TEXTAREA: 'textarea',
};

/**
 * Creates a styled input or textarea element
 * @param {Object} options
 * @returns {HTMLElement} wrapper div containing label + input + error
 */
export function createInput({
  type = INPUT_TYPES.TEXT,
  label = '',
  placeholder = '',
  value = '',
  name = '',
  id = '',
  required = false,
  disabled = false,
  maxLength = null,
  rows = 3,
  autoComplete = 'off',
  onChange = null,
  onInput = null,
  onEnter = null,
  onFocus = null,
  onBlur = null,
  error = '',
  helperText = '',
  icon = null,
  className = '',
}) {
  const wrapper = document.createElement('div');
  wrapper.className = `crane-input-wrapper ${className}`.trim();
  wrapper.style.cssText = `display:flex;flex-direction:column;gap:6px;width:100%;`;

  if (label) {
    const labelEl = document.createElement('label');
    labelEl.textContent = label + (required ? ' *' : '');
    labelEl.htmlFor = id || name;
    labelEl.style.cssText = `
      font-size:var(--font-size-sm);
      color:var(--color-text-secondary);
      font-weight:500;
    `;
    wrapper.appendChild(labelEl);
  }

  const inputWrapper = document.createElement('div');
  inputWrapper.style.cssText = `position:relative;display:flex;align-items:center;`;

  const input = type === INPUT_TYPES.TEXTAREA
    ? document.createElement('textarea')
    : document.createElement('input');

  if (type !== INPUT_TYPES.TEXTAREA) {
    input.type = type;
  } else {
    input.rows = rows;
    input.style.resize = 'none';
  }

  Object.assign(input, {
    id: id || name,
    name,
    placeholder,
    value,
    required,
    disabled,
    autocomplete: autoComplete,
  });

  if (maxLength) input.maxLength = maxLength;

  Object.assign(input.style, {
    width: '100%',
    padding: icon ? '12px 12px 12px 44px' : '12px 16px',
    background: 'var(--color-input-bg)',
    color: 'var(--color-text)',
    border: `1px solid ${error ? 'var(--color-danger)' : 'var(--color-border)'}`,
    borderRadius: 'var(--radius-md)',
    fontSize: 'var(--font-size-md)',
    outline: 'none',
    transition: 'border-color var(--transition), box-shadow var(--transition)',
    fontFamily: 'var(--font-family)',
    lineHeight: '1.5',
    boxSizing: 'border-box',
  });

  if (icon) {
    const iconEl = document.createElement('img');
    iconEl.src = icon;
    iconEl.style.cssText = `
      position:absolute;
      left:14px;
      width:18px;height:18px;
      pointer-events:none;
      opacity:0.6;
    `;
    inputWrapper.appendChild(iconEl);
  }

  input.addEventListener('focus', (e) => {
    input.style.borderColor = 'var(--color-primary)';
    input.style.boxShadow = '0 0 0 3px color-mix(in srgb, var(--color-primary) 20%, transparent)';
    onFocus?.(e);
  });

  input.addEventListener('blur', (e) => {
    input.style.borderColor = error ? 'var(--color-danger)' : 'var(--color-border)';
    input.style.boxShadow = 'none';
    onBlur?.(e);
  });

  if (onChange) input.addEventListener('change', onChange);
  if (onInput) input.addEventListener('input', onInput);

  if (onEnter) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        onEnter(e);
      }
    });
  }

  inputWrapper.appendChild(input);
  wrapper.appendChild(inputWrapper);

  if (error) {
    const errorEl = document.createElement('span');
    errorEl.textContent = error;
    errorEl.style.cssText = `font-size:var(--font-size-xs);color:var(--color-danger);`;
    wrapper.appendChild(errorEl);
  } else if (helperText) {
    const helper = document.createElement('span');
    helper.textContent = helperText;
    helper.style.cssText = `font-size:var(--font-size-xs);color:var(--color-text-secondary);`;
    wrapper.appendChild(helper);
  }

  wrapper.getInput = () => input;
  wrapper.getValue = () => input.value.trim();
  wrapper.setValue = (v) => { input.value = v; };
  wrapper.setError = (msg) => {
    input.style.borderColor = msg ? 'var(--color-danger)' : 'var(--color-border)';
    const existingErr = wrapper.querySelector('.crane-input-error');
    if (existingErr) existingErr.remove();
    if (msg) {
      const errEl = document.createElement('span');
      errEl.className = 'crane-input-error';
      errEl.textContent = msg;
      errEl.style.cssText = `font-size:var(--font-size-xs);color:var(--color-danger);`;
      wrapper.appendChild(errEl);
    }
  };
  wrapper.focus = () => input.focus();
  wrapper.clear = () => { input.value = ''; };

  return wrapper;
}

/**
 * Creates a search input with clear button
 */
export function createSearchInput({ placeholder = 'Search...', onSearch, onClear, className = '' }) {
  const wrapper = document.createElement('div');
  wrapper.className = `crane-search-input ${className}`.trim();
  wrapper.style.cssText = `
    display:flex;align-items:center;
    background:var(--color-input-bg);
    border:1px solid var(--color-border);
    border-radius:var(--radius-full);
    padding:0 12px;
    gap:8px;
    transition:border-color var(--transition);
  `;

  const searchIcon = document.createElement('span');
  searchIcon.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="var(--color-text-secondary)"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>`;

  const input = document.createElement('input');
  input.type = 'search';
  input.placeholder = placeholder;
  input.style.cssText = `
    flex:1;background:transparent;border:none;
    color:var(--color-text);font-size:var(--font-size-md);
    outline:none;padding:10px 0;
  `;

  if (onSearch) {
    input.addEventListener('input', (e) => onSearch(e.target.value));
  }

  wrapper.appendChild(searchIcon);
  wrapper.appendChild(input);

  wrapper.focus = () => input.focus();
  wrapper.getValue = () => input.value;
  wrapper.clear = () => { input.value = ''; onClear?.(); };

  return wrapper;
}
