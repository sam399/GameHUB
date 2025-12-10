const User = require('../models/User');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists'
      });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password, twoFactorToken } = req.body;

    // Check if user exists and password is correct
    const user = await User.findOne({ email }).select('+password +twoFactorSecret');
    
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // === 2FA LOGIC ===
    if (user.twoFactorEnabled) {
      // If no token provided yet, tell frontend to ask for it
      if (!twoFactorToken) {
        return res.status(200).json({
          success: false,
          requires2FA: true,
          message: 'Please enter your 2FA code'
        });
      }

      // If token provided, verify it
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: twoFactorToken
      });

      if (!verified) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid 2FA Code' 
        });
      }
    }
    // =================

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          profile: user.profile,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Generate 2FA Secret & QR Code
// @route   POST /api/auth/2fa/generate
exports.generate2FA = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    // 1. Generate a temporary secret
    const secret = speakeasy.generateSecret({
      name: `GameVerse (${user.email})` // Appears in Authenticator App
    });

    // 2. Save secret temporarily to user (or just return it to verify first)
    // Ideally, don't enable it yet. Just save the secret.
    user.twoFactorSecret = secret.base32;
    await user.save();

    // 3. Generate QR Code Image URL
    QRCode.toDataURL(secret.otpauth_url, (err, data_url) => {
      if (err) throw err;
      
      res.status(200).json({
        success: true,
        secret: secret.base32, // For manual entry
        qrCode: data_url // Image string
      });
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify 2FA Token & Enable It
// @route   POST /api/auth/2fa/verify
exports.verify2FA = async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.userId).select('+twoFactorSecret');

    // 1. Verify the token against the secret
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token // The 6-digit code user entered
    });

    if (verified) {
      user.twoFactorEnabled = true;
      await user.save();
      res.status(200).json({ success: true, message: '2FA Enabled Successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid Code' });
    }

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.loginUser = async (req, res) => {
  try {
    const { email, password, twoFactorToken } = req.body; // Add token to input

    // ... (Existing logic to find user and check password) ...
    const user = await User.findOne({ email }).select('+password +twoFactorSecret');
    
    // ... (Password check) ...

    // === NEW 2FA LOGIC ===
    if (user.twoFactorEnabled) {
      // 1. If no token provided yet, tell frontend to ask for it
      if (!twoFactorToken) {
        return res.status(200).json({
          success: false,
          requires2FA: true,
          message: 'Please enter your 2FA code'
        });
      }

      // 2. If token provided, verify it
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: twoFactorToken
      });

      if (!verified) {
        return res.status(401).json({ success: false, message: 'Invalid 2FA Code' });
      }
    }
    // =====================

    // If we get here, either 2FA is off, or it was verified successfully
    sendTokenResponse(user, 200, res); // Your existing JWT function

  } catch (error) {
    // ...
  }
};