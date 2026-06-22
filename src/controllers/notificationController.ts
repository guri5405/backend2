import type { Request, Response } from 'express';
import NotificationService from '../services/notificationService';
import { serializeNotification } from '../utils/serializers';
import type { RawQuery } from '../types/pagination';

const NotificationController = {
  async list(req: Request, res: Response): Promise<void> {
    const { items, pagination } = await NotificationService.list(req.user!.id, req.query as RawQuery);
    res.status(200).json({
      success: true,
      data: items.map((item) => serializeNotification(item)),
      pagination,
    });
  },

  async markAsRead(req: Request<{ notificationId: string }>, res: Response): Promise<void> {
    const notification = await NotificationService.markAsRead(
      parseInt(req.params.notificationId, 10),
      req.user!.id
    );
    res.status(200).json({ success: true, data: serializeNotification(notification) });
  },
};

export default NotificationController;
