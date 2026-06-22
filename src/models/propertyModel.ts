import db from '../config/db';
import type { PropertyRow, PropertyStatus } from '../types/models';
import { extractCount } from '../utils/count';

const TABLE = 'properties';

const ALLOWED_SORT_COLUMNS = new Set<keyof PropertyRow>([
  'rent_amount',
  'created_at',
  'bedrooms',
  'bathrooms',
  'title',
]);

export interface CreatePropertyData {
  landlord_id: number;
  title: string;
  description: string;
  address: string;
  rent_amount: number;
  bedrooms: number;
  bathrooms: number;
}

export interface UpdatePropertyData {
  title?: string;
  description?: string;
  address?: string;
  rent_amount?: number;
  bedrooms?: number;
  bathrooms?: number;
  status?: PropertyStatus;
}

export interface PropertyFilters {
  minRent?: number;
  maxRent?: number;
  bedrooms?: number;
  status?: PropertyStatus;
}

export interface FindAllPaginatedOptions {
  filters?: PropertyFilters;
  sortBy?: string;
  order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  totalItems: number;
}

const PropertyModel = {
  async create(propertyData: CreatePropertyData): Promise<PropertyRow> {
    // `rent_amount` is typed `string` on `PropertyRow` (how pg returns DECIMAL),
    // but a plain number is what we insert; pg/knex accept both at runtime.
    const [property] = await db<PropertyRow>(TABLE)
      .insert(propertyData as unknown as Partial<PropertyRow>)
      .returning('*');
    return property as PropertyRow;
  },

  async findById(id: number): Promise<PropertyRow | undefined> {
    return db<PropertyRow>(TABLE).where({ id }).first();
  },

  /**
   * Returns a property only if it belongs to the given landlord, otherwise undefined.
   */
  async findByIdAndLandlord(id: number, landlordId: number): Promise<PropertyRow | undefined> {
    return db<PropertyRow>(TABLE).where({ id, landlord_id: landlordId }).first();
  },

  async update(id: number, updates: UpdatePropertyData): Promise<PropertyRow> {
    const [property] = await db<PropertyRow>(TABLE)
      .where({ id })
      .update({ ...updates, updated_at: db.fn.now() } as unknown as Partial<PropertyRow>)
      .returning('*');
    return property as PropertyRow;
  },

  async delete(id: number): Promise<number> {
    return db<PropertyRow>(TABLE).where({ id }).del();
  },

  /**
   * Builds the base query for the filterable, sortable list endpoint.
   */
  buildFilteredQuery(filters: PropertyFilters = {}) {
    const query = db<PropertyRow>(TABLE);

    if (filters.minRent !== undefined) {
      query.where('rent_amount', '>=', filters.minRent);
    }
    if (filters.maxRent !== undefined) {
      query.where('rent_amount', '<=', filters.maxRent);
    }
    if (filters.bedrooms !== undefined) {
      query.where('bedrooms', filters.bedrooms);
    }
    if (filters.status !== undefined) {
      query.where('status', filters.status);
    }

    return query;
  },

  async findAllPaginated({
    filters = {},
    sortBy = 'created_at',
    order = 'desc',
    limit = 10,
    offset = 0,
  }: FindAllPaginatedOptions): Promise<PaginatedResult<PropertyRow>> {
    const sortColumn = ALLOWED_SORT_COLUMNS.has(sortBy as keyof PropertyRow)
      ? (sortBy as keyof PropertyRow)
      : 'created_at';
    const sortOrder: 'asc' | 'desc' = order === 'asc' ? 'asc' : 'desc';

    const baseQuery = this.buildFilteredQuery(filters);
    const countQuery = baseQuery.clone();

    const totalItems = extractCount(await countQuery.count<{ count: string }[]>('id as count'));

    const items = await baseQuery
      .clone()
      .select('*')
      .orderBy(sortColumn, sortOrder)
      .limit(limit)
      .offset(offset);

    return { items, totalItems };
  },

  async countByLandlordAndStatus(landlordId: number, status?: PropertyStatus): Promise<number> {
    const query = db<PropertyRow>(TABLE).where({ landlord_id: landlordId });
    if (status) query.andWhere({ status });
    return extractCount(await query.count<{ count: string }[]>('id as count'));
  },
};

export default PropertyModel;
