import { USERS } from '@/features/iam/iam.mock';
import { ORDERS } from '@/features/order/order.mock';
import { CUSTOMERS } from './customer.mock';
import type {
  EscalationLevel,
  ITicket,
  ITicketComment,
  ITicketEvent,
  ITicketLineItem,
  TicketPriority,
  TicketStatus,
  TicketType,
} from './ticket.types';

const day = 86400000;
const NOW = new Date('2026-05-20T10:00:00Z').getTime();

interface TicketSeed {
  type: TicketType;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  // Tickets are seeded with deterministic data so usage stats stay stable.
}

const SEEDS: TicketSeed[] = [
  {
    type: 'exchange',
    subject: 'Đổi size áo polo từ M sang L',
    description:
      'Áo mặc hơi chật, em muốn đổi sang size L. Vẫn giữ màu đen và kiểu dáng như cũ. Đã có hoá đơn đính kèm.',
    status: 'in_progress',
    priority: 'medium',
  },
  {
    type: 'return',
    subject: 'Trả áo khoác bị lỗi đường may',
    description:
      'Áo khoác có đường may bị bung ở vai phải. Yêu cầu trả hàng và hoàn tiền vào số tài khoản đã đăng ký.',
    status: 'open',
    priority: 'high',
  },
  {
    type: 'complaint',
    subject: 'Nhân viên Q1 không tư vấn nhiệt tình',
    description:
      'Tôi vào cửa hàng Q1 tuần trước, nhân viên không chú ý tư vấn dù tôi hỏi nhiều lần. Cảm thấy không được tôn trọng.',
    status: 'resolved',
    priority: 'high',
  },
  {
    type: 'inquiry',
    subject: 'Hỏi về bảng size đầm midi',
    description:
      'Em cao 1m58 nặng 50kg, không biết nên chọn size S hay M cho đầm midi mã DM-2026? Cảm ơn shop.',
    status: 'closed',
    priority: 'low',
  },
  {
    type: 'exchange',
    subject: 'Đổi màu áo thun từ trắng sang đen',
    description:
      'Áo trắng mặc dễ bẩn, muốn đổi sang màu đen cùng size. Nhận tại cửa hàng được không?',
    status: 'pending_customer',
    priority: 'low',
  },
  {
    type: 'return',
    subject: 'Sản phẩm khác xa hình ảnh quảng cáo',
    description:
      'Đặt online quần jean nhưng nhận được khác hoàn toàn — màu nhạt hơn, vải mỏng. Yêu cầu trả hàng.',
    status: 'open',
    priority: 'high',
  },
  {
    type: 'complaint',
    subject: 'Giao hàng chậm 5 ngày so với hẹn',
    description: 'Đơn dự kiến nhận thứ 2 nhưng tới thứ 7 mới giao. Khá thất vọng với dịch vụ.',
    status: 'resolved',
    priority: 'medium',
  },
  {
    type: 'inquiry',
    subject: 'Có chương trình khuyến mãi cho ngày 20/10 không?',
    description:
      'Em muốn mua tặng mẹ dịp 20/10, shop có voucher hay khuyến mãi đặc biệt cho mặt hàng đầm/áo dài không?',
    status: 'closed',
    priority: 'low',
  },
  {
    type: 'exchange',
    subject: 'Đổi đầm midi sang đầm maxi',
    description:
      'Vừa nhận đầm midi nhưng cảm thấy chưa phù hợp dáng người. Muốn đổi sang maxi cùng giá.',
    status: 'cancelled',
    priority: 'low',
  },
  {
    type: 'return',
    subject: 'Trả áo thun bị nhăn nhiều sau lần giặt đầu',
    description: 'Áo nhăn nhiều dù giặt nhẹ. Mặt trong có vết ố vàng. Yêu cầu trả + hoàn tiền.',
    status: 'in_progress',
    priority: 'high',
  },
  {
    type: 'complaint',
    subject: 'Đóng gói cẩu thả, hộp bị móp',
    description:
      'Khi nhận hàng thấy hộp bên ngoài bị móp, may là sản phẩm bên trong còn nguyên. Đề nghị shop cải thiện đóng gói.',
    status: 'closed',
    priority: 'medium',
  },
  {
    type: 'inquiry',
    subject: 'Còn size XL cho áo sơ mi trắng không?',
    description: 'Online hết size XL, ở cửa hàng nào còn không shop?',
    status: 'open',
    priority: 'medium',
  },
  {
    type: 'exchange',
    subject: 'Đổi quần jean lỗi từ size 30 sang 32',
    description: 'Quần jean size 30 hơi chật eo. Đổi sang 32, cùng màu xanh đậm.',
    status: 'in_progress',
    priority: 'medium',
  },
  {
    type: 'return',
    subject: 'Đầm bị rách khi mở hộp',
    description: 'Vừa mở hộp đã thấy đầm bị rách ở phần đường may eo. Yêu cầu trả ngay lập tức.',
    status: 'resolved',
    priority: 'urgent',
  },
  {
    type: 'complaint',
    subject: 'Bị tính sai giá khi thanh toán POS',
    description:
      'Tại quầy nhân viên báo giá 350k nhưng khi quẹt thẻ là 380k. Đề nghị kiểm tra và hoàn 30k chênh lệch.',
    status: 'pending_customer',
    priority: 'urgent',
  },
  {
    type: 'inquiry',
    subject: 'Thời gian giao hàng đến Đà Lạt mất bao lâu?',
    description: 'Em ở Đà Lạt, nếu đặt hôm nay thì khi nào nhận được?',
    status: 'closed',
    priority: 'low',
  },
  {
    type: 'exchange',
    subject: 'Đổi áo polo từ XL sang L',
    description: 'Áo XL hơi rộng. Đổi xuống L. Đã giữ tag và hoá đơn.',
    status: 'open',
    priority: 'low',
  },
  {
    type: 'return',
    subject: 'Trả nguyên đơn 3 sản phẩm — không hợp ý',
    description:
      'Mua 3 áo cho chồng nhưng anh không thích. Yêu cầu trả nguyên đơn và hoàn tiền theo phương thức ban đầu.',
    status: 'in_progress',
    priority: 'medium',
  },
  {
    type: 'complaint',
    subject: 'Khuyến mãi SUMMER25 không áp dụng được tại POS',
    description:
      'Đến cửa hàng dùng mã SUMMER25 thì nhân viên báo không hỗ trợ áp dụng tại quầy. Trên web/social lại quảng cáo áp dụng mọi nơi.',
    status: 'open',
    priority: 'urgent',
  },
  {
    type: 'inquiry',
    subject: 'Có dịch vụ may đo riêng cho áo vest không?',
    description:
      'Em cần may vest cưới, kích thước hơi đặc biệt. Có dịch vụ đo và may riêng không shop?',
    status: 'in_progress',
    priority: 'medium',
  },
  {
    type: 'exchange',
    subject: 'Đổi từ áo khoác bomber sang áo blazer',
    description:
      'Bomber không phù hợp dáng. Em muốn đổi sang blazer giá tương đương. Bù tiền nếu chênh.',
    status: 'pending_customer',
    priority: 'low',
  },
  {
    type: 'return',
    subject: 'Trả phụ kiện thắt lưng — màu sai',
    description: 'Đặt thắt lưng nâu nhưng nhận màu đen. Yêu cầu trả hàng và đổi đúng màu.',
    status: 'resolved',
    priority: 'medium',
  },
  {
    type: 'complaint',
    subject: 'Chương trình tích điểm cộng sai',
    description:
      'Đơn 1tr2 mà chỉ tích 80 điểm, theo bảng tier Gold phải là 180 điểm. Đề nghị kiểm tra và cộng bù.',
    status: 'closed',
    priority: 'high',
  },
  {
    type: 'inquiry',
    subject: 'Có thể đổi voucher tích điểm thành tiền mặt?',
    description: 'Em có voucher 200k chưa dùng, có thể đổi thành tiền mặt khi tới cửa hàng không?',
    status: 'closed',
    priority: 'low',
  },
];

function pseudoRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 2147483647;
    return s / 2147483647;
  };
}

// Pick a staff user with assignment to the given tenant; HQ users always qualify.
function staffForTenant(tenantId: string, idx: number): { id: string; name: string } | null {
  const candidates = USERS.filter((u) =>
    u.assignments.some((a) => a.tenantId === tenantId || a.tenantId === 't-hq'),
  );
  if (candidates.length === 0) return null;
  const picked = candidates[idx % candidates.length];
  if (!picked) return null;
  return { id: picked.id, name: picked.fullName };
}

function buildItems(
  type: TicketType,
  customerIdx: number,
  rand: () => number,
): {
  tenantId: string | null;
  items: ITicketLineItem[];
  orderId: string | null;
  orderCode: string | null;
} {
  const customer = CUSTOMERS[customerIdx % CUSTOMERS.length];
  if (!customer) return { tenantId: null, items: [], orderId: null, orderCode: null };
  const order = ORDERS.find((o) => o.customerId === customer.id);
  if (!order || type === 'inquiry') {
    return {
      tenantId: customer.defaultTenantId,
      items: [],
      orderId: null,
      orderCode: null,
    };
  }
  const lineCount = Math.min(order.items.length, type === 'complaint' ? 1 : 2);
  const items: ITicketLineItem[] = order.items.slice(0, lineCount).map((it) => ({
    orderItemId: it.id,
    productId: it.productId,
    productName: it.productName,
    variantSku: it.variantSku,
    variantLabel: it.variantLabel,
    quantity: type === 'return' ? it.quantity : 1,
    reason: type === 'exchange' ? 'Đổi size' : type === 'return' ? 'Không phù hợp' : 'Khiếu nại',
    targetVariantSku:
      type === 'exchange' && rand() < 0.7 ? it.variantSku.replace(/\d$/, '') + 'L' : null,
  }));
  return {
    tenantId: order.tenantId,
    items,
    orderId: order.id,
    orderCode: order.code,
  };
}

