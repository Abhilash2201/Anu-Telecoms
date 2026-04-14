import { randomUUID } from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../db.js';

function requireJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return secret;
}

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt
  };
}

function signToken(user) {
  return jwt.sign({ email: user.email, role: user.role }, requireJwtSecret(), {
    subject: user.id,
    expiresIn: '7d'
  });
}

export async function registerController(req, res) {
  const { name, email, password } = req.body;
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const trimmedName = String(name || '').trim();

  if (!normalizedEmail || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  if (String(password).length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters long' });
  }

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return res.status(409).json({ message: 'User already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      name: trimmedName || 'Customer',
      email: normalizedEmail,
      password: passwordHash,
      role: 'USER'
    }
  });

  const token = signToken(user);

  return res.status(201).json({
    message: 'Registered',
    token,
    user: sanitizeUser(user)
  });
}

export async function loginController(req, res) {
  const { email, password } = req.body;
  const normalizedEmail = String(email || '').trim().toLowerCase();

  if (!normalizedEmail || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = signToken(user);
  return res.json({ token, user: sanitizeUser(user) });
}

export async function meController(req, res) {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  return res.json({ user: sanitizeUser(user) });
}

export async function getProfileController(req, res) {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: {
      Address: true
    }
  });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  return res.json({
    user: {
      ...sanitizeUser(user),
      addresses: user.Address
    }
  });
}

export async function updateProfileController(req, res) {
  const { name } = req.body;
  const updates = {};

  if (name !== undefined) {
    const trimmedName = String(name).trim();
    if (!trimmedName) {
      return res.status(400).json({ message: 'Name cannot be empty' });
    }
    updates.name = trimmedName;
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: 'No profile fields provided' });
  }

  const updatedUser = await prisma.user.update({
    where: { id: req.user.id },
    data: updates
  });

  return res.json({ user: sanitizeUser(updatedUser) });
}

export async function getAddressesController(req, res) {
  const addresses = await prisma.address.findMany({
    where: { userId: req.user.id }
  });

  return res.json({ addresses });
}

export async function createAddressController(req, res) {
  const { street, city, state, pincode } = req.body;
  if (!street || !city || !state || !pincode) {
    return res.status(400).json({ message: 'street, city, state, and pincode are required' });
  }

  const address = await prisma.address.create({
    data: {
      id: randomUUID(),
      userId: req.user.id,
      street: String(street).trim(),
      city: String(city).trim(),
      state: String(state).trim(),
      pincode: String(pincode).trim()
    }
  });

  return res.status(201).json({ address });
}

export async function updateAddressController(req, res) {
  const { id } = req.params;
  const { street, city, state, pincode } = req.body;

  const existing = await prisma.address.findUnique({
    where: { id }
  });

  if (!existing || existing.userId !== req.user.id) {
    return res.status(404).json({ message: 'Address not found' });
  }

  const data = {};
  if (street !== undefined) data.street = String(street).trim();
  if (city !== undefined) data.city = String(city).trim();
  if (state !== undefined) data.state = String(state).trim();
  if (pincode !== undefined) data.pincode = String(pincode).trim();

  if (Object.keys(data).length === 0) {
    return res.status(400).json({ message: 'No address fields provided' });
  }

  const address = await prisma.address.update({
    where: { id },
    data
  });

  return res.json({ address });
}

export async function deleteAddressController(req, res) {
  const { id } = req.params;

  const existing = await prisma.address.findUnique({
    where: { id }
  });

  if (!existing || existing.userId !== req.user.id) {
    return res.status(404).json({ message: 'Address not found' });
  }

  await prisma.address.delete({
    where: { id }
  });

  return res.json({ message: 'Address deleted' });
}
