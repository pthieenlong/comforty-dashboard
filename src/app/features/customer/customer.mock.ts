import { PRODUCTS } from '@/features/product/product.mock';
import type {
  CustomerOrderStatus,
  CustomerStatus,
  Gender,
  ICustomer,
  ICustomerAddress,
  ICustomerOrder,
  ICustomerOrderLine,
  ILoyaltyEvent,
  LoyaltyEventType,
  LoyaltyTier,
} from './customer.types';

interface CustomerSeed {
  fullName: string;
  email: string;
  phone: string;
  gender: Gender;
  birthDate: string | null;
  status: CustomerStatus;
  tier: LoyaltyTier;
  tenantId: string;
  city: string;
  district: string;
  ward: string;
  street: string;
  totalOrders: number;
  totalSpent: number;
  notes: string;
}

const seeds: CustomerSeed[] = [
  {
    fullName: 'Nguyễn Thị Mai',
    email: 'mai.nguyen@gmail.com',
    phone: '0901234567',
    gender: 'female',
    birthDate: '1995-03-12',
    status: 'active',
    tier: 'platinum',
    tenantId: 't-q1',
    city: 'TP. Hồ Chí Minh',
    district: 'Quận 1',
    ward: 'Phường Bến Nghé',
    street: '12 Nguyễn Huệ',
    totalOrders: 18,
    totalSpent: 28500000,
    notes: 'Khách VIP, thường mua dịp lễ.',
  },
  {
    fullName: 'Trần Văn Hùng',
    email: 'hung.tran@hotmail.com',
    phone: '0912345678',
    gender: 'male',
    birthDate: '1988-07-22',
    status: 'active',
    tier: 'gold',
    tenantId: 't-q1',
    city: 'TP. Hồ Chí Minh',
    district: 'Quận 3',
    ward: 'Phường Võ Thị Sáu',
    street: '45 Lê Văn Sỹ',
    totalOrders: 12,
    totalSpent: 16800000,
    notes: '',
  },
  {
    fullName: 'Lê Hoàng Anh',
    email: 'lehoanganh@yahoo.com',
    phone: '0923456789',
    gender: 'female',
    birthDate: '1992-11-05',
    status: 'active',
    tier: 'gold',
    tenantId: 't-hk',
    city: 'Hà Nội',
    district: 'Quận Hoàn Kiếm',
    ward: 'Phường Hàng Bạc',
    street: '88 Hàng Bạc',
    totalOrders: 9,
    totalSpent: 12400000,
    notes: 'Thích phong cách Nordic.',
  },
  {
    fullName: 'Phạm Quốc Bảo',
    email: 'baopham@gmail.com',
    phone: '0934567890',
    gender: 'male',
    birthDate: '1990-04-18',
    status: 'active',
    tier: 'silver',
    tenantId: 't-q7',
    city: 'TP. Hồ Chí Minh',
    district: 'Quận 7',
    ward: 'Phường Tân Phú',
    street: '23 Nguyễn Lương Bằng',
    totalOrders: 6,
    totalSpent: 7200000,
    notes: '',
  },
  {
    fullName: 'Vũ Minh Châu',
    email: 'chauvm@outlook.com',
    phone: '0945678901',
    gender: 'female',
    birthDate: '1998-09-30',
    status: 'active',
    tier: 'silver',
    tenantId: 't-td',
    city: 'TP. Hồ Chí Minh',
    district: 'TP. Thủ Đức',
    ward: 'Phường Linh Chiểu',
    street: '156 Võ Văn Ngân',
    totalOrders: 5,
    totalSpent: 5800000,
    notes: 'Khách hàng sinh viên.',
  },
  {
    fullName: 'Đỗ Thu Hà',
    email: 'hado@gmail.com',
    phone: '0956789012',
    gender: 'female',
    birthDate: '1985-06-14',
    status: 'active',
    tier: 'platinum',
    tenantId: 't-hk',
    city: 'Hà Nội',
    district: 'Quận Ba Đình',
    ward: 'Phường Kim Mã',
    street: '78 Nguyễn Chí Thanh',
    totalOrders: 22,
    totalSpent: 35200000,
    notes: 'Doanh nhân, mua nhiều cho gia đình.',
  },
  {
    fullName: 'Hoàng Minh Tuấn',
    email: 'tuanhm@gmail.com',
    phone: '0967890123',
    gender: 'male',
    birthDate: '1993-01-25',
    status: 'active',
    tier: 'gold',
    tenantId: 't-hc',
    city: 'Đà Nẵng',
    district: 'Quận Hải Châu',
    ward: 'Phường Hải Châu I',
    street: '34 Bạch Đằng',
    totalOrders: 10,
    totalSpent: 14500000,
    notes: '',
  },
  {
    fullName: 'Bùi Thị Linh',
    email: 'linhbui@gmail.com',
    phone: '0978901234',
    gender: 'female',
    birthDate: '1996-12-08',
    status: 'active',
    tier: 'bronze',
    tenantId: 't-q1',
    city: 'TP. Hồ Chí Minh',
    district: 'Quận Bình Thạnh',
    ward: 'Phường 25',
    street: '67 Điện Biên Phủ',
    totalOrders: 2,
    totalSpent: 1800000,
    notes: '',
  },
  {
    fullName: 'Nguyễn Đức Long',
    email: 'longnd@hotmail.com',
    phone: '0989012345',
    gender: 'male',
    birthDate: '1987-08-19',
    status: 'inactive',
    tier: 'silver',
    tenantId: 't-q7',
    city: 'TP. Hồ Chí Minh',
    district: 'Quận 7',
    ward: 'Phường Phú Mỹ',
    street: '12 Phú Mỹ Hưng',
    totalOrders: 4,
    totalSpent: 4500000,
    notes: 'Không hoạt động từ 6 tháng.',
  },
  {
    fullName: 'Trần Thị Hồng',
    email: 'hongtran@gmail.com',
    phone: '0901112223',
    gender: 'female',
    birthDate: '1994-05-03',
    status: 'active',
    tier: 'gold',
    tenantId: 't-q1',
    city: 'TP. Hồ Chí Minh',
    district: 'Quận 1',
    ward: 'Phường Cô Giang',
    street: '99 Trần Hưng Đạo',
    totalOrders: 8,
    totalSpent: 11200000,
    notes: '',
  },
  {
    fullName: 'Lương Văn Khoa',
    email: 'khoaluong@gmail.com',
    phone: '0902223334',
    gender: 'male',
    birthDate: '1991-10-11',
    status: 'active',
    tier: 'silver',
    tenantId: 't-td',
    city: 'TP. Hồ Chí Minh',
    district: 'TP. Thủ Đức',
    ward: 'Phường Hiệp Bình Phước',
    street: '210 Phạm Văn Đồng',
    totalOrders: 5,
    totalSpent: 6500000,
    notes: '',
  },
  {
    fullName: 'Phan Thị Ngọc',
    email: 'ngocphan@yahoo.com',
    phone: '0903334445',
    gender: 'female',
    birthDate: '1999-02-28',
    status: 'active',
    tier: 'bronze',
    tenantId: 't-hk',
    city: 'Hà Nội',
    district: 'Quận Đống Đa',
    ward: 'Phường Láng Hạ',
    street: '15 Láng Hạ',
    totalOrders: 1,
    totalSpent: 690000,
    notes: 'Khách mới.',
  },
  {
    fullName: 'Đặng Quang Vinh',
    email: 'vinhdang@gmail.com',
    phone: '0904445556',
    gender: 'male',
    birthDate: '1989-07-04',
    status: 'active',
    tier: 'platinum',
    tenantId: 't-q7',
    city: 'TP. Hồ Chí Minh',
    district: 'Quận 7',
    ward: 'Phường Tân Phong',
    street: '88 Nguyễn Hữu Thọ',
    totalOrders: 16,
    totalSpent: 24800000,
    notes: 'Mua nhiều thương hiệu cao cấp.',
  },
  {
    fullName: 'Mai Phương Thảo',
    email: 'thaomai@gmail.com',
    phone: '0905556667',
    gender: 'female',
    birthDate: '1997-04-16',
    status: 'active',
    tier: 'silver',
    tenantId: 't-hc',
    city: 'Đà Nẵng',
    district: 'Quận Sơn Trà',
    ward: 'Phường An Hải Bắc',
    street: '45 Phạm Văn Đồng',
    totalOrders: 5,
    totalSpent: 6800000,
    notes: '',
  },
  {
    fullName: 'Trịnh Hữu Phước',
    email: 'phuoctrinh@gmail.com',
    phone: '0906667778',
    gender: 'male',
    birthDate: '1986-11-22',
    status: 'active',
    tier: 'gold',
    tenantId: 't-q1',
    city: 'TP. Hồ Chí Minh',
    district: 'Quận 5',
    ward: 'Phường 8',
    street: '120 Nguyễn Trãi',
    totalOrders: 11,
    totalSpent: 15600000,
    notes: '',
  },
  {
    fullName: 'Lý Bảo Châu',
    email: 'chau.ly@gmail.com',
    phone: '0907778889',
    gender: 'female',
    birthDate: '1993-08-09',
    status: 'active',
    tier: 'bronze',
    tenantId: 't-q1',
    city: 'TP. Hồ Chí Minh',
    district: 'Quận 10',
    ward: 'Phường 12',
    street: '34 Sư Vạn Hạnh',
    totalOrders: 2,
    totalSpent: 1450000,
    notes: '',
  },
  {
    fullName: 'Võ Thành Đạt',
    email: 'datvo@hotmail.com',
    phone: '0908889990',
    gender: 'male',
    birthDate: '1992-03-27',
    status: 'inactive',
    tier: 'bronze',
    tenantId: 't-q1',
    city: 'TP. Hồ Chí Minh',
    district: 'Quận 4',
    ward: 'Phường 6',
    street: '23 Đoàn Văn Bơ',
    totalOrders: 1,
    totalSpent: 590000,
    notes: '',
  },
  {
    fullName: 'Nguyễn Thị Bích',
    email: 'bichnguyen@gmail.com',
    phone: '0909990001',
    gender: 'female',
    birthDate: '1990-09-14',
    status: 'active',
    tier: 'gold',
    tenantId: 't-hk',
    city: 'Hà Nội',
    district: 'Quận Cầu Giấy',
    ward: 'Phường Dịch Vọng',
    street: '67 Trần Thái Tông',
    totalOrders: 9,
    totalSpent: 13400000,
    notes: '',
  },
  {
    fullName: 'Cao Minh Hiếu',
    email: 'hieucao@gmail.com',
    phone: '0911223344',
    gender: 'male',
    birthDate: '1995-06-30',
    status: 'active',
    tier: 'silver',
    tenantId: 't-hc',
    city: 'Đà Nẵng',
    district: 'Quận Thanh Khê',
    ward: 'Phường Vĩnh Trung',
    street: '78 Lê Duẩn',
    totalOrders: 4,
    totalSpent: 5200000,
    notes: '',
  },
  {
    fullName: 'Hà Thuỳ Dương',
    email: 'duongha@gmail.com',
    phone: '0922334455',
    gender: 'female',
    birthDate: '1998-12-21',
    status: 'active',
    tier: 'silver',
    tenantId: 't-q7',
    city: 'TP. Hồ Chí Minh',
    district: 'Quận 7',
    ward: 'Phường Tân Quy',
    street: '102 Lâm Văn Bền',
    totalOrders: 6,
    totalSpent: 8100000,
    notes: '',
  },
  {
    fullName: 'Tô Hoàng Phúc',
    email: 'phuctp@gmail.com',
    phone: '0933445566',
    gender: 'male',
    birthDate: '1984-02-15',
    status: 'active',
    tier: 'platinum',
    tenantId: 't-hk',
    city: 'Hà Nội',
    district: 'Quận Tây Hồ',
    ward: 'Phường Quảng An',
    street: '12 Xuân Diệu',
    totalOrders: 20,
    totalSpent: 31500000,
    notes: 'Khách lâu năm.',
  },
  {
    fullName: 'Ngô Thị Lan',
    email: 'langngo@gmail.com',
    phone: '0944556677',
    gender: 'female',
    birthDate: '1991-05-08',
    status: 'active',
    tier: 'bronze',
    tenantId: 't-q1',
    city: 'TP. Hồ Chí Minh',
    district: 'Quận Phú Nhuận',
    ward: 'Phường 7',
    street: '56 Phan Đình Phùng',
    totalOrders: 2,
    totalSpent: 1900000,
    notes: '',
  },
  {
    fullName: 'Đinh Văn Hải',
    email: 'haidinh@gmail.com',
    phone: '0955667788',
    gender: 'male',
    birthDate: '1996-10-02',
    status: 'active',
    tier: 'silver',
    tenantId: 't-td',
    city: 'TP. Hồ Chí Minh',
    district: 'TP. Thủ Đức',
    ward: 'Phường Bình Thọ',
    street: '88 Đặng Văn Bi',
    totalOrders: 5,
    totalSpent: 7200000,
    notes: '',
  },
  {
    fullName: 'Phùng Thị Tuyết',
    email: 'tuyetphung@gmail.com',
    phone: '0966778899',
    gender: 'female',
    birthDate: '1989-01-19',
    status: 'active',
    tier: 'gold',
    tenantId: 't-q1',
    city: 'TP. Hồ Chí Minh',
    district: 'Quận 1',
    ward: 'Phường Đa Kao',
    street: '23 Đinh Tiên Hoàng',
    totalOrders: 8,
    totalSpent: 12100000,
    notes: '',
  },
  {
    fullName: 'Trương Quốc Việt',
    email: 'viettruong@gmail.com',
    phone: '0977889900',
    gender: 'male',
    birthDate: '1994-07-12',
    status: 'active',
    tier: 'bronze',
    tenantId: 't-hc',
    city: 'Đà Nẵng',
    district: 'Quận Ngũ Hành Sơn',
    ward: 'Phường Mỹ An',
    street: '34 Ngũ Hành Sơn',
    totalOrders: 1,
    totalSpent: 1290000,
    notes: '',
  },
];

