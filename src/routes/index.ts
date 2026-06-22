import express, { type Request, type Response, type Router } from 'express';

import authRoutes from './authRoutes';
import propertyRoutes from './propertyRoutes';
import applicationRoutes from './applicationRoutes';
import notificationRoutes from './notificationRoutes';
import dashboardRoutes from './dashboardRoutes';

const router: Router = express.Router();

router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'OK', timestamp: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/properties', propertyRoutes);
router.use('/applications', applicationRoutes);
router.use('/notifications', notificationRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
