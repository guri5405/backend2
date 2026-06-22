import Joi from 'joi';
import type { LoginInput, RegisterInput } from '../types/dto';

export const register: Joi.ObjectSchema<RegisterInput> = Joi.object({
  name: Joi.string().trim().min(2).max(150).required(),
  email: Joi.string().trim().email().lowercase().max(255).required(),
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
    .required()
    .messages({
      'string.pattern.base':
        'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    }),
  role: Joi.string().valid('landlord', 'tenant').required(),
});

export const login: Joi.ObjectSchema<LoginInput> = Joi.object({
  email: Joi.string().trim().email().lowercase().required(),
  password: Joi.string().required(),
});

export default { register, login };
