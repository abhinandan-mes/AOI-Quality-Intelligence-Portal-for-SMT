import { Request, Response } from 'express';
import prisma from '../prismaClient';

export const getActivityLogs = async (req: Request, res: Response) => {
  try {
    const logs = await prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 1000 // Limit to 1000 for performance
    });
    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch activity logs' });
  }
};