function buildComments(
  ticketCode: string,
  customer: { id: string; fullName: string },
  staff: { id: string; name: string } | null,
  status: TicketStatus,
  createdAt: number,
): ITicketComment[] {
  const comments: ITicketComment[] = [];
  // Customer always opens with the description (separate from comments).
  if (status === 'open') return comments;

  // First staff reply
  if (staff) {
    comments.push({
      id: `${ticketCode}-cmt-1`,
      occurredAt: new Date(createdAt + 2 * 3600000).toISOString(),
      authorId: staff.id,
      authorName: staff.name,
      authorType: 'staff',
      body: 'Em đã tiếp nhận yêu cầu của anh/chị. Sẽ kiểm tra và phản hồi trong vòng 24h.',
      internal: false,
    });
    // Internal note
    comments.push({
      id: `${ticketCode}-cmt-2`,
      occurredAt: new Date(createdAt + 2.5 * 3600000).toISOString(),
      authorId: staff.id,
      authorName: staff.name,
      authorType: 'staff',
      body: 'Note nội bộ: cần kiểm tra hàng còn không trước khi confirm với khách.',
      internal: true,
    });
  }

  if (status === 'in_progress' || status === 'pending_customer') {
    comments.push({
      id: `${ticketCode}-cmt-3`,
      occurredAt: new Date(createdAt + 1 * day).toISOString(),
      authorId: customer.id,
      authorName: customer.fullName,
      authorType: 'customer',
      body: 'Cảm ơn shop. Mong shop xử lý sớm giúp em.',
      internal: false,
    });
  }

  if (status === 'resolved' || status === 'closed') {
    if (staff) {
      comments.push({
        id: `${ticketCode}-cmt-3`,
        occurredAt: new Date(createdAt + 2 * day).toISOString(),
        authorId: staff.id,
        authorName: staff.name,
        authorType: 'staff',
        body: 'Em đã xử lý xong yêu cầu. Anh/chị vui lòng kiểm tra và phản hồi nếu có vấn đề.',
        internal: false,
      });
    }
    if (status === 'closed') {
      comments.push({
        id: `${ticketCode}-cmt-4`,
        occurredAt: new Date(createdAt + 3 * day).toISOString(),
        authorId: customer.id,
        authorName: customer.fullName,
        authorType: 'customer',
        body: 'Em đã nhận được hàng đổi/hoàn tiền. Cảm ơn shop nhiều!',
        internal: false,
      });
    }
  }
  return comments;
}

