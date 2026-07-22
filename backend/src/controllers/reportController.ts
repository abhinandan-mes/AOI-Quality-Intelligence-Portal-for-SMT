import { Request, Response } from 'express';
import prisma from '../prismaClient';

export const getDefectPareto = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, lineName } = req.query;

    const whereClause: any = {};
    if (startDate || endDate || lineName) {
      whereClause.inspection = { machine: {} };
      
      if (startDate || endDate) {
        whereClause.inspection.inspectionTime = {};
        if (startDate) whereClause.inspection.inspectionTime.gte = new Date(String(startDate));
        if (endDate) {
          const end = new Date(String(endDate));
          end.setHours(23, 59, 59, 999);
          whereClause.inspection.inspectionTime.lte = end;
        }
      }

      if (lineName) {
        whereClause.inspection.machine.line = { name: String(lineName) };
      }
    }

    const defects = await prisma.defect.findMany({
      where: whereClause,
      select: { defectType: true }
    });

    // Count occurrences of each defect type
    // Since defectType can be a comma-separated list like "Height Excess, Area Excess", we split them
    const counts: Record<string, number> = {};
    
    defects.forEach(d => {
      if (!d.defectType) return;
      const types = d.defectType.split(',').map(t => t.trim());
      types.forEach(t => {
        if (!counts[t]) counts[t] = 0;
        counts[t]++;
      });
    });

    // Format for Recharts
    const data = Object.keys(counts).map(key => ({
      name: key,
      count: counts[key]
    })).sort((a, b) => b.count - a.count).slice(0, 10); // Top 10

    res.json(data);
  } catch (error) {
    console.error('Defect Pareto error:', error);
    res.status(500).json({ error: 'Failed to fetch defect pareto' });
  }
};

export const getYieldTrend = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, lineName } = req.query;

    const whereClause: any = {};
    
    if (startDate || endDate) {
      whereClause.inspectionTime = {};
      if (startDate) whereClause.inspectionTime.gte = new Date(String(startDate));
      if (endDate) {
        const end = new Date(String(endDate));
        end.setHours(23, 59, 59, 999);
        whereClause.inspectionTime.lte = end;
      }
    } else {
      // Default to last 7 days
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      whereClause.inspectionTime = { gte: lastWeek };
    }

    if (lineName) {
      whereClause.machine = { line: { name: String(lineName) } };
    }

    const inspections = await prisma.inspection.findMany({
      where: whereClause,
      select: {
        inspectionTime: true,
        status: true
      },
      orderBy: { inspectionTime: 'asc' }
    });

    // Group by Day (YYYY-MM-DD)
    const grouped: Record<string, { pass: number, fail: number }> = {};
    
    inspections.forEach(insp => {
      const dateKey = insp.inspectionTime.toISOString().split('T')[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = { pass: 0, fail: 0 };
      }
      if (['PASS', 'GOOD'].includes(insp.status)) {
        grouped[dateKey].pass++;
      } else {
        grouped[dateKey].fail++;
      }
    });

    const data = Object.keys(grouped).map(date => {
      const g = grouped[date];
      const total = g.pass + g.fail;
      const yieldRate = total > 0 ? (g.pass / total) * 100 : 100;
      return {
        date,
        pass: g.pass,
        fail: g.fail,
        yieldRate: parseFloat(yieldRate.toFixed(2))
      };
    });

    res.json(data);
  } catch (error) {
    console.error('Yield trend error:', error);
    res.status(500).json({ error: 'Failed to fetch yield trend' });
  }
};
