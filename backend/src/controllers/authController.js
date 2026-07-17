import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { sendPasswordResetEmail, sendVerificationEmail } from '../utils/email.js';

// Frontend origin for verification/reset links (not the backend CORS list).
const frontendUrl = () => process.env.NEXT_PUBLIC_SITE_URL || (process.env.FRONTEND_URL || 'http://localhost:3000').split(',')[0];

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const user = await User.create({
      name,
      email,
      password,
      isEmailVerified: false,
      emailVerificationToken: crypto.createHash('sha256').update(verificationToken).digest('hex'),
      emailVerificationExpires: Date.now() + 24 * 3600000, // 24 hours
    });

    const verificationUrl = `${frontendUrl()}/verify-email?token=${verificationToken}`;

    try {
      await sendVerificationEmail(email, verificationUrl);
    } catch (emailError) {
      console.error('Verification email failed to send:', emailError.message);
    }

    const token = generateToken(user._id);

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
      },
      token,
      message: 'Registration successful. Please check your email to verify your account.',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    // Block only explicitly-unverified accounts. Seeded/legacy users without
    // the flag are treated as verified (see User model hashPassword hook).
    if (user.isEmailVerified === false) {
      return res.status(403).json({
        message: 'Please verify your email address before signing in.',
        needsVerification: true,
        email: user.email,
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify a social provider token and return { email, name, socialId, picture }.
// Supported: google (id_token), facebook (access_token).
const verifySocialToken = async (provider, token) => {
  if (provider === 'google') {
    const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
    if (!res.ok) throw new Error('Invalid Google token');
    const data = await res.json();
    if (data.aud !== process.env.GOOGLE_CLIENT_ID) throw new Error('Google token audience mismatch');
    return { email: data.email, name: data.name, socialId: data.sub, picture: data.picture };
  }
  if (provider === 'facebook') {
    const res = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email&access_token=${token}`
    );
    if (!res.ok) throw new Error('Invalid Facebook token');
    const data = await res.json();
    if (!data.id) throw new Error('Invalid Facebook token');
    return { email: data.email, name: data.name, socialId: data.id, picture: null };
  }
  throw new Error('Unsupported provider');
};

export const socialLogin = async (req, res) => {
  try {
    const { provider, token } = req.body;
    if (!['google', 'facebook'].includes(provider) || !token) {
      return res.status(400).json({ message: 'Provider and token are required' });
    }

    const profile = await verifySocialToken(provider, token);
    if (!profile.email) {
      return res.status(400).json({ message: 'Email not provided by provider' });
    }

    let user = await User.findOne({ email: profile.email });
    if (!user) {
      user = await User.create({
        name: profile.name || profile.email.split('@')[0],
        email: profile.email,
        password: crypto.randomBytes(16).toString('hex'),
        avatar: profile.picture || '',
        authProvider: provider,
        socialId: profile.socialId,
        isEmailVerified: true,
      });
    } else if (!user.authProvider) {
      // Link provider to existing email account.
      user.authProvider = provider;
      user.socialId = profile.socialId;
      if (profile.picture && !user.avatar) user.avatar = profile.picture;
      user.isEmailVerified = true;
      await user.save({ validateBeforeSave: false });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    const jwtToken = generateToken(user._id);
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone || '',
        isEmailVerified: user.isEmailVerified,
      },
      token: jwtToken,
    });
  } catch (error) {
    res.status(401).json({ message: error.message || 'Social login failed' });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, avatar },
      { new: true, runValidators: true }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Please provide your email' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${frontendUrl()}/reset-password?token=${resetToken}`;

    try {
      await sendPasswordResetEmail(email, resetUrl);
      res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
    } catch (emailError) {
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ message: 'Failed to send reset email. Please try again.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Reset token is invalid or has expired' });
    }

    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    const jwtToken = generateToken(user._id);

    res.json({
      message: 'Password reset successful',
      token: jwtToken,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const token = req.query.token || req.body.token;
    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Verification token is invalid or has expired' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    res.json({ message: 'Email verified successfully. You can now sign in.', verified: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Please provide your email' });
    }

    // Always return the same message to avoid leaking which emails exist.
    const safeMessage = 'If an account exists for this email and is unverified, a verification link has been sent.';

    const user = await User.findOne({ email });
    if (!user || user.isEmailVerified) {
      return res.json({ message: safeMessage });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    user.emailVerificationExpires = Date.now() + 24 * 3600000;
    await user.save({ validateBeforeSave: false });

    const verificationUrl = `${frontendUrl()}/verify-email?token=${verificationToken}`;

    try {
      await sendVerificationEmail(email, verificationUrl);
    } catch (emailError) {
      console.error('Verification email failed to send:', emailError.message);
    }

    res.json({ message: safeMessage });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
