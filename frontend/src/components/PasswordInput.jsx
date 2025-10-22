import React, { useState } from 'react';
import { Lock, Check, X } from 'lucide-react';

const PasswordInput = ({ 
  value, 
  onChange, 
  placeholder = "Create a password", 
  disabled = false,
  showValidation = true,
  className = ""
}) => {
  const [showRequirements, setShowRequirements] = useState(false);

  // Password validation rules
  const validatePassword = (password) => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\?]/.test(password)
    };
  };

  const validation = validatePassword(value);
  const isValid = Object.values(validation).every(Boolean);

  const requirements = [
    { key: 'length', text: 'At least 8 characters', valid: validation.length },
    { key: 'uppercase', text: 'One uppercase letter (A-Z)', valid: validation.uppercase },
    { key: 'lowercase', text: 'One lowercase letter (a-z)', valid: validation.lowercase },
    { key: 'number', text: 'One number (0-9)', valid: validation.number },
    { key: 'special', text: 'One special character (!@#$%^&*)', valid: validation.special }
  ];

  return (
    <div className="space-y-2">
      <div className="relative">
        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
        <input
          type="password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setShowRequirements(true)}
          onBlur={() => setShowRequirements(false)}
          placeholder={placeholder}
          required
          disabled={disabled}
          className={`w-full pl-12 pr-4 py-3.5 bg-white/5 border ${
            showValidation && value && !isValid 
              ? 'border-red-500/50 focus:border-red-500' 
              : 'border-white/10 focus:border-white'
          } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:bg-white/10 transition-all duration-300 disabled:opacity-50 ${className}`}
        />

      </div>

      {/* Password requirements */}
      {showValidation && (showRequirements || value) && (
        <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-white/10 p-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Password Requirements:</h4>
          <div className="space-y-2">
            {requirements.map((req) => (
              <div key={req.key} className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  req.valid ? 'bg-green-500' : 'bg-red-500/30 border border-red-500/50'
                }`}>
                  {req.valid ? (
                    <Check className="w-3 h-3 text-white" />
                  ) : (
                    <X className="w-3 h-3 text-red-400" />
                  )}
                </div>
                <span className={`text-sm ${
                  req.valid ? 'text-green-400' : 'text-gray-400'
                }`}>
                  {req.text}
                </span>
              </div>
            ))}
          </div>
          
          {/* Overall strength bar */}
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-400">Password Strength</span>
              <span className={`text-xs font-medium ${
                isValid ? 'text-green-400' : 
                Object.values(validation).filter(Boolean).length >= 3 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {isValid ? 'Strong' : 
                 Object.values(validation).filter(Boolean).length >= 3 ? 'Medium' : 'Weak'}
              </span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  isValid ? 'bg-green-500' : 
                  Object.values(validation).filter(Boolean).length >= 3 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ 
                  width: `${(Object.values(validation).filter(Boolean).length / 5) * 100}%` 
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordInput;