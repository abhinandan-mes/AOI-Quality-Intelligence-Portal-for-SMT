import { Request, Response } from 'express';
import prisma from '../prismaClient';

const getDateFromTimeframe = (timeframe: string) => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  if (timeframe === 'weekly') {
    date.setDate(date.getDate() - 7);
  } else if (timeframe === 'monthly') {
    date.setMonth(date.getMonth() - 1);
  }
  return date;
};

export const getSummary = async (req: Request, res: Response) => {
  try {
    const timeframe = (req.query.timeframe as string) || 'today';
    const startDate = getDateFromTimeframe(timeframe);

    const totalInspections = await prisma.inspection.count({
      where: { inspectionTime: { gte: startDate } }
    });

    const passCount = await prisma.inspection.count({
      where: { inspectionTime: { gte: startDate }, status: { in: ['PASS', 'GOOD'] } }
    });

    // We'll count the total number of Defects
    const defectCount = await prisma.defect.count({
      where: { inspection: { inspectionTime: { gte: startDate } } }
    });

    // Active machines (machines that had an inspection in this timeframe)
    const activeMachinesRes = await prisma.inspection.groupBy({
      by: ['machineId'],
      where: { inspectionTime: { gte: startDate } },
      _count: { machineId: true }
    });
    const activeMachinesCount = activeMachinesRes.length;

    res.json({
      totalInspections,
      passCount,
      defectCount,
      activeMachinesCount
    });
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getDashboardData = async (req: Request, res: Response) => {
  try {
    const timeframe = (req.query.timeframe as string) || 'today';
    const startDate = getDateFromTimeframe(timeframe);

    // 1. Output Trend (Inspections per day/hour)
    let trendData: any[] = [];
    if (timeframe === 'today') {
      const inspections = await prisma.inspection.findMany({
        where: { inspectionTime: { gte: startDate } },
        select: { inspectionTime: true }
      });
      const hourly = new Array(24).fill(0);
      inspections.forEach(i => {
        hourly[i.inspectionTime.getHours()]++;
      });
      trendData = hourly.map((count, hour) => ({ name: `${hour}:00`, count })).filter(d => d.count > 0);
    } else {
      const inspections = await prisma.inspection.findMany({
        where: { inspectionTime: { gte: startDate } },
        select: { inspectionTime: true }
      });
      const daily: Record<string, number> = {};
      inspections.forEach(i => {
        const d = i.inspectionTime.toLocaleDateString('en-US', { weekday: 'short' });
        daily[d] = (daily[d] || 0) + 1;
      });
      // We want to sort them somewhat sequentially, but for now just output
      trendData = Object.keys(daily).map(key => ({ name: key, count: daily[key] }));
    }

    // 2. Distribution (Yield: Pass vs Fail vs NG)
    const distDataRaw = await prisma.inspection.groupBy({
      by: ['status'],
      where: { inspectionTime: { gte: startDate } },
      _count: { status: true }
    });
    const distData = distDataRaw.map(d => ({ name: d.status, value: d._count.status }));

    // 3. Top Defective Components
    const defects = await prisma.defect.findMany({
      where: { inspection: { inspectionTime: { gte: startDate } } },
      select: { componentName: true, defectType: true }
    });
    
    const compCount: Record<string, { type: string, count: number }> = {};
    defects.forEach(d => {
      const comp = d.componentName || 'Unknown';
      if (!compCount[comp]) compCount[comp] = { type: d.defectType, count: 0 };
      compCount[comp].count++;
    });
    
    const topComponents = Object.keys(compCount)
      .map(comp => ({ 
        component: comp, 
        defectType: compCount[comp].type, 
        count: compCount[comp].count 
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5

    // 4. Recent Inspections
    const recentInspections = await prisma.inspection.findMany({
      orderBy: { inspectionTime: 'desc' },
      take: 5,
      include: {
        machine: { include: { line: true } }
      }
    });

    const recentFormatted = recentInspections.map(i => ({
      barcode: i.barcode,
      line: i.machine?.line?.name || '-',
      machine: i.machine?.name || '-',
      status: i.status,
      timestamp: i.inspectionTime.toLocaleString()
    }));

    res.json({
      trendData,
      distData,
      topComponents,
      recentInspections: recentFormatted
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
