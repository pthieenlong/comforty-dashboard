import { ORDERS } from '@/features/order/order.mock';
import { PRODUCTS } from '@/features/product/product.mock';
import { CUSTOMERS } from './customer.mock';
import type { IReview, IReviewMedia, IReviewModerationEvent, ReviewStatus } from './review.types';

const day = 86400000;
const NOW = new Date('2026-05-20T10:00:00Z').getTime();

const REVIEW_TEMPLATES: { rating: number; title: string; content: string }[] = [
  {
    rating: 5,
    title: 'Chất lượng tuyệt vời!',
    content:
      'Đặt online giao nhanh, vải mềm mịn đúng như mô tả. Form chuẩn, mặc rất vừa. Sẽ ủng hộ shop lần sau.',
  },
  {
    rating: 5,
    title: 'Đẹp xuất sắc',
    content:
      'Màu đúng như hình, chất liệu mát, mặc cả ngày không khó chịu. Đóng gói cẩn thận. Recommend!',
  },
  {
    rating: 4,
    title: 'Hài lòng nhưng size hơi rộng',
    content:
      'Sản phẩm đẹp, chất tốt, chỉ có điều size M hơi rộng so với bảng size. Lần sau sẽ thử size S.',
  },
  {
    rating: 4,
    title: 'Tốt trong tầm giá',
    content: 'Vải đẹp, may chỉn chu. Có vài chỉ thừa nhưng cắt là ok. Giá hợp lý.',
  },
  {
    rating: 5,
    title: 'Áo mặc rất êm',
    content: 'Mua tặng người yêu, bạn ấy rất thích. Sẽ quay lại mua thêm màu khác.',
  },
  {
    rating: 3,
    title: 'Tạm được',
    content: 'Form ok, vải mỏng hơn mình nghĩ. Mặc đi chơi thì được, đi làm hơi nhột.',
  },
  {
    rating: 2,
    title: 'Khá thất vọng',
    content: 'Vải nhăn nhiều sau lần giặt đầu tiên. Đường may không đều. Không đáng giá tiền.',
  },
  {
    rating: 5,
    title: 'Lần thứ 3 mua rồi',
    content: 'Khách quen của shop. Lần nào cũng đẹp, đóng gói chu đáo. Cảm ơn shop!',
  },
  {
    rating: 4,
    title: 'Giao nhanh',
    content: 'Đặt sáng trưa giao luôn. Hàng đúng mẫu, vải mát. Sẽ ủng hộ tiếp.',
  },
  {
    rating: 1,
    title: 'Khác xa mô tả',
    content: 'Màu hình một đằng, nhận một nẻo. Vải mỏng dính. Đề nghị shop chấn chỉnh.',
  },
  {
    rating: 5,
    title: 'Cực kỳ ưng ý',
    content: 'Đầm mặc lên dáng cực, sẽ giới thiệu cho bạn bè. 10 điểm cho chất lượng.',
  },
  {
    rating: 3,
    title: 'Bình thường',
    content: 'Không có gì đặc biệt. Mặc được, không quá nổi bật.',
  },
];

const MEDIA_URLS = [
  'https://placehold.co/400x400/4f46e5/fff?text=Review+1',
  'https://placehold.co/400x400/0ea5e9/fff?text=Review+2',
  'https://placehold.co/400x400/22c55e/fff?text=Review+3',
  'https://placehold.co/400x400/f59e0b/fff?text=Review+4',
  'https://placehold.co/400x400/ef4444/fff?text=Review+5',
];

const REJECT_REASONS = ['Spam / Quảng cáo', 'Ngôn ngữ không phù hợp', 'Đánh giá không trung thực'];

const STAFF = ['Trần Minh Khoa', 'Nguyễn Thị Hằng', 'Phạm Quốc Cường', 'Đỗ Thu Trang'];

// Status distribution out of 80 reviews:
// 50 approved, 18 pending, 8 rejected, 4 hidden
const STATUS_PLAN: ReviewStatus[] = [
  ...Array(50).fill('approved'),
  ...Array(18).fill('pending'),
  ...Array(8).fill('rejected'),
  ...Array(4).fill('hidden'),
] as ReviewStatus[];

function pseudoRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 2147483647;
    return s / 2147483647;
  };
}

