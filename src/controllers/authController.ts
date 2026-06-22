import type { Request, Response } from 'express';
import AuthService from '../services/authService';
import type { LoginInput, RegisterInput } from '../types/dto';

const AuthController = {
  async register(req: Request<unknown, unknown, RegisterInput>, res: Response): Promise<void> {
    const { user, token } = await AuthService.register(req.body);
    res.status(201).json({
      success: true,
      data: {
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        token,
      },
    });
  },

  async login(req: Request<unknown, unknown, LoginInput>, res: Response): Promise<void> {
    const { user, token } = await AuthService.login(req.body);
    res.status(200).json({
      success: true,
      data: {
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        token,
      },
    });
  },

  async me(req: Request, res: Response): Promise<void> {
    // `authenticate` middleware guarantees req.user is set on this route.
    const { id, name, email, role, created_at } = req.user!;
    res.status(200).json({ success: true, data: { id, name, email, role, createdAt: created_at } });
  },
};

export default AuthController;