const day = 86400000;
const baseDate = new Date('2024-06-01').getTime();

const ORDER_STATUSES: CustomerOrderStatus[] = [
  'delivered',
  'delivered',
  'delivered',
  'delivered',
  'shipping',
  'confirmed',
  'pending',
  'cancelled',
  'refunded',
];

const PAYMENT_METHODS = ['Tiền mặt', 'Chuyển khoản', 'Momo', 'VNPay', 'Visa/Master'];
const CHANNELS: ('pos' | 'online')[] = ['pos', 'online'];

function pseudoRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 2147483647;
    return s / 2147483647;
  };
}

function buildAddresses(seed: CustomerSeed, idx: number): ICustomerAddress[] {
  const primary: ICustomerAddress = {
    id: `addr-${idx}-1`,
    label: 'Nhà riêng',
    recipientName: seed.fullName,
    phone: seed.phone,
    street: seed.street,
    ward: seed.ward,
    district: seed.district,
    city: seed.city,
    isDefault: true,
  };
  if (idx % 3 === 0) {
    return [
      primary,
      {
        id: `addr-${idx}-2`,
        label: 'Văn phòng',
        recipientName: seed.fullName,
        phone: seed.phone,
        street: '100 Pasteur',
        ward: 'Phường Bến Nghé',
        district: 'Quận 1',
        city: 'TP. Hồ Chí Minh',
        isDefault: false,
      },
    ];
  }
  return [primary];
}

