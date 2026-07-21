import { Request, Response } from 'express';
import prisma from '../prismaClient';

export const searchInspections = async (req: Request, res: Response) => {
  try {
    const { barcode, lineId, status, startDate, endDate, machineType } = req.query;

    const whereClause: any = {};

    if (barcode) {
      whereClause.barcode = { contains: String(barcode), mode: 'insensitive' };
    }
    
    if (status) {
      if (status === 'PASS') {
        whereClause.status = { in: ['PASS', 'GOOD'] };
      } else if (status === 'FAIL') {
        whereClause.status = { in: ['FAIL', 'NG'] };
      } else {
        whereClause.status = String(status);
      }
    }

    if (machineType) {
      whereClause.machine = { type: String(machineType) };
    }

    if (lineId) {
      whereClause.machine = { ...whereClause.machine, lineId: String(lineId) };
    }

    if (startDate || endDate) {
      whereClause.inspectionTime = {};
      if (startDate) whereClause.inspectionTime.gte = new Date(String(startDate));
      if (endDate) {
        const end = new Date(String(endDate));
        end.setHours(23, 59, 59, 999);
        whereClause.inspectionTime.lte = end;
      }
    }

    const inspections = await prisma.inspection.findMany({
      where: whereClause,
      include: {
        machine: {
          include: { line: true }
        },
        productModel: true,
        defects: true
      },
      orderBy: { inspectionTime: 'desc' },
      take: 200 // Limit results for performance
    });

    res.json(inspections);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search inspections' });
  }
};