function buildEvents(
  ticketCode: string,
  status: TicketStatus,
  createdAt: number,
  createdBy: string,
  assignee: { id: string; name: string } | null,
  escalationLevel: EscalationLevel,
): ITicketEvent[] {
  const events: ITicketEvent[] = [
    {
      id: `${ticketCode}-evt-1`,
      occurredAt: new Date(createdAt).toISOString(),
      action: 'created',
      actor: createdBy,
      details: 'Khách hàng tạo yêu cầu',
    },
  ];
  if (assignee && status !== 'open') {
    events.push({
      id: `${ticketCode}-evt-2`,
      occurredAt: new Date(createdAt + 2 * 3600000).toISOString(),
      action: 'assigned',
      actor: 'Hệ thống',
      details: `Giao cho ${assignee.name}`,
    });
    events.push({
      id: `${ticketCode}-evt-3`,
      occurredAt: new Date(createdAt + 2 * 3600000).toISOString(),
      action: 'status_changed',
      actor: assignee.name,
      details: 'Mới → Đang xử lý',
    });
  }
  if (escalationLevel > 1) {
    events.push({
      id: `${ticketCode}-evt-esc`,
      occurredAt: new Date(createdAt + 12 * 3600000).toISOString(),
      action: 'escalated',
      actor: assignee?.name ?? 'Staff',
      details: `Escalate lên cấp ${escalationLevel}`,
    });
  }
  if (status === 'pending_customer') {
    events.push({
      id: `${ticketCode}-evt-pc`,
      occurredAt: new Date(createdAt + 1 * day).toISOString(),
      action: 'status_changed',
      actor: assignee?.name ?? 'Staff',
      details: 'Đang xử lý → Chờ khách hàng',
    });
  }
  if (status === 'resolved' || status === 'closed') {
    events.push({
      id: `${ticketCode}-evt-res`,
      occurredAt: new Date(createdAt + 2 * day).toISOString(),
      action: 'resolved',
      actor: assignee?.name ?? 'Staff',
      details: 'Đã xử lý xong',
    });
  }
  if (status === 'closed') {
    events.push({
      id: `${ticketCode}-evt-closed`,
      occurredAt: new Date(createdAt + 3 * day).toISOString(),
      action: 'status_changed',
      actor: 'Hệ thống',
      details: 'Đã xử lý → Đã đóng',
    });
  }
  if (status === 'cancelled') {
    events.push({
      id: `${ticketCode}-evt-cancel`,
      occurredAt: new Date(createdAt + 1 * day).toISOString(),
      action: 'status_changed',
      actor: 'Khách hàng',
      details: 'Khách hủy yêu cầu',
    });
  }
  return events;
}

function buildTicket(idx: number): ITicket {
  const rand = pseudoRandom(idx * 5807 + 23);
  const seed = SEEDS[idx % SEEDS.length] ?? SEEDS[0];
  if (!seed) throw new Error('No ticket seed');
  const customer = CUSTOMERS[idx % CUSTOMERS.length];
  if (!customer) throw new Error('No customer');

  const { tenantId, items, orderId, orderCode } = buildItems(seed.type, idx, rand);
  const finalTenantId = tenantId ?? customer.defaultTenantId;
  const assignee = seed.status === 'open' ? null : staffForTenant(finalTenantId, idx);
  const escalationLevel: EscalationLevel =
    seed.priority === 'urgent' && rand() < 0.5 ? 2 : seed.priority === 'urgent' ? 1 : 1;

  const createdAt = NOW - (60 - idx) * day - Math.floor(rand() * day);
  const code = `TK${String(idx + 1).padStart(4, '0')}`;
  const events = buildEvents(
    code,
    seed.status,
    createdAt,
    customer.fullName,
    assignee,
    escalationLevel,
  );
  const comments = buildComments(code, customer, assignee, seed.status, createdAt);

  const lastEvent = events[events.length - 1];
  const resolvedEvent = events.find((e) => e.action === 'resolved');
  const closedEvent = events.find(
    (e) => e.action === 'status_changed' && e.details.includes('Đã đóng'),
  );

  return {
    id: `tk-${String(idx + 1).padStart(4, '0')}`,
    code,
    type: seed.type,
    status: seed.status,
    priority: seed.priority,
    subject: seed.subject,
    description: seed.description,
    tenantId: finalTenantId,
    customerId: customer.id,
    customerName: customer.fullName,
    customerPhone: customer.phone,
    customerEmail: customer.email,
    orderId,
    orderCode,
    items,
    assigneeId: assignee?.id ?? null,
    assigneeName: assignee?.name ?? null,
    escalationLevel,
    createdAt: new Date(createdAt).toISOString(),
    createdBy: customer.fullName,
    updatedAt: lastEvent?.occurredAt ?? new Date(createdAt).toISOString(),
    resolvedAt: resolvedEvent?.occurredAt ?? null,
    closedAt: closedEvent?.occurredAt ?? null,
    comments,
    events,
  };
}

export const TICKETS: ITicket[] = Array.from({ length: 60 }, (_, i) => buildTicket(i));

export function findTicket(id: string): ITicket | undefined {
  return TICKETS.find((t) => t.id === id);
}

export function findTicketsByCustomer(customerId: string): ITicket[] {
  return TICKETS.filter((t) => t.customerId === customerId);
}

export function findTicketsByOrder(orderId: string): ITicket[] {
  return TICKETS.filter((t) => t.orderId === orderId);
}
