import NotificationModel from '../models/notificationModel';
import { ApiError } from '../utils/ApiError';
import { buildPaginationMeta, getPagination } from '../utils/pagination';
import type { NotificationRow } from '../types/models';
import type { RawQuery } from '../types/pagination';
import type { ListResult } from './propertyService';

const NotificationService = {
  async list(userId: number, query: RawQuery): Promise<ListResult<NotificationRow>> {
    const { page, limit, offset } = getPagination(query);
    const { items, totalItems } = await NotificationModel.findByUser(userId, { limit, offset });
    return { items, pagination: buildPaginationMeta(totalItems, page, limit) };
  },

  async markAsRead(notificationId: number, userId: number): Promise<NotificationRow> {
    const notification = await NotificationModel.findByIdAndUser(notificationId, userId);
    if (!notification) {
      throw ApiError.notFound('Notification not found', 'NOTIFICATION_NOT_FOUND');
    }
    return NotificationModel.markAsRead(notificationId);
  },
};

export default NotificationService;
