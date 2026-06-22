import type { Request, Response } from 'express';
import ApplicationService from '../services/applicationService';
import { serializeApplication } from '../utils/serializers';
import type { ApplyToPropertyInput } from '../types/dto';
import type { RawQuery } from '../types/pagination';

const ApplicationController = {
  async apply(
    req: Request<{ propertyId: string }, unknown, ApplyToPropertyInput>,
    res: Response
  ): Promise<void> {
    const application = await ApplicationService.apply(
      req.user!.id,
      parseInt(req.params.propertyId, 10),
      req.body
    );
    res.status(201).json({ success: true, data: serializeApplication(application) });
  },

  async getMyApplications(req: Request, res: Response): Promise<void> {
    const { items, pagination } = await ApplicationService.getMyApplications(
      req.user!.id,
      req.query as RawQuery
    );
    res.status(200).json({
      success: true,
      data: items.map((item) => serializeApplication(item)),
      pagination,
    });
  },

  async getApplicationsForProperty(req: Request<{ propertyId: string }>, res: Response): Promise<void> {
    const { items, pagination } = await ApplicationService.getApplicationsForProperty(
      parseInt(req.params.propertyId, 10),
      req.user!.id,
      req.query as RawQuery
    );
    res.status(200).json({
      success: true,
      data: items.map((item) => serializeApplication(item)),
      pagination,
    });
  },

  async approve(req: Request<{ applicationId: string }>, res: Response): Promise<void> {
    const application = await ApplicationService.approve(
      parseInt(req.params.applicationId, 10),
      req.user!.id
    );
    res.status(200).json({ success: true, data: serializeApplication(application) });
  },

  async reject(req: Request<{ applicationId: string }>, res: Response): Promise<void> {
    const application = await ApplicationService.reject(
      parseInt(req.params.applicationId, 10),
      req.user!.id
    );
    res.status(200).json({ success: true, data: serializeApplication(application) });
  },
};

export default ApplicationController;
