export interface IWarehouse {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  address: string;
  isPrimary: boolean;
  managerName: string;
  capacity: number;
}