function buildOrders(seed: CustomerSeed, idx: number): ICustomerOrder[] {
  const count = Math.min(seed.totalOrders, 8);
  const rand = pseudoRandom(idx * 7919 + 13);
  const fullAddress = `${seed.street}, ${seed.ward}, ${seed.district}, ${seed.city}`;

  return Array.from({ length: count }, (_, i) => {
    const placedAt = new Date(baseDate + (i * 30 + idx) * day).toISOString();
    const status = ORDER_STATUSES[Math.floor(rand() * ORDER_STATUSES.length)] ?? 'delivered';
    const lineCount = 1 + Math.floor(rand() * 3);
    const lines: ICustomerOrderLine[] = Array.from({ length: lineCount }, (_, li) => {
      const product = PRODUCTS[(idx * 3 + i * 7 + li) % PRODUCTS.length];
      if (!product) {
        return {
          productId: '',
          productName: 'Unknown',
          sku: '',
          variantLabel: '',
          unitPrice: 0,
          quantity: 1,
        };
      }
      const variant = product.variants[(i + li) % product.variants.length];
      const quantity = 1 + Math.floor(rand() * 3);
      const variantLabel = variant ? Object.values(variant.attributes).join(' / ') : '';
      return {
        productId: product.id,
        productName: product.name,
        sku: variant?.sku ?? product.sku,
        variantLabel,
        unitPrice: variant?.price ?? product.basePrice,
        quantity,
      };
    });

    const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
    const discount = i % 4 === 0 ? Math.round(subtotal * 0.1) : 0;
    const shippingFee = status === 'cancelled' ? 0 : 30000;
    const total = subtotal - discount + shippingFee;

    return {
      id: `${seed.email}-ord-${i + 1}`,
      code: `ORD${String(idx + 1).padStart(3, '0')}${String(i + 1).padStart(3, '0')}`,
      placedAt,
      status,
      channel: CHANNELS[i % CHANNELS.length] ?? 'online',
      tenantId: seed.tenantId,
      shippingAddress: fullAddress,
      paymentMethod: PAYMENT_METHODS[(idx + i) % PAYMENT_METHODS.length] ?? 'Tiền mặt',
      subtotal,
      discount,
      shippingFee,
      total,
      lines,
    };
  }).sort((a, b) => (a.placedAt < b.placedAt ? 1 : -1));
}

