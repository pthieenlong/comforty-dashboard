export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum';
export type CustomerStatus = 'active' | 'inactive';
export type Gender = 'male' | 'female' | 'other';

export type CustomerOrderStatus =
  | 'pending'
  | 'confirmed'
  | 'shipping'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type LoyaltyEventType = 'earn' | 'redeem' | 'adjust' | 'expire';

export interface ICustomerAddress {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  street: string;
  ward: string;
  district: string;
  city: string;
  isDefault: boolean;
}

export interface ICustomerOrderLine {
  productId: string;
  productName: string;
  sku: string;
  variantLabel: string;
  unitPrice: number;
  quantity: number;
}

export interface ICustomerOrder {
  id: string;
  code: string;
  placedAt: string;
  status: CustomerOrderStatus;
  channel: 'pos' | 'online';
  tenantId: string;
  shippingAddress: string;
  paymentMethod: string;
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  lines: ICustomerOrderLine[];
}

export interface ILoyaltyEvent {
  id: string;
  occurredAt: string;
  type: LoyaltyEventType;
  points: number;
  description: string;
  orderCode?: string;
}

export interface ICustomer {
  id: string;
  code: string;
  fullName: string;
  email: string;
  phone: string;
  gender: Gender;
  birthDate: string | null;
  status: CustomerStatus;
  createdAt: string;
  lastOrderAt: string | null;
  tier: LoyaltyTier;
  lifetimePoints: number;
  availablePoints: number;
  totalSpent: number;
  totalOrders: number;
  defaultTenantId: string;
  addresses: ICustomerAddress[];
  orders: ICustomerOrder[];
  loyaltyEvents: ILoyaltyEvent[];
  notes: string;
}
