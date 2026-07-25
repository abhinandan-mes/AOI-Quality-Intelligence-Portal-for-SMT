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
    const machineTypes = req.query.machineType ? (req.query.machineType as string).split(',') : ['SPI', 'POST_AOI'];

    const baseWhere = {
      inspectionTime: { gte: startDate },
      machine: { type: { in: machineTypes as any[] } }
    };

    const totalInspections = await prisma.inspection.count({
      where: baseWhere
    });

    const passCount = await prisma.inspection.count({
      where: { ...baseWhere, status: { in: ['PASS', 'GOOD'] } }
    });

    const defectCount = await prisma.defect.count({
      where: { inspection: baseWhere }
    });

    const activeMachinesRes = await prisma.inspection.groupBy({
      by: ['machineId'],
      where: baseWhere,
      _count: { machineId: true }
    });
    const activeMachinesCount = activeMachinesRes.length;

    const allInspections = await prisma.inspection.findMany({
      where: baseWhere,
      select: { productModel: { select: { componentsPerBoard: true, boardsPerPanel: true } } }
    });
    
    let totalComponentsTested = 0;
    allInspections.forEach((insp: any) => {
      const pm = insp.productModel;
      if (pm && pm.componentsPerBoard) {
        totalComponentsTested += (pm.componentsPerBoard * (pm.boardsPerPanel || 1));
      }
    });

    res.json({
      totalInspections,
      passCount,
      defectCount,
      activeMachinesCount,
      totalComponentsTested
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
    const machineTypes = req.query.machineType ? (req.query.machineType as string).split(',') : ['SPI', 'POST_AOI'];

    const baseWhere = {
      inspectionTime: { gte: startDate },
      machine: { type: { in: machineTypes as any[] } }
    };

    let trendData: any[] = [];
    if (timeframe === 'today') {
      const inspections = await prisma.inspection.findMany({
        where: baseWhere,
        select: { inspectionTime: true }
      });
      const hourly = new Array(24).fill(0);
      inspections.forEach(i => {
        hourly[i.inspectionTime.getHours()]++;
      });
      trendData = hourly.map((count, hour) => ({ name: `${hour}:00`, count })).filter(d => d.count > 0);
    } else {
      const inspections = await prisma.inspection.findMany({
        where: baseWhere,
        select: { inspectionTime: true }
      });
      const daily: Record<string, number> = {};
      inspections.forEach(i => {
        const d = i.inspectionTime.toLocaleDateString('en-US', { weekday: 'short' });
        daily[d] = (daily[d] || 0) + 1;
      });
      trendData = Object.keys(daily).map(key => ({ name: key, count: daily[key] }));
    }

    const distDataRaw = await prisma.inspection.groupBy({
      by: ['status'],
      where: baseWhere,
      _count: { status: true }
    });
    const distData = distDataRaw.map(d => ({ name: d.status, value: d._count.status }));

    const defects = await prisma.defect.findMany({
      where: { inspection: baseWhere },
      select: { 
        componentName: true, 
        defectType: true,
        inspection: { select: { machine: { select: { line: { select: { name: true } } } } } }
      }
    });
    
    const compCount: Record<string, { type: string, count: number }> = {};
    const lineCount: Record<string, number> = {};
    defects.forEach(d => {
      const comp = d.componentName || 'Unknown';
      if (!compCount[comp]) compCount[comp] = { type: d.defectType, count: 0 };
      compCount[comp].count++;
      
      const lineName = d.inspection?.machine?.line?.name || 'Unknown';
      lineCount[lineName] = (lineCount[lineName] || 0) + 1;
    });
    
    const topLines = Object.keys(lineCount)
      .map(line => ({ line, count: lineCount[line] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    const topComponents = Object.keys(compCount)
      .map(comp => ({ 
        component: comp, 
        defectType: compCount[comp].type, 
        count: compCount[comp].count 
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const recentInspections = await prisma.inspection.findMany({
      where: baseWhere,
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
      topLines,
      recentInspections: recentFormatted
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
