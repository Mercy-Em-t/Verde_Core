import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './db.js';

export const authRouter = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev';

export const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await db\SELECT id, email, name, role FROM users WHERE id = \ AND active = true\;
    if (user.length === 0) {
      return res.status(401).json({ error: 'Unauthorized: Invalid user' });
    }
    req.user = user[0];
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  next();
};

export const requireConsultantOrAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'consultant')) {
    return res.status(403).json({ error: 'Forbidden: Consultant access required' });
  }
  next();
};

authRouter.post('/register', async (req, res) => {
  const { email, password, name, role } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const assignedRole = role && ['admin', 'consultant', 'viewer'].includes(role) ? role : 'client';

  try {
    const existing = await db\SELECT id FROM users WHERE email = \\;
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await db\
      INSERT INTO users (email, password_hash, name, role)
      VALUES (\, \, \, \)
      RETURNING id, email, name, role
    \;

    const token = jwt.sign({ id: newUser[0].id, role: newUser[0].role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: newUser[0] });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing email or password' });
  }

  try {
    const users = await db\SELECT id, email, password_hash, name, role FROM users WHERE email = \ AND active = true\;
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

authRouter.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});
