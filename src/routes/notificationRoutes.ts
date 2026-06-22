import express, { type Router } from 'express';
import NotificationController from '../controllers/notificationController';
import { authenticate } from '../middleware/auth';

const router: Router = express.Router();

// GET /api/notifications
router.get('/', authenticate, NotificationController.list);

// PUT /api/notifications/:notificationId/read
router.put('/:notificationId/read', authenticate, NotificationController.markAsRead);

export default router;