function buildEvents(
  reviewCode: string,
  status: ReviewStatus,
  submittedAt: number,
  moderator: string,
  rejectReason: string | null,
): IReviewModerationEvent[] {
  const events: IReviewModerationEvent[] = [
    {
      id: `${reviewCode}-evt-1`,
      occurredAt: new Date(submittedAt).toISOString(),
      action: 'submitted',
      actor: 'Khách hàng',
      reason: '',
    },
  ];
  if (status === 'pending') return events;
  const modAt = submittedAt + 4 * 3600000 + Math.floor(Math.random() * 8 * 3600000);
  if (status === 'approved') {
    events.push({
      id: `${reviewCode}-evt-2`,
      occurredAt: new Date(modAt).toISOString(),
      action: 'approved',
      actor: moderator,
      reason: '',
    });
  } else if (status === 'rejected') {
    events.push({
      id: `${reviewCode}-evt-2`,
      occurredAt: new Date(modAt).toISOString(),
      action: 'rejected',
      actor: moderator,
      reason: rejectReason ?? 'Khác',
    });
  } else if (status === 'hidden') {
    events.push({
      id: `${reviewCode}-evt-2`,
      occurredAt: new Date(modAt).toISOString(),
      action: 'approved',
      actor: moderator,
      reason: '',
    });
    events.push({
      id: `${reviewCode}-evt-3`,
      occurredAt: new Date(modAt + 7 * day).toISOString(),
      action: 'hidden',
      actor: moderator,
      reason: 'Báo cáo vi phạm sau khi duyệt',
    });
  }
  return events;
}

function buildReview(idx: number): IReview {
  const rand = pseudoRandom(idx * 7351 + 41);
  const template = REVIEW_TEMPLATES[idx % REVIEW_TEMPLATES.length] ?? REVIEW_TEMPLATES[0];
  if (!template) throw new Error('No review template');
  const customer = CUSTOMERS[idx % CUSTOMERS.length];
  if (!customer) throw new Error('No customer');
  const product = PRODUCTS[(idx * 3) % PRODUCTS.length];
  if (!product) throw new Error('No product');
  const variant = product.variants[idx % product.variants.length] ?? null;
  // Pick an order from this customer if any, otherwise null (anonymous review).
  const customerOrder = ORDERS.find(
    (o) => o.customerId === customer.id && o.items.some((it) => it.productId === product.id),
  );
  const hasMedia = rand() < 0.35;
  const mediaCount = hasMedia ? Math.floor(rand() * 3) + 1 : 0;
  const media: IReviewMedia[] = Array.from({ length: mediaCount }, (_, i) => ({
    id: `media-${idx}-${i}`,
    url: MEDIA_URLS[(idx + i) % MEDIA_URLS.length] ?? MEDIA_URLS[0] ?? '',
    type: 'image',
  }));

  const status = STATUS_PLAN[idx % STATUS_PLAN.length] ?? 'approved';
  const submittedAt = NOW - (80 - idx) * day - Math.floor(rand() * day);
  const moderator = STAFF[idx % STAFF.length] ?? STAFF[0] ?? 'Admin';
  const rejectReason =
    status === 'rejected' ? (REJECT_REASONS[idx % REJECT_REASONS.length] ?? 'Khác') : null;
  const reviewCode = `RV${String(idx + 1).padStart(4, '0')}`;

  const events = buildEvents(reviewCode, status, submittedAt, moderator, rejectReason);
  const moderatedEvent = events.find((e) => e.action !== 'submitted');

  return {
    id: `rv-${String(idx + 1).padStart(4, '0')}`,
    customerId: customer.id,
    customerName: customer.fullName,
    productId: product.id,
    productName: product.name,
    variantSku: variant?.sku ?? null,
    orderId: customerOrder?.id ?? null,
    orderCode: customerOrder?.code ?? null,
    rating: template.rating,
    title: template.title,
    content: template.content,
    media,
    status,
    submittedAt: new Date(submittedAt).toISOString(),
    moderatedAt: moderatedEvent?.occurredAt ?? null,
    moderatedBy: moderatedEvent?.actor ?? null,
    rejectReason,
    helpfulCount: status === 'approved' ? Math.floor(rand() * 25) : 0,
    reportedCount: status === 'hidden' ? Math.floor(rand() * 5) + 1 : 0,
    events,
    verifiedPurchase: customerOrder !== undefined,
  };
}

export const REVIEWS: IReview[] = Array.from({ length: 80 }, (_, i) => buildReview(i));

export function findReview(id: string): IReview | undefined {
  return REVIEWS.find((r) => r.id === id);
}

export function findReviewsByProduct(productId: string): IReview[] {
  return REVIEWS.filter((r) => r.productId === productId);
}

export function findReviewsByCustomer(customerId: string): IReview[] {
  return REVIEWS.filter((r) => r.customerId === customerId);
}
