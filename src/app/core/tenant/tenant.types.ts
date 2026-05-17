export type TenantType = 'hq' | 'store';

export interface ITenant {
  id: string;
  code: string;
  name: string;
  type: TenantType;
  city: string;
}
