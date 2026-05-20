import { CUSTOMERS } from '@/features/customer/customer.mock';
import { ORDERS } from '@/features/order/order.mock';
import { PRODUCTS } from '@/features/product/product.mock';
import type {
  ICampaign,
  IPromotion,
  IVoucherBatch,
  IVoucherCode,
  PromotionRule,
} from './marketing.types';

const day = 86400000;
const NOW = new Date('2026-05-19T10:00:00Z').getTime();

const STAFF = [
  'Trần Minh Khoa',
  'Nguyễn Thị Hằng',
  'Phạm Quốc Cường',
  'Lê Hoàng Nam',
  'Đỗ Thu Trang',
];

function pseudoRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 2147483647;
    return s / 2147483647;
  };
}

function iso(offsetDays: number): string {
  return new Date(NOW + offsetDays * day).toISOString();
}

// ─── Campaigns ───────────────────────────────────────────────────────────

export const CAMPAIGNS: ICampaign[] = [
  {
    id: 'camp-001',
    code: 'TET2026',
    name: 'Tết Bính Thân 2026',
    description: 'Chiến dịch Tết Nguyên Đán với khuyến mãi đặc biệt cho bộ sưu tập áo dài và vest.',
    bannerUrl: 'https://placehold.co/1200x400/dc2626/fff?text=Tet+2026',
    channels: ['web', 'pos', 'email', 'social'],
    status: 'ended',
    startAt: iso(-90),
    endAt: iso(-60),
    tenantIds: [],
    createdAt: iso(-100),
    createdBy: STAFF[0] ?? 'Admin',
    promotionIds: ['promo-001', 'promo-002'],
    voucherBatchIds: ['vb-001'],
  },
  {
    id: 'camp-002',
    code: 'SUMMER2026',
    name: 'Hè 2026 — Mát mẻ năng động',
    description: 'Bộ sưu tập hè với áo thun, quần short và phụ kiện đi biển.',
    bannerUrl: 'https://placehold.co/1200x400/0ea5e9/fff?text=Summer+2026',
    channels: ['web', 'pos', 'social'],
    status: 'active',
    startAt: iso(-15),
    endAt: iso(45),
    tenantIds: [],
    createdAt: iso(-25),
    createdBy: STAFF[1] ?? 'Admin',
    promotionIds: ['promo-003', 'promo-004', 'promo-005'],
    voucherBatchIds: ['vb-002', 'vb-003'],
  },
  {
    id: 'camp-003',
    code: 'BACK2SCHOOL',
    name: 'Back to School',
    description: 'Đồng phục học sinh, ba lô và phụ kiện cho mùa tựu trường.',
    bannerUrl: 'https://placehold.co/1200x400/f59e0b/fff?text=Back+to+School',
    channels: ['web', 'email'],
    status: 'scheduled',
    startAt: iso(60),
    endAt: iso(120),
    tenantIds: [],
    createdAt: iso(-5),
    createdBy: STAFF[2] ?? 'Admin',
    promotionIds: ['promo-006'],
    voucherBatchIds: ['vb-004'],
  },
  {
    id: 'camp-004',
    code: 'BLACKFRIDAY',
    name: 'Black Friday — Săn deal cực sốc',
    description: 'Sự kiện giảm giá lớn nhất năm, áp dụng toàn bộ sản phẩm.',
    bannerUrl: 'https://placehold.co/1200x400/0f172a/fff?text=Black+Friday',
    channels: ['web', 'pos', 'email', 'social'],
    status: 'draft',
    startAt: iso(180),
    endAt: iso(183),
    tenantIds: [],
    createdAt: iso(-2),
    createdBy: STAFF[0] ?? 'Admin',
    promotionIds: [],
    voucherBatchIds: [],
  },
  {
    id: 'camp-005',
    code: 'VIP-Q2',
    name: 'Ưu đãi khách VIP Quý 2',
    description: 'Voucher riêng cho khách hàng Gold và Platinum.',
    bannerUrl: null,
    channels: ['email'],
    status: 'active',
    startAt: iso(-30),
    endAt: iso(60),
    tenantIds: [],
    createdAt: iso(-35),
    createdBy: STAFF[3] ?? 'Admin',
    promotionIds: [],
    voucherBatchIds: ['vb-005'],
  },
  {
    id: 'camp-006',
    code: 'OPENING-HK',
    name: 'Khai trương chi nhánh Hoàn Kiếm',
    description: 'Khuyến mãi đặc biệt cho khách hàng Hà Nội nhân dịp khai trương.',
    bannerUrl: 'https://placehold.co/1200x400/22c55e/fff?text=Khai+truong+HK',
    channels: ['pos', 'social'],
    status: 'ended',
    startAt: iso(-180),
    endAt: iso(-150),
    tenantIds: ['t-hk'],
    createdAt: iso(-200),
    createdBy: STAFF[4] ?? 'Admin',
    promotionIds: ['promo-007'],
    voucherBatchIds: [],
  },
  {
    id: 'camp-007',
    code: 'NEWCUSTOMER',
    name: 'Chào mừng khách hàng mới',
    description: 'Voucher 100k cho lần mua đầu tiên — luôn chạy.',
    bannerUrl: null,
    channels: ['web', 'email'],
    status: 'active',
    startAt: iso(-365),
    endAt: iso(365),
    tenantIds: [],
    createdAt: iso(-400),
    createdBy: STAFF[1] ?? 'Admin',
    promotionIds: [],
    voucherBatchIds: ['vb-006'],
  },
  {
    id: 'camp-008',
    code: 'CLEARANCE',
    name: 'Xả kho cuối mùa',
    description: 'Giảm giá sản phẩm cũ để dọn kho.',
    bannerUrl: 'https://placehold.co/1200x400/f97316/fff?text=Clearance',
    channels: ['web', 'pos'],
    status: 'archived',
    startAt: iso(-300),
    endAt: iso(-270),
    tenantIds: [],
    createdAt: iso(-310),
    createdBy: STAFF[0] ?? 'Admin',
    promotionIds: [],
    voucherBatchIds: [],
  },
];

