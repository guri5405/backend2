import type { Request, Response } from 'express';
import DashboardService from '../services/dashboardService';

const DashboardController = {
  async landlord(req: Request, res: Response): Promise<void> {
    const stats = await DashboardService.getLandlordDashboard(req.user!.id);
    res.status(200).json({ success: true, data: stats });
  },

  async tenant(req: Request, res: Response): Promise<void> {
    const stats = await DashboardService.getTenantDashboard(req.user!.id);
    res.status(200).json({ success: true, data: stats });
  },
};

export default DashboardController;
