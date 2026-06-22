import express, { type Router } from 'express';
import ApplicationController from '../controllers/applicationController';
import { authenticate, authorize } from '../middleware/auth';

const router: Router = express.Router();

// GET /api/applications/my-applications - tenant only
router.get('/my-applications', authenticate, authorize('tenant'), ApplicationController.getMyApplications);

// PUT /api/applications/:applicationId/approve - landlord only
router.put('/:applicationId/approve', authenticate, authorize('landlord'), ApplicationController.approve);

// PUT /api/applications/:applicationId/reject - landlord only
router.put('/:applicationId/reject', authenticate, authorize('landlord'), ApplicationController.reject);

export default router;
