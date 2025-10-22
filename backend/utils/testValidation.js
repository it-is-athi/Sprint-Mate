// Test the password validation utility
const { validatePassword } = require('./validation');

// Test cases
const testPasswords = [
  'weak',                          // Too short, missing requirements
  'Password1',                     // Missing special character  
  'password1!',                    // Missing uppercase
  'PASSWORD1!',                    // Missing lowercase
  'Password!',                     // Missing number
  'Password123',                   // Missing special character
  'Password1!',                    // Valid password
  'MyStr0ng!Pass',                 // Valid password
  'C0mpl3x@Password',              // Valid password
  'SimplePass123!',                // Valid password
];

console.log('Password Validation Tests:');
console.log('========================');

testPasswords.forEach((password, index) => {
  const result = validatePassword(password);
  console.log(`\n${index + 1}. Password: "${password}"`);
  console.log(`   Valid: ${result.isValid ? '✓' : '✗'}`);
  if (!result.isValid) {
    console.log(`   Errors: ${result.errors.join(', ')}`);
  }
});

module.exports = { validatePassword };