// ─── Promotions ──────────────────────────────────────────────────────────

interface PromotionSeed {
  id: string;
  code: string;
  name: string;
  description: string;
  status: IPromotion['status'];
  startOffsetDays: number;
  endOffsetDays: number;
  rule: PromotionRule;
  campaignId: string | null;
  tenantIds: string[];
  usageCount: number;
}

const promoSeeds: PromotionSeed[] = [
  {
    id: 'promo-001',
    code: 'TET-15',
    name: 'Tết — Giảm 15% từ 500k',
    description: 'Áp dụng cho mọi đơn từ 500.000₫',
    status: 'expired',
    startOffsetDays: -90,
    endOffsetDays: -60,
    rule: { type: 'percent_order', percent: 15, minOrderValue: 500000, maxDiscount: 200000 },
    campaignId: 'camp-001',
    tenantIds: [],
    usageCount: 124,
  },
  {
    id: 'promo-002',
    code: 'TET-AODAI',
    name: 'Tết — Giảm 20% áo dài & vest',
    description: 'Áp dụng cho category áo dài và vest',
    status: 'expired',
    startOffsetDays: -90,
    endOffsetDays: -60,
    rule: {
      type: 'percent_category',
      percent: 20,
      categoryIds: ['cat-men-shirt', 'cat-women-dress'],
      brandIds: [],
      maxDiscount: 500000,
    },
    campaignId: 'camp-001',
    tenantIds: [],
    usageCount: 47,
  },
  {
    id: 'promo-003',
    code: 'SUMMER-10',
    name: 'Hè — Giảm 10% đơn từ 300k',
    description: 'Áp dụng toàn bộ đơn hàng từ 300.000₫',
    status: 'active',
    startOffsetDays: -15,
    endOffsetDays: 45,
    rule: { type: 'percent_order', percent: 10, minOrderValue: 300000, maxDiscount: 150000 },
    campaignId: 'camp-002',
    tenantIds: [],
    usageCount: 89,
  },
  {
    id: 'promo-004',
    code: 'SUMMER-SHIP',
    name: 'Hè — Miễn ship từ 250k',
    description: 'Miễn phí vận chuyển cho đơn từ 250.000₫',
    status: 'active',
    startOffsetDays: -15,
    endOffsetDays: 45,
    rule: { type: 'free_shipping', minOrderValue: 250000 },
    campaignId: 'camp-002',
    tenantIds: [],
    usageCount: 156,
  },
  {
    id: 'promo-005',
    code: 'SUMMER-BOGO',
    name: 'Hè — Mua 2 áo thun tặng 1',
    description: 'Mua 2 áo thun bất kỳ tặng 1 áo thun cùng giá hoặc thấp hơn',
    status: 'active',
    startOffsetDays: -15,
    endOffsetDays: 45,
    rule: {
      type: 'bogo',
      buyQuantity: 2,
      getQuantity: 1,
      triggerProductIds: PRODUCTS.slice(0, 4).map((p) => p.id),
      freeProductIds: [],
    },
    campaignId: 'camp-002',
    tenantIds: [],
    usageCount: 23,
  },
  {
    id: 'promo-006',
    code: 'SCHOOL-50K',
    name: 'Tựu trường — Giảm 50k đơn từ 400k',
    description: 'Giảm thẳng 50.000₫ cho đơn từ 400.000₫',
    status: 'draft',
    startOffsetDays: 60,
    endOffsetDays: 120,
    rule: { type: 'fixed_order', amount: 50000, minOrderValue: 400000 },
    campaignId: 'camp-003',
    tenantIds: [],
    usageCount: 0,
  },
  {
    id: 'promo-007',
    code: 'HK-OPENING',
    name: 'Khai trương HK — Giảm 25% cho khách Hà Nội',
    description: 'Chỉ áp dụng tại chi nhánh Hoàn Kiếm',
    status: 'expired',
    startOffsetDays: -180,
    endOffsetDays: -150,
    rule: { type: 'percent_order', percent: 25, minOrderValue: 200000, maxDiscount: 300000 },
    campaignId: 'camp-006',
    tenantIds: ['t-hk'],
    usageCount: 62,
  },
  {
    id: 'promo-008',
    code: 'BRAND-CMF-15',
    name: 'Giảm 15% thương hiệu Comforty',
    description: 'Áp dụng toàn bộ sản phẩm thương hiệu Comforty',
    status: 'active',
    startOffsetDays: -10,
    endOffsetDays: 20,
    rule: {
      type: 'percent_category',
      percent: 15,
      categoryIds: [],
      brandIds: ['brand-comforty'],
      maxDiscount: 300000,
    },
    campaignId: null,
    tenantIds: [],
    usageCount: 41,
  },
  {
    id: 'promo-009',
    code: 'WEEKEND-FIX',
    name: 'Cuối tuần — Giảm 30k toàn đơn',
    description: 'Giảm 30.000₫ cho đơn từ 200.000₫ vào cuối tuần',
    status: 'paused',
    startOffsetDays: -30,
    endOffsetDays: 60,
    rule: { type: 'fixed_order', amount: 30000, minOrderValue: 200000 },
    campaignId: null,
    tenantIds: [],
    usageCount: 18,
  },
  {
    id: 'promo-010',
    code: 'FREESHIP-ALL',
    name: 'Free ship toàn quốc',
    description: 'Miễn phí vận chuyển không giới hạn ngưỡng',
    status: 'paused',
    startOffsetDays: -45,
    endOffsetDays: -30,
    rule: { type: 'free_shipping', minOrderValue: 0 },
    campaignId: null,
    tenantIds: [],
    usageCount: 84,
  },
  {
    id: 'promo-011',
    code: 'KIDS-20',
    name: 'Trẻ em — Giảm 20%',
    description: 'Toàn bộ category trẻ em',
    status: 'active',
    startOffsetDays: -5,
    endOffsetDays: 25,
    rule: {
      type: 'percent_category',
      percent: 20,
      categoryIds: ['cat-kids'],
      brandIds: [],
      maxDiscount: 200000,
    },
    campaignId: null,
    tenantIds: [],
    usageCount: 12,
  },
  {
    id: 'promo-012',
    code: 'FLASH-100K',
    name: 'Flash sale — Giảm 100k cuối tuần',
    description: 'Flash sale 48h cuối tuần, đơn từ 1tr',
    status: 'expired',
    startOffsetDays: -7,
    endOffsetDays: -5,
    rule: { type: 'fixed_order', amount: 100000, minOrderValue: 1000000 },
    campaignId: null,
    tenantIds: [],
    usageCount: 8,
  },
];

