import db from '../config/db';
import type { PublicUserRow, UserRow } from '../types/models';

const TABLE = 'users';

const PUBLIC_COLUMNS: (keyof UserRow)[] = ['id', 'name', 'email', 'role', 'created_at', 'updated_at'];

export interface CreateUserData {
  name: string;
  email: string;
  /** Must already be hashed by the caller. */
  password: string;
  role: UserRow['role'];
}

const UserModel = {
  /**
   * Creates a new user. `userData.password` must already be hashed.
   */
  async create(userData: CreateUserData): Promise<PublicUserRow> {
    const [user] = await db<UserRow>(TABLE).insert(userData).returning(PUBLIC_COLUMNS);
    return user as PublicUserRow;
  },

  async findByEmail(email: string): Promise<UserRow | undefined> {
    return db<UserRow>(TABLE).where({ email }).first();
  },

  async findById(id: number): Promise<PublicUserRow | undefined> {
    return db<UserRow>(TABLE).where({ id }).select(PUBLIC_COLUMNS).first();
  },

  async findByIdWithPassword(id: number): Promise<UserRow | undefined> {
    return db<UserRow>(TABLE).where({ id }).first();
  },

  async existsByEmail(email: string): Promise<boolean> {
    const user = await db<UserRow>(TABLE).where({ email }).first('id');
    return !!user;
  },
};

export default UserModel;
