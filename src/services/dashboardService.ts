import PropertyModel from '../models/propertyModel';
import ApplicationModel from '../models/applicationModel';
import type { LandlordDashboardStats, TenantDashboardStats } from '../types/dto';

const DashboardService = {
  async getLandlordDashboard(landlordId: number): Promise<LandlordDashboardStats> {
    const [totalProperties, activeProperties, rentedProperties, totalApplications] = await Promise.all([
      PropertyModel.countByLandlordAndStatus(landlordId),
      PropertyModel.countByLandlordAndStatus(landlordId, 'active'),
      PropertyModel.countByLandlordAndStatus(landlordId, 'rented'),
      ApplicationModel.countByLandlord(landlordId),
    ]);

    return { totalProperties, activeProperties, rentedProperties, totalApplications };
  },

  async getTenantDashboard(tenantId: number): Promise<TenantDashboardStats> {
    const [totalApplications, approved, rejected, pending] = await Promise.all([
      ApplicationModel.countByTenantAndStatus(tenantId),
      ApplicationModel.countByTenantAndStatus(tenantId, 'approved'),
      ApplicationModel.countByTenantAndStatus(tenantId, 'rejected'),
      ApplicationModel.countByTenantAndStatus(tenantId, 'pending'),
    ]);

    return { totalApplications, approved, rejected, pending };
  },
};

export default DashboardService;
