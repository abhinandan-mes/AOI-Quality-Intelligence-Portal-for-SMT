import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../prismaClient';

export const login = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ message: 'Username and password are required' });
    return;
  }

  try {
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';

    // For development, allow fallback superadmin login
    if (username === 'abhinandan' && password === '95003989') {
      const token = jwt.sign(
        { id: '1', username: 'abhinandan', role: 'SUPER_ADMIN' },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '8h' }
      );
      res.json({ token, user: { username: 'abhinandan', role: 'SUPER_ADMIN' } });
      await prisma.activityLog.create({
        data: { username: 'abhinandan', action: 'LOGIN', ipAddress, details: 'Fallback superadmin login' }
      });
      return;
    }

    const user = await prisma.user.findUnique({ where: { username } });

    if (!user) {
      await prisma.activityLog.create({
        data: { username, action: 'FAILED_LOGIN', ipAddress, details: 'User not found' }
      });
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      await prisma.activityLog.create({
        data: { username, action: 'FAILED_LOGIN', ipAddress, details: 'Incorrect password' }
      });
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    if (!user.isActive) {
      await prisma.activityLog.create({
        data: { username, action: 'FAILED_LOGIN', ipAddress, details: 'Account deactivated' }
      });
      res.status(403).json({ message: 'Account is deactivated' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      }
    });

    await prisma.activityLog.create({
      data: { userId: user.id, username: user.username, action: 'LOGIN', ipAddress, details: 'Successful login' }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
