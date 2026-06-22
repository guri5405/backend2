import express, { type Router } from 'express';
import PropertyController from '../controllers/propertyController';
import ApplicationController from '../controllers/applicationController';
import validate from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';
import {
  createProperty,
  updateProperty,
  listPropertiesQuery,
  applyToProperty,
} from '../validations/propertyValidation';

const router: Router = express.Router();

// GET /api/properties - public listing with pagination/filtering/sorting
router.get('/', validate(listPropertiesQuery, 'query'), PropertyController.list);

// GET /api/properties/:propertyId
router.get('/:propertyId', PropertyController.getById);

// POST /api/properties - landlord only
router.post('/', authenticate, authorize('landlord'), validate(createProperty), PropertyController.create);

// PUT /api/properties/:propertyId - owner (landlord) only
router.put('/:propertyId',authenticate, authorize('landlord'),
  validate(updateProperty), PropertyController.update);

// DELETE /api/properties/:propertyId - owner (landlord) only
router.delete('/:propertyId', authenticate, authorize('landlord'), PropertyController.remove);

// POST /api/properties/:propertyId/apply - tenant only
router.post('/:propertyId/apply',authenticate,authorize('tenant'),
  validate(applyToProperty), ApplicationController.apply);

// GET /api/properties/:propertyId/applications - landlord only (own properties)
router.get('/:propertyId/applications',authenticate,authorize('landlord'),
  ApplicationController.getApplicationsForProperty);

export default router;
