// ─── Campaign ────────────────────────────────────────────────────────────

export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'ended' | 'archived';

export type CampaignChannel = 'web' | 'pos' | 'email' | 'social';

export interface ICampaign {
  id: string;
  code: string;
  name: string;
  description: string;
  bannerUrl: string | null;
  channels: CampaignChannel[];
  status: CampaignStatus;
  startAt: string;
  endAt: string;
  tenantIds: string[]; // empty = all tenants
  createdAt: string;
  createdBy: string;
  promotionIds: string[];
  voucherBatchIds: string[];
}

// ─── Promotion ───────────────────────────────────────────────────────────

export type PromotionStatus = 'draft' | 'active' | 'paused' | 'expired';

export type PromotionType =
  | 'percent_order' // % discount on whole order with threshold
  | 'fixed_order' // fixed VND discount on whole order with threshold
  | 'percent_category' // % discount on items in category/brand
  | 'free_shipping' // waive shipping fee
  | 'bogo'; // buy X get Y

export interface IPromotionPercentOrder {
  type: 'percent_order';
  percent: number; // 0-100
  minOrderValue: number;
  maxDiscount: number | null;
}

export interface IPromotionFixedOrder {
  type: 'fixed_order';
  amount: number;
  minOrderValue: number;
}

export interface IPromotionPercentCategory {
  type: 'percent_category';
  percent: number;
  categoryIds: string[];
  brandIds: string[];
  maxDiscount: number | null;
}

export interface IPromotionFreeShipping {
  type: 'free_shipping';
  minOrderValue: number;
}

export interface IPromotionBogo {
  type: 'bogo';
  buyQuantity: number; // X
  getQuantity: number; // Y
  // Item scope: trigger products + free product variant
  triggerProductIds: string[]; // empty = any product
  freeProductIds: string[]; // empty = same as trigger
}

export type PromotionRule =
  | IPromotionPercentOrder
  | IPromotionFixedOrder
  | IPromotionPercentCategory
  | IPromotionFreeShipping
  | IPromotionBogo;

export interface IPromotion {
  id: string;
  code: string;
  name: string;
  description: string;
  status: PromotionStatus;
  startAt: string;
  endAt: string;
  rule: PromotionRule;
  campaignId: string | null;
  tenantIds: string[];
  usageCount: number;
  createdAt: string;
  createdBy: string;
}

// ─── Voucher ─────────────────────────────────────────────────────────────

export type VoucherType = 'single_use' | 'multi_use';

export type VoucherStatus = 'active' | 'paused' | 'expired' | 'exhausted';

export interface IVoucherBatch {
  id: string;
  code: string; // prefix code, e.g. 'SUMMER25'
  name: string;
  description: string;
  voucherType: VoucherType;
  status: VoucherStatus;
  startAt: string;
  endAt: string;
  discountPercent: number | null; // null if fixed
  discountAmount: number | null; // null if percent
  minOrderValue: number;
  maxDiscount: number | null;
  // For single_use: total codes generated. For multi_use: shared code with usage limit.
  totalCodes: number;
  usedCount: number;
  campaignId: string | null;
  createdAt: string;
  createdBy: string;
}

export interface IVoucherCode {
  id: string;
  batchId: string;
  code: string; // full code, e.g. 'SUMMER25-A4FK'
  // For single_use: each code is unique. For multi_use: only 1 code per batch.
  usedAt: string | null;
  usedByCustomerId: string | null;
  orderId: string | null;
}

// ─── Meta maps ───────────────────────────────────────────────────────────

export interface CampaignStatusMeta {
  label: string;
  badgeVariant: 'neutral' | 'info' | 'warning' | 'success' | 'danger';
}

export const CAMPAIGN_STATUS_META: Record<CampaignStatus, CampaignStatusMeta> = {
  draft: { label: 'Nháp', badgeVariant: 'neutral' },
  scheduled: { label: 'Đã lên lịch', badgeVariant: 'info' },
  active: { label: 'Đang chạy', badgeVariant: 'success' },
  ended: { label: 'Đã kết thúc', badgeVariant: 'neutral' },
  archived: { label: 'Lưu trữ', badgeVariant: 'neutral' },
};

export interface PromotionTypeMeta {
  label: string;
  description: string;
}

export const PROMOTION_TYPE_META: Record<PromotionType, PromotionTypeMeta> = {
  percent_order: {
    label: 'Giảm % toàn đơn',
    description: 'Áp dụng phần trăm trên tổng đơn khi đạt ngưỡng tối thiểu',
  },
  fixed_order: {
    label: 'Giảm đồng số cố định',
    description: 'Trừ thẳng số tiền cố định khi đạt ngưỡng',
  },
  percent_category: {
    label: 'Giảm % theo danh mục',
    description: 'Áp dụng phần trăm cho sản phẩm thuộc danh mục / thương hiệu cụ thể',
  },
  free_shipping: {
    label: 'Miễn phí vận chuyển',
    description: 'Bỏ phí vận chuyển khi đơn đạt ngưỡng',
  },
  bogo: {
    label: 'Mua X tặng Y',
    description: 'Tặng kèm sản phẩm khi mua đủ số lượng quy định',
  },
};

export const PROMOTION_STATUS_META: Record<PromotionStatus, CampaignStatusMeta> = {
  draft: { label: 'Nháp', badgeVariant: 'neutral' },
  active: { label: 'Đang chạy', badgeVariant: 'success' },
  paused: { label: 'Tạm dừng', badgeVariant: 'warning' },
  expired: { label: 'Hết hạn', badgeVariant: 'neutral' },
};

export const VOUCHER_STATUS_META: Record<VoucherStatus, CampaignStatusMeta> = {
  active: { label: 'Đang dùng được', badgeVariant: 'success' },
  paused: { label: 'Tạm dừng', badgeVariant: 'warning' },
  expired: { label: 'Hết hạn', badgeVariant: 'neutral' },
  exhausted: { label: 'Đã dùng hết', badgeVariant: 'neutral' },
};

export const VOUCHER_TYPE_META: Record<VoucherType, { label: string; description: string }> = {
  single_use: {
    label: 'Mã đơn lẻ',
    description: 'Mỗi mã chỉ dùng được 1 lần. Sinh nhiều mã trong batch.',
  },
  multi_use: {
    label: 'Mã dùng chung',
    description: '1 mã dùng được nhiều lần, có giới hạn tổng số lần sử dụng.',
  },
};

export const CAMPAIGN_CHANNEL_META: Record<CampaignChannel, { label: string }> = {
  web: { label: 'Website' },
  pos: { label: 'POS tại quầy' },
  email: { label: 'Email' },
  social: { label: 'Mạng xã hội' },
};
