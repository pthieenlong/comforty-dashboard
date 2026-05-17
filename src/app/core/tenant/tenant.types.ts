export type TenantType = 'hq' | 'store';
export type TenantStatus = 'active' | 'inactive';

export interface ITenant {
  id: string;
  code: string;
  name: string;
  type: TenantType;
  status: TenantStatus;
  city: string;
  address: string;
  phone: string;
  email: string;
  managerName: string;
  openedAt: string;
  userCount: number;
  warehouseCount: number;
}
