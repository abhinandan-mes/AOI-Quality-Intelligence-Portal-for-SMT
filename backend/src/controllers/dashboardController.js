"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHourlyProduction = exports.getSummary = void 0;
const express_1 = require("express");
const prismaClient_1 = __importDefault(require("../prismaClient"));
const getSummary = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const totalInspections = await prismaClient_1.default.inspection.count({
            where: { inspectionTime: { gte: today } }
        });
        const passCount = await prismaClient_1.default.inspection.count({
            where: { inspectionTime: { gte: today }, status: 'PASS' }
        });
        const failCount = await prismaClient_1.default.inspection.count({
            where: { inspectionTime: { gte: today }, status: 'FAIL' }
        });
        const falseCalls = await prismaClient_1.default.inspection.count({
            where: { inspectionTime: { gte: today }, isFalseCall: true }
        });
        const aoiTotal = await prismaClient_1.default.inspection.count({
            where: { inspectionTime: { gte: today }, machine: { type: 'AOI' } }
        });
        const aoiPass = await prismaClient_1.default.inspection.count({
            where: { inspectionTime: { gte: today }, status: 'PASS', machine: { type: 'AOI' } }
        });
        const spiTotal = await prismaClient_1.default.inspection.count({
            where: { inspectionTime: { gte: today }, machine: { type: 'SPI' } }
        });
        const spiPass = await prismaClient_1.default.inspection.count({
            where: { inspectionTime: { gte: today }, status: 'PASS', machine: { type: 'SPI' } }
        });
        const aoiYield = aoiTotal > 0 ? (aoiPass / aoiTotal) * 100 : 100;
        const spiYield = spiTotal > 0 ? (spiPass / spiTotal) * 100 : 100;
        const overallYield = totalInspections > 0 ? (passCount / totalInspections) * 100 : 100;
        res.json({
            totalInspections,
            passCount,
            failCount,
            falseCalls,
            aoiYield: parseFloat(aoiYield.toFixed(2)),
            spiYield: parseFloat(spiYield.toFixed(2)),
            overallYield: parseFloat(overallYield.toFixed(2))
        });
    }
    catch (error) {
        console.error('Error fetching summary:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.getSummary = getSummary;
const getHourlyProduction = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const inspections = await prismaClient_1.default.inspection.findMany({
            where: { inspectionTime: { gte: today } },
            select: {
                inspectionTime: true,
                status: true,
                machine: {
                    select: { type: true }
                }
            }
        });
        // Group by hour
        const hourlyData = {};
        for (let i = 0; i < 24; i++) {
            hourlyData[i] = {
                hour: `${i.toString().padStart(2, '0')}:00`,
                AOI_Pass: 0,
                AOI_Fail: 0,
                SPI_Pass: 0,
                SPI_Fail: 0
            };
        }
        inspections.forEach(insp => {
            const hour = insp.inspectionTime.getHours();
            const isAOI = insp.machine.type === 'AOI';
            if (isAOI) {
                if (insp.status === 'PASS')
                    hourlyData[hour].AOI_Pass++;
                else
                    hourlyData[hour].AOI_Fail++;
            }
            else {
                if (insp.status === 'PASS')
                    hourlyData[hour].SPI_Pass++;
                else
                    hourlyData[hour].SPI_Fail++;
            }
        });
        const chartData = Object.values(hourlyData).filter(d => d.AOI_Pass > 0 || d.AOI_Fail > 0 || d.SPI_Pass > 0 || d.SPI_Fail > 0);
        res.json(chartData);
    }
    catch (error) {
        console.error('Error fetching hourly data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.getHourlyProduction = getHourlyProduction;
//# sourceMappingURL=dashboardController.js.map