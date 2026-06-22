import type { Knex } from 'knex';
import db from '../config/db';
import type { NotificationRow } from '../types/models';
import type { PaginatedResult } from './propertyModel';
import type { PageOptions } from './applicationModel';
import { extractCount } from '../utils/count';

const TABLE = 'notifications';

export interface CreateNotificationData {
  user_id: number;
  title: string;
  message: string;
}

const NotificationModel = {
  async create(
    notificationData: CreateNotificationData,
    trx: Knex | Knex.Transaction = db
  ): Promise<NotificationRow> {
    const [notification] = await trx<NotificationRow>(TABLE).insert(notificationData).returning('*');
    return notification as NotificationRow;
  },

  /**
   * Insert multiple notifications. Accepts an optional transaction object so
   * notification creation can participate in the same DB transaction as the
   * action that triggered it (e.g. application approval).
   */
  async createMany(
    notifications: CreateNotificationData[],
    trx: Knex | Knex.Transaction = db
  ): Promise<NotificationRow[]> {
    return trx<NotificationRow>(TABLE).insert(notifications).returning('*');
  },

  async findByUser(
    userId: number,
    { limit, offset }: PageOptions = {}
  ): Promise<PaginatedResult<NotificationRow>> {
    const baseQuery = db<NotificationRow>(TABLE).where({ user_id: userId });
    const totalItems = extractCount(await baseQuery.clone().count<{ count: string }[]>('id as count'));

    const query = baseQuery.clone().orderBy('created_at', 'desc');
    if (limit !== undefined) query.limit(limit);
    if (offset !== undefined) query.offset(offset);

    const items = await query;
    return { items, totalItems };
  },

  async findByIdAndUser(id: number, userId: number): Promise<NotificationRow | undefined> {
    return db<NotificationRow>(TABLE).where({ id, user_id: userId }).first();
  },

  async markAsRead(id: number): Promise<NotificationRow> {
    const [notification] = await db<NotificationRow>(TABLE)
      .where({ id })
      .update({ is_read: true })
      .returning('*');
    return notification as NotificationRow;
  },

  async countUnread(userId: number): Promise<number> {
    return extractCount(
      await db<NotificationRow>(TABLE)
        .where({ user_id: userId, is_read: false })
        .count<{ count: string }[]>('id as count')
    );
  },
};

export default NotificationModel;
