import type { Request, Response } from 'express';
import PropertyService from '../services/propertyService';
import { serializeProperty } from '../utils/serializers';
import type { CreatePropertyInput, ListPropertiesQuery, UpdatePropertyInput } from '../types/dto';

const PropertyController = {
  async create(req: Request<unknown, unknown, CreatePropertyInput>, res: Response): Promise<void> {
    const property = await PropertyService.create(req.user!.id, req.body);
    res.status(201).json({ success: true, data: serializeProperty(property) });
  },

  async update(
    req: Request<{ propertyId: string }, unknown, UpdatePropertyInput>,
    res: Response
  ): Promise<void> {
    const property = await PropertyService.update(
      parseInt(req.params.propertyId, 10),
      req.user!.id,
      req.body
    );
    res.status(200).json({ success: true, data: serializeProperty(property) });
  },

  async remove(req: Request<{ propertyId: string }>, res: Response): Promise<void> {
    await PropertyService.delete(parseInt(req.params.propertyId, 10), req.user!.id);
    res.status(200).json({ success: true, message: 'Property deleted successfully' });
  },

  async list(req: Request, res: Response): Promise<void> {
    const query = req.query as unknown as ListPropertiesQuery;
    const { items, pagination } = await PropertyService.list(query);
    res.status(200).json({
      success: true,
      data: items.map((item) => serializeProperty(item)),
      pagination,
    });
  },

  async getById(req: Request<{ propertyId: string }>, res: Response): Promise<void> {
    const property = await PropertyService.getById(parseInt(req.params.propertyId, 10));
    res.status(200).json({ success: true, data: serializeProperty(property) });
  },
};

export default PropertyController;
