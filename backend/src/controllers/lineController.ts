import { Request, Response } from 'express';
import prisma from '../prismaClient';
import { reloadWatchers } from '../services/fileWatcher';

export const getLines = async (req: Request, res: Response) => {
  try {
    const lines = await prisma.line.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(lines);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch lines' });
  }
};

export const createLine = async (req: Request, res: Response) => {
  try {
    const { name, description, isInstalled, postAoiWatchPath, spiWatchPath } = req.body;
    const line = await prisma.line.create({
      data: { name, description, isInstalled, postAoiWatchPath, spiWatchPath }
    });
    reloadWatchers(); // Restart watchers to pick up new path if any
    res.status(201).json(line);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create line' });
  }
};

export const updateLine = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { name, description, isInstalled, postAoiWatchPath, spiWatchPath } = req.body;
    
    const line = await prisma.line.update({
      where: { id },
      data: { name, description, isInstalled, postAoiWatchPath, spiWatchPath }
    });
    reloadWatchers(); // Restart watchers to reflect path or status changes
    res.json(line);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update line' });
  }
};

export const deleteLine = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.line.delete({ where: { id } });
    reloadWatchers();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete line' });
  }
};
