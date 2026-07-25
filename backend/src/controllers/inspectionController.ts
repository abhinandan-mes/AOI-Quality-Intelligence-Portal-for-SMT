import { Request, Response } from 'express';
import prisma from '../prismaClient';

export const searchInspections = async (req: Request, res: Response) => {
  try {
    const { barcode, lineName, machineName, status, startDate, endDate, machineType, side, defectLocation } = req.query;

    const whereClause: any = {};

    if (barcode) {
      whereClause.barcode = { contains: String(barcode), mode: 'insensitive' };
    }
    
    if (status) {
      whereClause.status = String(status);
    }

    if (machineType) {
      const types = String(machineType).split(',');
      if (types.length === 1) {
        whereClause.machine = { ...whereClause.machine, type: types[0] };
      } else {
        whereClause.machine = { ...whereClause.machine, type: { in: types } };
      }
    }

    if (lineName) {
      whereClause.machine = { ...whereClause.machine, line: { name: { contains: String(lineName), mode: 'insensitive' } } };
    }

    if (machineName) {
      whereClause.machine = { ...whereClause.machine, name: { contains: String(machineName), mode: 'insensitive' } };
    }

    if (side) {
      whereClause.side = String(side);
    }

    if (defectLocation) {
      whereClause.defects = {
        some: {
          componentName: { contains: String(defectLocation), mode: 'insensitive' }
        }
      };
    }

    if (startDate || endDate) {
      whereClause.inspectionTime = {};
      if (startDate) whereClause.inspectionTime.gte = new Date(String(startDate));
      if (endDate) {
        const end = new Date(String(endDate));
        if (!String(endDate).includes('T')) {
          end.setHours(23, 59, 59, 999);
        }
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
