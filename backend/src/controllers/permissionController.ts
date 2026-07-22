import { Request, Response } from 'express';
import prisma from '../prismaClient';

const DEFAULT_PERMISSIONS = {
  INSPECTOR: ['VIEW_DASHBOARD', 'VIEW_HISTORY', 'VIEW_SEARCH'],
  MANAGER: ['VIEW_DASHBOARD', 'VIEW_HISTORY', 'VIEW_SEARCH', 'VIEW_REPORTS', 'VIEW_ANALYTICS'],
  ADMIN: ['VIEW_DASHBOARD', 'VIEW_HISTORY', 'VIEW_SEARCH', 'VIEW_REPORTS', 'VIEW_ANALYTICS', 'MANAGE_LINES'],
  SUPER_ADMIN: ['VIEW_DASHBOARD', 'VIEW_HISTORY', 'VIEW_SEARCH', 'VIEW_REPORTS', 'VIEW_ANALYTICS', 'MANAGE_LINES', 'MANAGE_USERS', 'VIEW_LOGS']
};

export const getPermissions = async (req: Request, res: Response) => {
  try {
    let permissions = await prisma.rolePermission.findMany();
    
    // Seed defaults if missing
    if (permissions.length === 0) {
      const data = Object.entries(DEFAULT_PERMISSIONS).map(([role, perms]) => ({
        role: role as import('@prisma/client').Role,
        permissions: perms
      }));
      await prisma.rolePermission.createMany({ data });
      permissions = await prisma.rolePermission.findMany();
    }
    
    res.json(permissions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch permissions' });
  }
};

export const updatePermission = async (req: Request, res: Response) => {
  try {
    const { role } = req.params;
    const { permissions } = req.body;
    
    const result = await prisma.rolePermission.upsert({
      // @ts-ignore
      where: { role },
      // @ts-ignore
      update: { permissions },
      // @ts-ignore
      create: { role, permissions }
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update permissions' });
  }
};
