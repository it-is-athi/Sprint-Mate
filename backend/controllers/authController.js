// backend/controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const { validatePassword, validateEmail, validateName } = require('../utils/validation');

// Verify OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    if (user.isVerified) {
      return res.status(400).json({ message: 'User already verified.' });
    }
    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP.' });
    }

    user.isVerified = true;
    user.otp = '';
    await user.save();

    res.status(200).json({ message: 'OTP verified. User is now verified.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Register a new user
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    // Validate name
    const nameValidation = validateName(name);
    if (!nameValidation.isValid) {
      return res.status(400).json({ message: nameValidation.error });
    }

    // Validate email
    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ 
        message: 'Password does not meet requirements.',
        errors: passwordValidation.errors
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP (6 digit)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      otp,
      isVerified: false
    });
    await user.save();

    // Send OTP email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP for SprintMate Registration',
      text: `Your OTP is: ${otp}`
    };
    await transporter.sendMail(mailOptions);

    res.status(201).json({ message: 'User registered. Please check your email for the OTP.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    if (!user.isVerified) {
      // Generate new OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.otp = otp;
      await user.save();

      // Send OTP email
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your OTP for SprintMate Login',
        text: `Your OTP is: ${otp}`
      };
      await transporter.sendMail(mailOptions);

      return res.status(403).json({ message: 'User not verified. OTP sent to email.' });
    }

    // If verified, allow login (set JWT and refresh token in cookies)
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    const refreshToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );

    // Set tokens in HTTP-only cookies
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 1000 // 1 hour
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json({
      message: 'Login successful. User is verified.'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Logout user by clearing cookies
exports.logout = async (req, res) => {
  res.clearCookie('token');
  res.clearCookie('refreshToken');
  res.status(200).json({ message: 'Logged out successfully.' });
};

// Get current user info
exports.getMe = async (req, res) => {
  try {
    // req.user is set by the protect middleware (from the JWT payload)
    const user = await User.findById(req.user.id).select('-password -otp');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    await user.save();

    // Send OTP email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP for SprintMate Password Reset',
      text: `Your OTP for password reset is: ${otp}`
    };
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'OTP sent to your email for password reset.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, OTP, and new password are required.' });
    }

    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ 
        message: 'New password does not meet requirements.',
        errors: passwordValidation.errors
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP.' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = ''; // Clear OTP after use
    await user.save();

    res.status(200).json({ message: 'Password reset successful. You can now log in with your new password.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Refresh token endpoint
exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ message: 'No refresh token provided.' });
  }
  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    // Issue new access token
    const token = jwt.sign(
      { id: decoded.id, email: decoded.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Invalid or expired refresh token.' });
  }
};

// Get current user profile
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phoneNumber, gender } = req.body;
    
    // Validate input
    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Name is required' });
    }
    
    // Validate gender if provided
    if (gender && !['Male', 'Female', 'Other', 'Prefer not to say'].includes(gender)) {
      return res.status(400).json({ message: 'Invalid gender value' });
    }
    
    // Validate phone number if provided (basic validation)
    if (phoneNumber && phoneNumber.trim() !== '' && !/^[\+]?[1-9][\d]{0,15}$/.test(phoneNumber.trim())) {
      return res.status(400).json({ message: 'Invalid phone number format' });
    }
    
    // Prepare update object
    const updateData = { name: name.trim() };
    
    // Add optional fields if provided
    if (phoneNumber !== undefined) {
      updateData.phoneNumber = phoneNumber.trim() || null;
    }
    if (gender !== undefined) {
      updateData.gender = gender || null;
    }
    
    // Update user profile
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};