export const PROMOTIONS: IPromotion[] = promoSeeds.map((s) => ({
  id: s.id,
  code: s.code,
  name: s.name,
  description: s.description,
  status: s.status,
  startAt: iso(s.startOffsetDays),
  endAt: iso(s.endOffsetDays),
  rule: s.rule,
  campaignId: s.campaignId,
  tenantIds: s.tenantIds,
  usageCount: s.usageCount,
  createdAt: iso(s.startOffsetDays - 5),
  createdBy: STAFF[0] ?? 'Admin',
}));

// ─── Voucher batches + codes ─────────────────────────────────────────────

interface BatchSeed {
  id: string;
  code: string;
  name: string;
  description: string;
  voucherType: IVoucherBatch['voucherType'];
  status: IVoucherBatch['status'];
  startOffsetDays: number;
  endOffsetDays: number;
  discountPercent: number | null;
  discountAmount: number | null;
  minOrderValue: number;
  maxDiscount: number | null;
  totalCodes: number;
  usedCount: number;
  campaignId: string | null;
}

const batchSeeds: BatchSeed[] = [
  {
    id: 'vb-001',
    code: 'TET2026',
    name: 'Voucher Tết 2026 — 100k',
    description: 'Phát cho khách Gold/Platinum dịp Tết',
    voucherType: 'single_use',
    status: 'expired',
    startOffsetDays: -90,
    endOffsetDays: -60,
    discountPercent: null,
    discountAmount: 100000,
    minOrderValue: 500000,
    maxDiscount: null,
    totalCodes: 50,
    usedCount: 38,
    campaignId: 'camp-001',
  },
  {
    id: 'vb-002',
    code: 'SUMMER25',
    name: 'Hè 2026 — Giảm 25%',
    description: 'Mã dùng chung cho mọi khách trong hè',
    voucherType: 'multi_use',
    status: 'active',
    startOffsetDays: -15,
    endOffsetDays: 45,
    discountPercent: 25,
    discountAmount: null,
    minOrderValue: 400000,
    maxDiscount: 300000,
    totalCodes: 1000,
    usedCount: 217,
    campaignId: 'camp-002',
  },
  {
    id: 'vb-003',
    code: 'SUMMER-VIP',
    name: 'Hè 2026 — Voucher 200k cho VIP',
    description: 'Voucher đơn lẻ cho khách Platinum',
    voucherType: 'single_use',
    status: 'active',
    startOffsetDays: -15,
    endOffsetDays: 45,
    discountPercent: null,
    discountAmount: 200000,
    minOrderValue: 800000,
    maxDiscount: null,
    totalCodes: 30,
    usedCount: 11,
    campaignId: 'camp-002',
  },
  {
    id: 'vb-004',
    code: 'SCHOOL10',
    name: 'Tựu trường — Giảm 10%',
    description: 'Phát cho phụ huynh đã đăng ký nhận tin',
    voucherType: 'multi_use',
    status: 'paused',
    startOffsetDays: 60,
    endOffsetDays: 120,
    discountPercent: 10,
    discountAmount: null,
    minOrderValue: 300000,
    maxDiscount: 100000,
    totalCodes: 500,
    usedCount: 0,
    campaignId: 'camp-003',
  },
  {
    id: 'vb-005',
    code: 'VIPQ2',
    name: 'VIP Q2 — Giảm 300k',
    description: 'Voucher cá nhân hoá cho khách Gold/Platinum',
    voucherType: 'single_use',
    status: 'active',
    startOffsetDays: -30,
    endOffsetDays: 60,
    discountPercent: null,
    discountAmount: 300000,
    minOrderValue: 1500000,
    maxDiscount: null,
    totalCodes: 40,
    usedCount: 6,
    campaignId: 'camp-005',
  },
  {
    id: 'vb-006',
    code: 'WELCOME',
    name: 'Khách mới — Giảm 100k',
    description: 'Voucher đơn đầu tiên cho khách mới đăng ký',
    voucherType: 'multi_use',
    status: 'active',
    startOffsetDays: -365,
    endOffsetDays: 365,
    discountPercent: null,
    discountAmount: 100000,
    minOrderValue: 300000,
    maxDiscount: null,
    totalCodes: 9999,
    usedCount: 437,
    campaignId: 'camp-007',
  },
];

