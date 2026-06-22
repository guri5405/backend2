import express, { type Router } from 'express';
import DashboardController from '../controllers/dashboardController';
import { authenticate, authorize } from '../middleware/auth';

const router: Router = express.Router();

// GET /api/dashboard/landlord
router.get('/landlord', authenticate, authorize('landlord'), DashboardController.landlord);

// GET /api/dashboard/tenant
router.get('/tenant', authenticate, authorize('tenant'), DashboardController.tenant);

export default router;
