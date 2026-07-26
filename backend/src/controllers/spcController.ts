import { Request, Response } from 'express';
import prisma from '../prismaClient';

export const getSpcData = async (req: Request, res: Response) => {
  try {
    const { barcode, lineName, machineName, componentName, startDate, endDate, page = '0', limit = '100' } = req.query;

    const whereClause: any = {};

    if (barcode) {
      whereClause.inspection = { barcode: { contains: String(barcode), mode: 'insensitive' } };
    }

    if (lineName || machineName || startDate || endDate) {
      if (!whereClause.inspection) whereClause.inspection = {};
      
      if (lineName) {
        whereClause.inspection.machine = {
          ...whereClause.inspection.machine,
          line: { name: { contains: String(lineName), mode: 'insensitive' } }
        };
      }
      
      if (machineName) {
        whereClause.inspection.machine = {
          ...whereClause.inspection.machine,
          name: { contains: String(machineName), mode: 'insensitive' }
        };
      }

      if (startDate || endDate) {
        whereClause.inspection.inspectionTime = {};
        if (startDate) whereClause.inspection.inspectionTime.gte = new Date(String(startDate));
        if (endDate) {
          const end = new Date(String(endDate));
          if (!String(endDate).includes('T')) {
            end.setHours(23, 59, 59, 999);
          }
          whereClause.inspection.inspectionTime.lte = end;
        }
      }
    }

    if (componentName) {
      whereClause.componentName = { contains: String(componentName), mode: 'insensitive' };
    }

    const skip = parseInt(String(page)) * parseInt(String(limit));
    const take = parseInt(String(limit));

    const totalRecords = await prisma.spiSpcData.count({ where: whereClause });
    
    const records = await prisma.spiSpcData.findMany({
      where: whereClause,
      include: {
        inspection: {
          include: {
            machine: {
              include: { line: true }
            },
            productModel: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take
    });

    res.json({
      total: totalRecords,
      page: parseInt(String(page)),
      limit: take,
      data: records
    });
  } catch (error) {
    console.error('Error fetching SPC data:', error);
    res.status(500).json({ error: 'Failed to fetch SPC data' });
  }
};
