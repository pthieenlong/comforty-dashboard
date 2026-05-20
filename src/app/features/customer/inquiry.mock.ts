import { USERS } from '@/features/iam/iam.mock';
import { CUSTOMERS } from './customer.mock';
import type { IInquiry, IInquiryReply, InquirySource, InquiryStatus } from './inquiry.types';

const day = 86400000;
const NOW = new Date('2026-05-20T10:00:00Z').getTime();

interface InquirySeed {
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  source: InquirySource;
  subject: string;
  message: string;
  status: InquiryStatus;
}

const SEEDS: InquirySeed[] = [
  {
    senderName: 'Ngô Văn An',
    senderEmail: 'anngo@gmail.com',
    senderPhone: '0901112233',
    source: 'web_contact',
    subject: 'Hỏi giờ mở cửa chi nhánh Q1',
    message: 'Chào shop, em muốn hỏi giờ mở cửa của chi nhánh Quận 1 trong dịp Tết sắp tới.',
    status: 'new',
  },
  {
    senderName: 'Lê Thị Diệp',
    senderEmail: 'diepleeyy@yahoo.com',
    senderPhone: '0902223344',
    source: 'social',
    subject: 'Có gửi hàng đi Mỹ không?',
    message: 'Em đang ở Mỹ, có muốn order nhưng không biết shop có giao quốc tế không?',
    status: 'replied',
  },
  {
    senderName: 'Trần Bảo Khanh',
    senderEmail: 'khanhtb@gmail.com',
    senderPhone: '0903334455',
    source: 'web_contact',
    subject: 'Tư vấn váy cưới cho người 1m65',
    message:
      'Em sắp cưới, cao 1m65 nặng 52kg. Shop tư vấn giúp em chọn váy phù hợp dáng người được không?',
    status: 'new',
  },
  {
    senderName: 'Phạm Minh Tâm',
    senderEmail: 'tampm@hotmail.com',
    senderPhone: '0904445566',
    source: 'email',
    subject: 'Yêu cầu hợp tác KOC',
    message:
      'Em là KOC với 50k followers trên Instagram, muốn hợp tác PR sản phẩm cho shop. Vui lòng phản hồi qua email.',
    status: 'replied',
  },
  {
    senderName: 'Hoàng Lan Hương',
    senderEmail: 'huonghl@gmail.com',
    senderPhone: '0905556677',
    source: 'phone',
    subject: 'Khuyến mãi Black Friday năm nay',
    message: 'Năm nay shop có chương trình Black Friday không? Bao giờ bắt đầu?',
    status: 'new',
  },
  {
    senderName: 'Đỗ Quang Hùng',
    senderEmail: 'hungdq@gmail.com',
    senderPhone: '0906667788',
    source: 'web_contact',
    subject: 'Có dịch vụ thuê đồ vest cưới không?',
    message:
      'Em chỉ mặc 1 ngày cưới, không muốn mua. Shop có dịch vụ thuê hoặc giảm giá đặc biệt cho vest cưới không?',
    status: 'archived',
  },
  {
    senderName: 'Vũ Thanh Trang',
    senderEmail: 'trangvt@gmail.com',
    senderPhone: '0907778899',
    source: 'social',
    subject: 'Áo polo hết size XL — khi nào có lại?',
    message:
      'Em tìm trên web mã áo polo CMF-MEN-TS-002 size XL màu navy, đã hết hàng. Khi nào có lại?',
    status: 'new',
  },
  {
    senderName: 'Bùi Văn Phong',
    senderEmail: 'phongbv@gmail.com',
    senderPhone: '0908889900',
    source: 'web_contact',
    subject: 'Chính sách đổi trả trong bao lâu?',
    message: 'Em mua tặng người thân, lỡ không vừa thì đổi trong vòng bao nhiêu ngày shop ơi?',
    status: 'replied',
  },
  {
    senderName: 'Nguyễn Khánh Linh',
    senderEmail: 'linhnk2026@gmail.com',
    senderPhone: '0909990011',
    source: 'web_contact',
    subject: 'Đặt sỉ 50 áo polo cho công ty',
    message:
      'Công ty em muốn đặt 50 áo polo in logo cho sự kiện cuối năm. Shop có gói corporate không? Email báo giá nhé.',
    status: 'new',
  },
  {
    senderName: 'Trịnh Thu Hà',
    senderEmail: 'hatt@yahoo.com',
    senderPhone: '0910111223',
    source: 'phone',
    subject: 'Voucher tích điểm — hỏi cách dùng',
    message: 'Em có 500 điểm tích luỹ, đổi voucher 50k. Khi mua online thì nhập mã ở đâu hả shop?',
    status: 'replied',
  },
  {
    senderName: 'Lý Hoàng Quân',
    senderEmail: 'quanlh@hotmail.com',
    senderPhone: '0911222334',
    source: 'social',
    subject: 'Có app mobile không?',
    message: 'Em muốn cài app cho dễ mua hàng, shop có app trên App Store / Play Store không?',
    status: 'new',
  },
  {
    senderName: 'Phan Thanh Tùng',
    senderEmail: 'tungpt@gmail.com',
    senderPhone: '0912333445',
    source: 'web_contact',
    subject: 'Yêu cầu in hoá đơn VAT',
    message:
      'Em vừa mua đơn 2.5tr, công ty cần hoá đơn VAT để khấu trừ. Shop hỗ trợ in giúp được không?',
    status: 'replied',
  },
  {
    senderName: 'Đặng Minh Châu',
    senderEmail: 'chaudm@gmail.com',
    senderPhone: '0913444556',
    source: 'social',
    subject: 'Đầm midi mã DM-2026 chất vải gì?',
    message:
      'Em đang xem đầm midi DM-2026 trên Instagram, không thấy thông tin chất vải. Shop tư vấn giúp em với.',
    status: 'archived',
  },
  {
    senderName: 'Mai Quốc Đạt',
    senderEmail: 'datmq@outlook.com',
    senderPhone: '0914555667',
    source: 'email',
    subject: 'Đề nghị mở chi nhánh tại Cần Thơ',
    message:
      'Khu vực Cần Thơ chưa có chi nhánh, em phải đặt online + ship rất tốn phí. Shop có kế hoạch mở chi nhánh ở miền Tây không?',
    status: 'new',
  },
  {
    senderName: 'Hà Mỹ Linh',
    senderEmail: 'linhmh@gmail.com',
    senderPhone: '0915666778',
    source: 'web_contact',
    subject: 'Quên mật khẩu tài khoản',
    message: 'Em quên mật khẩu, nhấn nút "quên mật khẩu" mà không nhận được email. Hỗ trợ với ạ.',
    status: 'replied',
  },
  {
    senderName: 'Tô Văn Lâm',
    senderEmail: 'lamtv@gmail.com',
    senderPhone: '0916777889',
    source: 'phone',
    subject: 'Cách phối áo blazer với quần jean',
    message: 'Em mới mua blazer đen, không biết phối với quần jean màu gì cho đẹp. Tư vấn giúp em.',
    status: 'replied',
  },
  {
    senderName: 'Cao Thị Như',
    senderEmail: 'nhuct@gmail.com',
    senderPhone: '0917888990',
    source: 'social',
    subject: 'Hệ thống Comforty có giảm giá sinh viên?',
    message:
      'Em là sinh viên Đại học Bách Khoa, shop có chương trình giảm giá cho sinh viên không?',
    status: 'new',
  },
  {
    senderName: 'Bạch Quang Vũ',
    senderEmail: 'vubq@gmail.com',
    senderPhone: '0918999001',
    source: 'web_contact',
    subject: 'Mua quà 8/3 cho mẹ tuổi 60',
    message:
      'Em muốn mua đầm/áo cho mẹ dịp 8/3 sắp tới, mẹ em 60 tuổi mặc size XL. Shop tư vấn vài lựa chọn giúp em.',
    status: 'new',
  },
  {
    senderName: 'Ngọc Tú',
    senderEmail: 'tuhuynh@gmail.com',
    senderPhone: '0919000112',
    source: 'social',
    subject: 'Theo dõi đơn ORD000123 ở đâu?',
    message: 'Em đặt đơn online cách đây 3 ngày, làm sao track được trạng thái giao hàng?',
    status: 'replied',
  },
  {
    senderName: 'Nông Văn Khải',
    senderEmail: 'khainv@yahoo.com',
    senderPhone: '0920111223',
    source: 'email',
    subject: 'Mở tài khoản doanh nghiệp',
    message:
      'Doanh nghiệp em muốn đặt hàng định kỳ cho nhân viên, có thể mở tài khoản B2B với hạn mức công nợ không?',
    status: 'new',
  },
  {
    senderName: 'Lê Thị Nga',
    senderEmail: 'ngalt@gmail.com',
    senderPhone: '0921222334',
    source: 'web_contact',
    subject: 'Khiếu nại thái độ nhân viên cửa hàng',
    message:
      'Hôm qua em ghé cửa hàng Q7, nhân viên thái độ không tốt. Em không muốn report formal, chỉ muốn shop biết để cải thiện.',
    status: 'replied',
  },
  {
    senderName: 'Trương Anh Khoa',
    senderEmail: 'khoata@gmail.com',
    senderPhone: '0922333445',
    source: 'phone',
    subject: 'Có thể đổi voucher hết hạn không?',
    message: 'Em có voucher 100k đã hết hạn 2 tuần. Có cách nào gia hạn hay đổi voucher mới không?',
    status: 'archived',
  },
  {
    senderName: 'Phạm Hoàng Nam',
    senderEmail: 'nampham@hotmail.com',
    senderPhone: '0923444556',
    source: 'web_contact',
    subject: 'Tìm áo dài cách tân cho lễ tốt nghiệp',
    message:
      'Em sắp tốt nghiệp đại học, cần áo dài cách tân màu trắng/be. Shop có mẫu nào phù hợp không?',
    status: 'new',
  },
];

function pseudoRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 2147483647;
    return s / 2147483647;
  };
}

// Pick a staff user that handles inquiries (HQ admin preferred).
function pickAssignee(idx: number): { id: string; name: string } | null {
  const hqStaff = USERS.filter((u) => u.assignments.some((a) => a.tenantId === 't-hq'));
  if (hqStaff.length === 0) return null;
  const picked = hqStaff[idx % hqStaff.length];
  if (!picked) return null;
  return { id: picked.id, name: picked.fullName };
}

function buildReplies(
  inquiryCode: string,
  status: InquiryStatus,
  createdAt: number,
  assignee: { id: string; name: string } | null,
): IInquiryReply[] {
  if (status === 'new' || !assignee) return [];

  const replies: IInquiryReply[] = [];
  const replyTexts = [
    'Cảm ơn anh/chị đã liên hệ. Em đã ghi nhận và sẽ phản hồi chi tiết qua email trong vòng 24h.',
    'Dạ thông tin anh/chị cần em đã gửi qua email. Anh/chị check inbox giúp em nhé.',
    'Em đã liên hệ qua điện thoại để tư vấn cụ thể hơn cho anh/chị.',
    'Em đã forward thông tin sang team kỹ thuật để xử lý.',
  ];

  const channels: IInquiryReply['channel'][] = ['email', 'phone'];

  replies.push({
    id: `${inquiryCode}-rp-1`,
    occurredAt: new Date(createdAt + 6 * 3600000).toISOString(),
    authorId: assignee.id,
    authorName: assignee.name,
    body: replyTexts[0] ?? 'Cảm ơn đã liên hệ.',
    channel: 'email',
  });

  // Some inquiries have a second follow-up
  const seedIdx = parseInt(inquiryCode.slice(-2), 10);
  if (seedIdx % 3 === 0) {
    replies.push({
      id: `${inquiryCode}-rp-2`,
      occurredAt: new Date(createdAt + 1.5 * day).toISOString(),
      authorId: assignee.id,
      authorName: assignee.name,
      body: replyTexts[1 + (seedIdx % 3)] ?? 'Em đã follow up.',
      channel: channels[seedIdx % channels.length] ?? 'email',
    });
  }

  return replies;
}