function buildLoyaltyEvents(
  seed: CustomerSeed,
  idx: number,
  orders: ICustomerOrder[],
): ILoyaltyEvent[] {
  const events: ILoyaltyEvent[] = [];

  // Earn from delivered orders.
  orders.forEach((o, i) => {
    if (o.status === 'delivered' || o.status === 'shipping') {
      const points = Math.round(o.total / 10000);
      events.push({
        id: `${seed.email}-earn-${i}`,
        occurredAt: o.placedAt,
        type: 'earn' as LoyaltyEventType,
        points,
        description: `Tích điểm từ đơn ${o.code}`,
        orderCode: o.code,
      });
    }
  });

  // Some redemptions.
  if (seed.tier === 'gold' || seed.tier === 'platinum') {
    events.push({
      id: `${seed.email}-redeem-1`,
      occurredAt: new Date(baseDate + (idx + 90) * day).toISOString(),
      type: 'redeem',
      points: -500,
      description: 'Đổi voucher giảm 50.000₫',
    });
  }
  if (seed.tier === 'platinum') {
    events.push({
      id: `${seed.email}-adjust-1`,
      occurredAt: new Date(baseDate + (idx + 120) * day).toISOString(),
      type: 'adjust',
      points: 200,
      description: 'Điểm thưởng sinh nhật',
    });
  }

  return events.sort((a, b) => (a.occurredAt < b.occurredAt ? 1 : -1));
}

