import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../prismaClient';

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, username: true, name: true, role: true, isActive: true, createdAt: true, updatedAt: true }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { username, password, name, role, performerUsername } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, password: hashedPassword, name, role }
    });
    
    // Log activity
    await prisma.activityLog.create({
      data: {
        username: performerUsername || 'System',
        action: 'User Created',
        details: `User ${username} was created with role ${role}`,
        ipAddress: req.ip
      }
    });

    // @ts-ignore
    delete user.password;
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, role, isActive, password, performerUsername } = req.body;
    
    let updateData: any = { name, role, isActive };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    
    const user = await prisma.user.update({
      where: { id },
      data: updateData
    });
    
    // Log activity
    await prisma.activityLog.create({
      data: {
        username: performerUsername || 'System',
        action: 'User Updated',
        details: `User ${user.username} was updated`,
        ipAddress: req.ip
      }
    });

    // @ts-ignore
    delete user.password;
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { performerUsername } = req.body;
    const user = await prisma.user.delete({ where: { id } });
    
    // Log activity
    await prisma.activityLog.create({
      data: {
        username: performerUsername || 'System',
        action: 'User Deleted',
        details: `User ${user.username} was deleted`,
        ipAddress: req.ip
      }
    });

    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
};
