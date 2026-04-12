import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { demoUsers } from '../data/storeData.js';

const users = [...demoUsers];

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'dev-secret', {
    expiresIn: '7d'
  });
}

export async function registerController(req, res) {
  const { name, email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

  const existing = users.find((user) => user.email === email);
  if (existing) return res.status(400).json({ message: 'User already exists' });

  const user = {
    id: `user-${Date.now()}`,
    name: name || 'Customer',
    email,
    passwordHash: hashPassword(password),
    role: 'customer'
  };
  users.push(user);

  res.status(201).json({ message: 'Registered', user: { id: user.id, email: user.email, role: user.role } });
}

export async function loginController(req, res) {
  const { email, password } = req.body;
  const user = users.find((item) => item.email === email);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const isPasswordValid =
    user.email === 'admin@anutelecom.local' ? password === 'admin123' : user.passwordHash === hashPassword(password);

  if (!isPasswordValid) return res.status(401).json({ message: 'Invalid credentials' });

  const token = signToken(user);
  res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
}

export async function meController(req, res) {
  const user = users.find((item) => item.id === req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({ user: { id: user.id, email: user.email, role: user.role, name: user.name } });
}
