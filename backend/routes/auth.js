import express from 'express';
import bcrypt from 'bcrypt';
import { User } from '../models/index.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  let { username, email, password, adminCode } = req.body;
  
  // Trimming
  username = username?.trim();
  email = email?.trim();
  
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email address' });
  }

  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    const role = adminCode === '261123' ? 'admin' : 'user';
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ username, email, password: hashedPassword, role });
    await user.save();

    res.status(201).json({
      user: {
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/login', async (req, res) => {
  let { identifier, password } = req.body;
  identifier = identifier?.trim();

  if (!identifier || !password) {
    return res.status(400).json({ message: 'Username/Email and password are required' });
  }

  try {
    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }]
    });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({
      user: {
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

import nodemailer from 'nodemailer';

// Configure Nodemailer Transporter lazily so dotenv can load first
let transporter;
const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
};

// Generate a random 6-digit code
const generateResetCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

router.post('/forgot-password', async (req, res) => {
  try {
    let { email } = req.body;
    email = email?.trim();
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User with this email does not exist' });
    }

    const resetCode = generateResetCode();
    user.resetPasswordCode = resetCode;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send email using Nodemailer
    const mailOptions = {
      from: `"IELTS Prep" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'IELTS Prep - Password Reset Code',
      text: `Hello ${user.username},\n\nYour password reset code is: ${resetCode}\n\nThis code will expire in 1 hour.\n\nThank you,\nIELTS Prep Team`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Password Reset Request</h2>
          <p>Hello <strong>${user.username}</strong>,</p>
          <p>We received a request to reset your password for your IELTS Prep account. Your reset code is:</p>
          <h1 style="color: #4F46E5; letter-spacing: 2px;">${resetCode}</h1>
          <p>This code will expire in 1 hour.</p>
          <p>If you didn't request this, you can safely ignore this email.</p>
          <br/>
          <p>Thank you,<br/><strong>IELTS Prep Team</strong></p>
        </div>
      `
    };

    await getTransporter().sendMail(mailOptions);

    res.json({ 
      message: 'Password reset code sent to your email successfully.',
      mockEmailContent: `Your password reset code is: ${resetCode}` // Kept for UI demonstration
    });
  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    let { email, code, newPassword } = req.body;
    email = email?.trim();
    code = code?.trim();

    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const user = await User.findOne({
      email,
      resetPasswordCode: code,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset code' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
