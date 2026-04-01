/**
 * CraneApp Form Validation
 * Phone/email/password/username rules
 */

export const validators = {
  // Phone number (+7 999 123-45-67)
  phone(value) {
    const phoneRegex = /^(\+7|8|7)[\s-]?\(?[0-9]{3}\)?[\s-]?[0-9]{3}[\s-]?[0-9]{2}[\s-]?[0-9]{2}$/;
    return phoneRegex.test(value.replace(/\D/g, ''));
  },

  // Email validation
  email(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  },

  // Username (@username 5-32 chars)
  username(value) {
    return /^@[a-zA-Z0-9_]{5,32}$/.test(value);
  },

  // Password (8+ chars, 1 uppercase, 1 number)
  password(value) {
    return /^(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/.test(value);
  },

  // Chat name (1-128 chars)
  chatName(value) {
    return value.trim().length >= 1 && value.length <= 128;
  },

  // File size (max 50MB)
  fileSize(file, maxBytes = 50 * 1024 * 1024) {
    return file.size <= maxBytes;
  },

  // Validate form fields
  validateForm(fields) {
    const errors = {};
    
    if (fields.phone && !this.phone(fields.phone)) {
      errors.phone = 'Invalid phone number';
    }
    
    if (fields.email && !this.email(fields.email)) {
      errors.email = 'Invalid email address';
    }
    
    if (fields.username && !this.username(fields.username)) {
      errors.username = 'Username must be 5-32 chars (letters, numbers, _)';
    }
    
    if (fields.password && !this.password(fields.password)) {
      errors.password = 'Password must be 8+ chars with uppercase & number';
    }
    
    if (fields.name && !this.chatName(fields.name)) {
      errors.name = 'Name must be 1-128 characters';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
};

window.validators = validators;