function buildInquiry(idx: number): IInquiry {
  const rand = pseudoRandom(idx * 4231 + 19);
  const seed = SEEDS[idx % SEEDS.length];
  if (!seed) throw new Error('No inquiry seed');

  const createdAt = NOW - (24 - idx) * day - Math.floor(rand() * day);
  const assignee = seed.status === 'new' ? null : pickAssignee(idx);
  const code = `IQ${String(idx + 1).padStart(4, '0')}`;
  const replies = buildReplies(code, seed.status, createdAt, assignee);
  const lastReply = replies[replies.length - 1];

  // Try to match an existing customer by email or phone.
  const matched = CUSTOMERS.find(
    (c) => c.email === seed.senderEmail || c.phone === seed.senderPhone,
  );

  return {
    id: `iq-${String(idx + 1).padStart(4, '0')}`,
    code,
    senderName: seed.senderName,
    senderEmail: seed.senderEmail,
    senderPhone: seed.senderPhone,
    source: seed.source,
    subject: seed.subject,
    message: seed.message,
    status: seed.status,
    assigneeId: assignee?.id ?? null,
    assigneeName: assignee?.name ?? null,
    matchedCustomerId: matched?.id ?? null,
    createdAt: new Date(createdAt).toISOString(),
    updatedAt: lastReply?.occurredAt ?? new Date(createdAt).toISOString(),
    repliedAt: lastReply?.occurredAt ?? null,
    replies,
  };
}

export const INQUIRIES: IInquiry[] = Array.from({ length: SEEDS.length }, (_, i) =>
  buildInquiry(i),
);

export function findInquiry(id: string): IInquiry | undefined {
  return INQUIRIES.find((i) => i.id === id);
}
