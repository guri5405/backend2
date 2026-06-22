import express, { type Router } from 'express';
import AuthController from '../controllers/authController';
import validate from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { register, login } from '../validations/authValidation';

const router: Router = express.Router();

// POST /api/auth/register
router.post('/register', validate(register), AuthController.register);

// POST /api/auth/login
router.post('/login', validate(login), AuthController.login);

// GET /api/auth/me  (convenience endpoint to fetch the current authenticated user)
router.get('/me', authenticate, AuthController.me);

export default router;
