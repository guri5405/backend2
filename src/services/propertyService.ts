import PropertyModel from '../models/propertyModel';
import type { UpdatePropertyData } from '../models/propertyModel';
import { ApiError } from '../utils/ApiError';
import { buildPaginationMeta, getPagination } from '../utils/pagination';
import type { PropertyRow } from '../types/models';
import type { CreatePropertyInput, ListPropertiesQuery, UpdatePropertyInput } from '../types/dto';
import type { PaginationMeta } from '../types/pagination';

export interface ListResult<T> {
  items: T[];
  pagination: PaginationMeta;
}

const sortColumnMap: Record<string, string> = {
  rentAmount: 'rent_amount',
  createdAt: 'created_at',
  bedrooms: 'bedrooms',
  bathrooms: 'bathrooms',
  title: 'title',
};

const PropertyService = {
  async create(landlordId: number, propertyData: CreatePropertyInput): Promise<PropertyRow> {
    return PropertyModel.create({
      landlord_id: landlordId,
      title: propertyData.title,
      description: propertyData.description,
      address: propertyData.address,
      rent_amount: propertyData.rentAmount,
      bedrooms: propertyData.bedrooms,
      bathrooms: propertyData.bathrooms,
    });
  },

  async getById(propertyId: number): Promise<PropertyRow> {
    const property = await PropertyModel.findById(propertyId);
    if (!property) {
      throw ApiError.notFound('Property not found', 'PROPERTY_NOT_FOUND');
    }
    return property;
  },

  async update(propertyId: number, landlordId: number, updates: UpdatePropertyInput): Promise<PropertyRow> {
    const property = await PropertyModel.findByIdAndLandlord(propertyId, landlordId);
    if (!property) {
      throw ApiError.notFound(
        'Property not found or you do not have permission to modify it',
        'PROPERTY_NOT_FOUND'
      );
    }

    const dbUpdates: UpdatePropertyData = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.address !== undefined) dbUpdates.address = updates.address;
    if (updates.rentAmount !== undefined) dbUpdates.rent_amount = updates.rentAmount;
    if (updates.bedrooms !== undefined) dbUpdates.bedrooms = updates.bedrooms;
    if (updates.bathrooms !== undefined) dbUpdates.bathrooms = updates.bathrooms;
    if (updates.status !== undefined) dbUpdates.status = updates.status;

    return PropertyModel.update(propertyId, dbUpdates);
  },

  async delete(propertyId: number, landlordId: number): Promise<{ id: number }> {
    const property = await PropertyModel.findByIdAndLandlord(propertyId, landlordId);
    if (!property) {
      throw ApiError.notFound(
        'Property not found or you do not have permission to delete it',
        'PROPERTY_NOT_FOUND'
      );
    }
    await PropertyModel.delete(propertyId);
    return { id: propertyId };
  },

  async list(query: ListPropertiesQuery): Promise<ListResult<PropertyRow>> {
    const { page, limit, offset } = getPagination(query);

    const filters: {
      minRent?: number;
      maxRent?: number;
      bedrooms?: number;
      status?: ListPropertiesQuery['status'];
    } = {};
    if (query.minRent !== undefined) filters.minRent = query.minRent;
    if (query.maxRent !== undefined) filters.maxRent = query.maxRent;
    if (query.bedrooms !== undefined) filters.bedrooms = query.bedrooms;
    if (query.status !== undefined) filters.status = query.status;

    // Map camelCase API field names to snake_case DB columns
    const sortBy = (query.sortBy && sortColumnMap[query.sortBy]) || 'created_at';
    const order = query.order || 'desc';

    const { items, totalItems } = await PropertyModel.findAllPaginated({
      filters,
      sortBy,
      order,
      limit,
      offset,
    });

    return {
      items,
      pagination: buildPaginationMeta(totalItems, page, limit),
    };
  },
};

export default PropertyService;
