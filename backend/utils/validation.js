// Password validation utility
const validatePassword = (password) => {
  const errors = [];
  
  // Check minimum length (8 characters)
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  // Check for uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  // Check for lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  // Check for number
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  // Check for special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\?]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Email validation utility
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Name validation utility
const validateName = (name) => {
  if (!name || name.trim().length < 2) {
    return {
      isValid: false,
      error: 'Name must be at least 2 characters long'
    };
  }
  
  if (name.trim().length > 50) {
    return {
      isValid: false,
      error: 'Name must be less than 50 characters long'
    };
  }
  
  // Check for valid characters (letters, spaces, hyphens, apostrophes)
  if (!/^[a-zA-Z\s\-']+$/.test(name.trim())) {
    return {
      isValid: false,
      error: 'Name can only contain letters, spaces, hyphens, and apostrophes'
    };
  }
  
  return {
    isValid: true,
    error: null
  };
};

module.exports = {
  validatePassword,
  validateEmail,
  validateName
};