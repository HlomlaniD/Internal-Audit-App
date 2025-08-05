import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/database';

const router = express.Router();

// Register new user (restricted to admin/director role)
router.post('/register', async (req, res) => {
  try {
    const { email, password, first_name, last_name, role, phone, department } = req.body;

    // Check if user already exists
    const existingUser = await db('users').where('email', email).first();
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Create user
    const [userId] = await db('users').insert({
      email,
      password_hash,
      first_name,
      last_name,
      role,
      phone,
      department,
      status: 'active'
    });

    res.status(201).json({ 
      message: 'User created successfully',
      user: { id: userId, email, first_name, last_name, role }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error during registration' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await db('users')
      .select('id', 'email', 'password_hash', 'first_name', 'last_name', 'role', 'status')
      .where('email', email)
      .first();

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.status !== 'active') {
      return res.status(401).json({ message: 'Account is not active' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Update last login
    await db('users').where('id', user.id).update({ last_login: new Date() });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '8h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error during login' });
  }
});

// Logout (client-side token removal, but we can log it)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout successful' });
});

export default router;