function tierAvailablePoints(tier: LoyaltyTier, lifetime: number): number {
  const ratios: Record<LoyaltyTier, number> = {
    bronze: 0.9,
    silver: 0.7,
    gold: 0.55,
    platinum: 0.4,
  };
  return Math.round(lifetime * ratios[tier]);
}

export const CUSTOMERS: ICustomer[] = seeds.map((seed, i) => {
  const addresses = buildAddresses(seed, i);
  const orders = buildOrders(seed, i);
  const loyaltyEvents = buildLoyaltyEvents(seed, i, orders);
  const lifetimePoints = Math.round(seed.totalSpent / 10000);
  const lastOrder = orders[0];
  return {
    id: `cust-${String(i + 1).padStart(3, '0')}`,
    code: `CUS${String(i + 1).padStart(4, '0')}`,
    fullName: seed.fullName,
    email: seed.email,
    phone: seed.phone,
    gender: seed.gender,
    birthDate: seed.birthDate,
    status: seed.status,
    createdAt: new Date(baseDate - (365 - i * 7) * day).toISOString(),
    lastOrderAt: lastOrder?.placedAt ?? null,
    tier: seed.tier,
    lifetimePoints,
    availablePoints: tierAvailablePoints(seed.tier, lifetimePoints),
    totalSpent: seed.totalSpent,
    totalOrders: seed.totalOrders,
    defaultTenantId: seed.tenantId,
    addresses,
    orders,
    loyaltyEvents,
    notes: seed.notes,
  };
});

export function findCustomer(id: string): ICustomer | undefined {
  return CUSTOMERS.find((c) => c.id === id);
}

export interface TierMeta {
  label: string;
  threshold: number;
  benefits: string[];
  badgeVariant: 'neutral' | 'info' | 'warning' | 'success';
}

export const TIER_META: Record<LoyaltyTier, TierMeta> = {
  bronze: {
    label: 'Bronze',
    threshold: 0,
    benefits: ['Tích 1 điểm cho mỗi 10.000₫', 'Voucher sinh nhật 50.000₫'],
    badgeVariant: 'neutral',
  },
  silver: {
    label: 'Silver',
    threshold: 500,
    benefits: ['Tích 1.2 điểm/10.000₫', 'Miễn phí vận chuyển từ 500k', 'Voucher sinh nhật 100k'],
    badgeVariant: 'info',
  },
  gold: {
    label: 'Gold',
    threshold: 1200,
    benefits: ['Tích 1.5 điểm/10.000₫', 'Miễn phí vận chuyển toàn bộ', 'Voucher sinh nhật 200k'],
    badgeVariant: 'warning',
  },
  platinum: {
    label: 'Platinum',
    threshold: 2500,
    benefits: [
      'Tích 2 điểm/10.000₫',
      'Miễn phí vận chuyển + đổi trả nhanh',
      'Voucher sinh nhật 500k',
      'Ưu tiên tiếp cận bộ sưu tập mới',
    ],
    badgeVariant: 'success',
  },
};