export const VOUCHER_BATCHES: IVoucherBatch[] = batchSeeds.map((s) => ({
  id: s.id,
  code: s.code,
  name: s.name,
  description: s.description,
  voucherType: s.voucherType,
  status: s.status,
  startAt: iso(s.startOffsetDays),
  endAt: iso(s.endOffsetDays),
  discountPercent: s.discountPercent,
  discountAmount: s.discountAmount,
  minOrderValue: s.minOrderValue,
  maxDiscount: s.maxDiscount,
  totalCodes: s.totalCodes,
  usedCount: s.usedCount,
  campaignId: s.campaignId,
  createdAt: iso(s.startOffsetDays - 5),
  createdBy: STAFF[1] ?? 'Admin',
}));

// Generate individual voucher codes for single_use batches and 1 shared code for multi_use.
function generateCodes(): IVoucherCode[] {
  const codes: IVoucherCode[] = [];
  const rand = pseudoRandom(2026);
  const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  function makeSuffix(): string {
    let out = '';
    for (let i = 0; i < 4; i++) {
      out += charset[Math.floor(rand() * charset.length)] ?? 'A';
    }
    return out;
  }

  VOUCHER_BATCHES.forEach((batch) => {
    if (batch.voucherType === 'multi_use') {
      codes.push({
        id: `${batch.id}-shared`,
        batchId: batch.id,
        code: batch.code,
        usedAt: null,
        usedByCustomerId: null,
        orderId: null,
      });
      return;
    }
    // single_use: generate `totalCodes` codes, mark first `usedCount` as used.
    for (let i = 0; i < batch.totalCodes; i++) {
      const used = i < batch.usedCount;
      const customer = used ? CUSTOMERS[(i + 3) % CUSTOMERS.length] : null;
      const order = used ? ORDERS[(i + 7) % ORDERS.length] : null;
      codes.push({
        id: `${batch.id}-code-${i + 1}`,
        batchId: batch.id,
        code: `${batch.code}-${makeSuffix()}`,
        usedAt: used ? iso(-Math.floor(rand() * 60) - 1) : null,
        usedByCustomerId: customer?.id ?? null,
        orderId: order?.id ?? null,
      });
    }
  });
  return codes;
}

export const VOUCHER_CODES: IVoucherCode[] = generateCodes();

// ─── Helpers ─────────────────────────────────────────────────────────────

export function findCampaign(id: string): ICampaign | undefined {
  return CAMPAIGNS.find((c) => c.id === id);
}

export function findPromotion(id: string): IPromotion | undefined {
  return PROMOTIONS.find((p) => p.id === id);
}

export function findVoucherBatch(id: string): IVoucherBatch | undefined {
  return VOUCHER_BATCHES.find((b) => b.id === id);
}

export function findVoucherCodesByBatch(batchId: string): IVoucherCode[] {
  return VOUCHER_CODES.filter((c) => c.batchId === batchId);
}
