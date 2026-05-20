export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'hidden';

export interface IReviewMedia {
  id: string;
  url: string;
  type: 'image' | 'video';
}

export interface IReviewModerationEvent {
  id: string;
  occurredAt: string;
  action: 'submitted' | 'approved' | 'rejected' | 'hidden' | 'unhidden';
  actor: string;
  reason: string;
}

export interface IReview {
  id: string;
  customerId: string;
  customerName: string;
  productId: string;
  productName: string;
  variantSku: string | null;
  orderId: string | null;
  orderCode: string | null;
  rating: number; // 1-5
  title: string;
  content: string;
  media: IReviewMedia[];
  status: ReviewStatus;
  submittedAt: string;
  moderatedAt: string | null;
  moderatedBy: string | null;
  rejectReason: string | null;
  helpfulCount: number;
  reportedCount: number;
  events: IReviewModerationEvent[];
  // Aggregate: verified purchase if order is linked.
  verifiedPurchase: boolean;
}

export interface ReviewStatusMeta {
  label: string;
  badgeVariant: 'neutral' | 'info' | 'warning' | 'success' | 'danger';
}

export const REVIEW_STATUS_META: Record<ReviewStatus, ReviewStatusMeta> = {
  pending: { label: 'Chờ duyệt', badgeVariant: 'warning' },
  approved: { label: 'Đã duyệt', badgeVariant: 'success' },
  rejected: { label: 'Từ chối', badgeVariant: 'danger' },
  hidden: { label: 'Đã ẩn', badgeVariant: 'neutral' },
};

export const REJECT_REASON_OPTIONS = [
  'Nội dung không liên quan',
  'Spam / Quảng cáo',
  'Ngôn ngữ không phù hợp',
  'Hình ảnh không phù hợp',
  'Đánh giá không trung thực',
  'Khác',
] as const;
