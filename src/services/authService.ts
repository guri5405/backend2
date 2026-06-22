import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../config/env';
import { ApiError } from '../utils/ApiError';
import UserModel from '../models/userModel';
import type { PublicUserRow, UserRow } from '../types/models';
import type { LoginInput, RegisterInput } from '../types/dto';

const SALT_ROUNDS = 10;

function generateToken(user: { id: number; role: UserRow['role'] }): string {
  const options: jwt.SignOptions = {
    expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'],
  };
  return jwt.sign({ sub: user.id, role: user.role }, config.jwt.secret, options);
}

export interface AuthResult<TUser> {
  user: TUser;
  token: string;
}

const AuthService = {
  async register({ name, email, password, role }: RegisterInput): Promise<AuthResult<PublicUserRow>> {
    const existing = await UserModel.existsByEmail(email);
    if (existing) {
      throw ApiError.conflict('An account with this email already exists', 'EMAIL_TAKEN');
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await UserModel.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    const token = generateToken(user);
    return { user, token };
  },

  async login({ email, password }: LoginInput): Promise<AuthResult<PublicUserRow>> {
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      throw ApiError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    const token = generateToken(user);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...publicUser } = user;

    return { user: publicUser, token };
  },
};

export default AuthService;
