import { Request, Response } from 'express';
import prisma from '../prismaClient';

export const searchDefects = async (req: Request, res: Response) => {
  try {
    const { defectType, componentName, startDate, endDate, lineName } = req.query;

    const whereClause: any = {};

    if (defectType) {
      whereClause.defectType = { contains: String(defectType), mode: 'insensitive' };
    }

    if (componentName) {
      whereClause.componentName = { contains: String(componentName), mode: 'insensitive' };
    }

    // Filter by date or line requires filtering via the related Inspection model
    const inspectionFilter: any = {};
    let useInspectionFilter = false;

    if (startDate || endDate) {
      inspectionFilter.inspectionTime = {};
      if (startDate) inspectionFilter.inspectionTime.gte = new Date(String(startDate));
      if (endDate) {
        const end = new Date(String(endDate));
        end.setHours(23, 59, 59, 999);
        inspectionFilter.inspectionTime.lte = end;
      }
      useInspectionFilter = true;
    }

    if (lineName) {
      inspectionFilter.machine = {
        line: { name: { contains: String(lineName), mode: 'insensitive' } }
      };
      useInspectionFilter = true;
    }

    if (useInspectionFilter) {
      whereClause.inspection = inspectionFilter;
    }

    const defects = await prisma.defect.findMany({
      where: whereClause,
      include: {
        inspection: {
          include: {
            machine: {
              include: { line: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 200 // Limit for performance
    });

    res.json(defects);
  } catch (error) {
    console.error('Search defects error:', error);
    res.status(500).json({ error: 'Failed to search defects' });
  }
};
