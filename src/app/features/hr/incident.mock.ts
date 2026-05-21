import { USERS } from '@/features/iam/iam.mock';
import { MOCK_TENANTS } from '@/core/tenant/tenant.mock';
import type {
  IIncident,
  IIncidentComment,
  IIncidentEvent,
  IncidentSeverity,
  IncidentStatus,
  IncidentType,
} from './incident.types';

interface Seed {
  type: IncidentType;
  severity: IncidentSeverity;
  title: string;
  description: string;
  location: string;
}

const SEEDS: Seed[] = [
  {
    type: 'equipment_failure',
    severity: 'high',
    title: 'POS terminal số 2 không kết nối được mạng',
    description:
      'Từ 9h sáng máy POS số 2 mất kết nối, không in được hoá đơn. Đã reboot router 2 lần nhưng không khắc phục.',
    location: 'Quầy thu ngân 2',
  },
  {
    type: 'theft_loss',
    severity: 'medium',
    title: 'Mất 2 áo polo size L trên kệ trưng bày',
    description: 'Kiểm tra tag chống trộm bị cắt, nghi vấn xảy ra trong ca chiều ngày 18/05.',
    location: 'Khu trưng bày tầng 1',
  },
  {
    type: 'customer_dispute',
    severity: 'medium',
    title: 'Khách tranh chấp về voucher hết hạn',
    description:
      'Khách hàng tên Nguyễn Văn A khiếu nại không cho dùng voucher VC-001 do hệ thống báo hết hạn nhưng khách nói chưa nhận thông báo.',
    location: 'Quầy thu ngân chính',
  },
  {
    type: 'safety',
    severity: 'low',
    title: 'Sàn ướt khu vực thử đồ chưa có biển cảnh báo',
    description: 'Sau khi vệ sinh sàn không đặt biển báo, suýt gây ngã cho khách hàng nữ.',
    location: 'Khu vực thử đồ nữ',
  },
  {
    type: 'cash_discrepancy',
    severity: 'high',
    title: 'Chênh lệch tiền mặt ca tối -480.000đ',
    description:
      'Két tiền cuối ca thiếu 480.000đ so với báo cáo POS. Đã đối chiếu nhưng chưa tìm ra nguyên nhân.',
    location: 'Két chính',
  },
  {
    type: 'security',
    severity: 'critical',
    title: 'Phát hiện camera CCTV khu vực kho đã bị tắt',
    description:
      'Bảo vệ ca đêm phát hiện camera kho B bị ngắt điện từ 22h. Cần kiểm tra ngay có mất mát gì không.',
    location: 'Kho B',
  },
  {
    type: 'equipment_failure',
    severity: 'medium',
    title: 'Máy in tem giá ngừng hoạt động',
    description: 'Máy in tem giá báo lỗi paper jam dù đã thay giấy. Cản trở việc đổi giá hàng.',
    location: 'Văn phòng kho',
  },
  {
    type: 'customer_dispute',
    severity: 'high',
    title: 'Khách yêu cầu đổi trả ngoài chính sách 30 ngày',
    description:
      'Khách mua từ tháng 03, đã quá hạn đổi trả 30 ngày, nhưng yêu cầu store manager xử lý ngoại lệ.',
    location: 'Quầy CSKH',
  },
  {
    type: 'safety',
    severity: 'high',
    title: 'Nhân viên trượt cầu thang khu kho',
    description: 'Bậc thang trơn, nhân viên Hoàng A bị bong gân chân. Đã sơ cứu tại chỗ.',
    location: 'Cầu thang kho',
  },
  {
    type: 'theft_loss',
    severity: 'critical',
    title: 'Mất nguyên thùng giày sneaker trong kho',
    description:
      'Kiểm kê thấy mất 1 thùng (12 đôi) giày sneaker model SN-2025. Đã báo cảnh sát khu vực.',
    location: 'Kho A2',
  },
  {
    type: 'cash_discrepancy',
    severity: 'low',
    title: 'Lẻ tiền ca sáng dư 25.000đ',
    description: 'Két ca sáng dư 25.000đ. Có thể do quên trả lại tiền lẻ cho khách.',
    location: 'Quầy thu ngân 1',
  },
  {
    type: 'equipment_failure',
    severity: 'critical',
    title: 'Hệ thống điều hoà tầng 2 hỏng hoàn toàn',
    description:
      'Toàn bộ hệ thống AC tầng 2 không hoạt động, nhiệt độ lên 33°C. Ảnh hưởng nghiêm trọng tới khách.',
    location: 'Tầng 2',
  },
  {
    type: 'customer_dispute',
    severity: 'low',
    title: 'Khách phàn nàn nhân viên không nhiệt tình',
    description: 'Khách hàng feedback nhân viên ca tối thái độ thiếu nhiệt tình khi tư vấn.',
    location: 'Khu vực bán hàng',
  },
  {
    type: 'security',
    severity: 'medium',
    title: 'Cửa sau kho không khoá sau giờ làm',
    description:
      'Bảo vệ kiểm tra phát hiện cửa sau kho không khoá 2 đêm liên tiếp. Cần nhắc nhở ca đóng cửa.',
    location: 'Cửa sau kho',
  },
  {
    type: 'safety',
    severity: 'medium',
    title: 'Bình PCCC quá hạn kiểm định',
    description: '3 bình bột PCCC tầng 1 đã quá hạn kiểm định 2 tháng. Cần thay/kiểm định ngay.',
    location: 'Tầng 1',
  },
  {
    type: 'theft_loss',
    severity: 'low',
    title: 'Thiếu 1 hộp phụ kiện trong lô nhận hàng',
    description: 'Phiếu giao 50 hộp phụ kiện, đếm thực tế 49. Đã ghi nhận với supplier.',
    location: 'Khu vực nhận hàng',
  },
  {
    type: 'other',
    severity: 'low',
    title: 'Wifi khách hàng yếu, nhiều khách phàn nàn',
    description: 'Wifi public khu thử đồ tín hiệu yếu. Nhiều khách live stream không được.',
    location: 'Toàn store',
  },
  {
    type: 'cash_discrepancy',
    severity: 'medium',
    title: 'Phát hiện 2 tờ 500k nghi giả trong két',
    description:
      'Cuối ca phát hiện 2 tờ 500k có dấu hiệu giả. Đã giữ riêng để bàn giao quản lý kiểm tra.',
    location: 'Két chính',
  },
  {
    type: 'equipment_failure',
    severity: 'low',
    title: 'Đèn LED khu mannequin nhấp nháy',
    description: 'Đèn LED chiếu sáng mannequin nhấp nháy không ổn định, có thể cháy bóng.',
    location: 'Khu trưng bày cửa kính',
  },
  {
    type: 'security',
    severity: 'high',
    title: 'Báo động cửa thoát hiểm vang lúc 23h',
    description:
      'Hệ thống báo động cửa thoát hiểm tầng 2 vang giữa đêm. Bảo vệ kiểm tra không thấy gì lạ.',
    location: 'Cửa thoát hiểm tầng 2',
  },
  {
    type: 'customer_dispute',
    severity: 'medium',
    title: 'Khách yêu cầu hoàn tiền do sản phẩm lỗi may',
    description: 'Khách mua áo thun, về phát hiện đường may bị bung. Yêu cầu hoàn 100%.',
    location: 'Quầy CSKH',
  },
  {
    type: 'safety',
    severity: 'low',
    title: 'Kệ trưng bày tầng 1 lung lay',
    description: 'Kệ trưng bày khu áo nam tầng 1 lung lay khi chạm vào. Cần siết lại bulông.',
    location: 'Khu áo nam tầng 1',
  },
  {
    type: 'theft_loss',
    severity: 'high',
    title: 'Phát hiện khách đút giấu phụ kiện vào túi',
    description: 'Camera ghi nhận khách nữ trẻ đút 1 vòng tay vào túi xách. Bảo vệ đã can thiệp.',
    location: 'Khu phụ kiện tầng 1',
  },
  {
    type: 'other',
    severity: 'medium',
    title: 'Mất điện toàn store 15 phút',
    description: 'Lưới điện khu vực mất 15 phút, ảnh hưởng giao dịch POS.',
    location: 'Toàn store',
  },
  {
    type: 'equipment_failure',
    severity: 'medium',
    title: 'Máy quẹt thẻ chấm công bị treo',
    description: 'Máy chấm công vân tay bị treo 2 lần trong ca. Phải reboot mới chạy lại.',
    location: 'Cửa nhân viên',
  },
  {
    type: 'customer_dispute',
    severity: 'critical',
    title: 'Khách to tiếng tại quầy CSKH về việc đổi size',
    description:
      'Khách hàng VIP to tiếng tại quầy CSKH yêu cầu đổi size dù đã quá thời gian. Đã can thiệp hạ nhiệt.',
    location: 'Quầy CSKH',
  },
  {
    type: 'cash_discrepancy',
    severity: 'high',
    title: 'POS treo, đã rút tiền của khách mà không in hoá đơn',
    description:
      'POS treo giữa giao dịch, đã trừ tiền khách nhưng không in được hoá đơn. Cần đối soát giao dịch ngân hàng.',
    location: 'Quầy thu ngân 3',
  },
  {
    type: 'security',
    severity: 'low',
    title: 'Camera góc khu thử đồ bị bụi che',
    description: 'Camera góc trên khu thử đồ nữ bị bụi che, hình ảnh mờ. Cần vệ sinh.',
    location: 'Khu thử đồ nữ',
  },
  {
    type: 'safety',
    severity: 'medium',
    title: 'Ổ điện khu cashier có dấu hiệu cháy nổ',
    description: 'Ổ điện cấp cho POS cashier có vết xém, mùi nhựa cháy. Đã ngắt nguồn.',
    location: 'Quầy thu ngân 1',
  },
  {
    type: 'other',
    severity: 'low',
    title: 'Mùi cống bốc lên khu vệ sinh',
    description: 'Khách phàn nàn mùi cống khu vệ sinh tầng 1. Cần gọi vệ sinh thông cống.',
    location: 'WC tầng 1',
  },
];

const NOW = new Date();

function addDays(d: Date, days: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + days);
  return out;
}

function pickStatus(idx: number): IncidentStatus {
  const mod = idx % 12;
  if (mod < 3) return 'reported';
  if (mod < 5) return 'acknowledged';
  if (mod < 7) return 'investigating';
  if (mod < 10) return 'resolved';
  if (mod < 11) return 'closed';
  return 'cancelled';
}

function tenantId(idx: number): string {
  // Skip HQ for store incidents (1..end), HQ for 'other' general issues sometimes.
  const stores = MOCK_TENANTS.filter((t) => t.type !== 'hq');
  return stores[idx % stores.length].id;
}

function reporter(idx: number): string {
  return USERS[idx % USERS.length].id;
}

function assignee(idx: number, status: IncidentStatus): string | null {
  if (status === 'reported') return null;
  return USERS[(idx + 3) % USERS.length].id;
}

function generate(seed: Seed, idx: number): IIncident {
  const status = pickStatus(idx);
  const createdAt = addDays(NOW, -1 * (idx * 2 + 1));
  const occurredAt = addDays(createdAt, -1 * (idx % 2));
  const events: IIncidentEvent[] = [
    {
      id: `inc-${idx}-evt-1`,
      occurredAt: createdAt.toISOString(),
      actorId: reporter(idx),
      kind: 'created',
    },
  ];
  const a = assignee(idx, status);
  if (a) {
    events.push({
      id: `inc-${idx}-evt-2`,
      occurredAt: addDays(createdAt, 1).toISOString(),
      actorId: a,
      kind: 'assigned',
    });
  }
  let resolvedAt: string | null = null;
  let resolvedBy: string | null = null;
  let resolutionNote: string | null = null;
  if (status === 'resolved' || status === 'closed') {
    resolvedAt = addDays(createdAt, 3 + (idx % 3)).toISOString();
    resolvedBy = a;
    resolutionNote = 'Đã xử lý theo quy trình. Theo dõi thêm 7 ngày.';
    events.push({
      id: `inc-${idx}-evt-3`,
      occurredAt: resolvedAt,
      actorId: a ?? reporter(idx),
      kind: 'resolved',
      note: resolutionNote,
    });
  }
  if (status === 'closed' && resolvedAt) {
    events.push({
      id: `inc-${idx}-evt-4`,
      occurredAt: addDays(new Date(resolvedAt), 1).toISOString(),
      actorId: a ?? reporter(idx),
      kind: 'closed',
    });
  }
  if (status === 'cancelled') {
    events.push({
      id: `inc-${idx}-evt-3`,
      occurredAt: addDays(createdAt, 1).toISOString(),
      actorId: reporter(idx),
      kind: 'cancelled',
      note: 'Báo nhầm.',
    });
  }

  const comments: IIncidentComment[] =
    idx % 3 === 0
      ? [
          {
            id: `inc-${idx}-cmt-1`,
            authorId: reporter(idx),
            body: 'Đính kèm thêm thông tin: đã chụp ảnh hiện trường.',
            createdAt: addDays(createdAt, 0.5).toISOString(),
          },
        ]
      : [];

  const escalationLevel = seed.severity === 'critical' ? 2 : 1;

  return {
    id: `inc-${String(idx + 1).padStart(3, '0')}`,
    code: `INC-2026-${String(idx + 1).padStart(4, '0')}`,
    tenantId: tenantId(idx),
    type: seed.type,
    severity: seed.severity,
    status,
    title: seed.title,
    description: seed.description,
    occurredAt: occurredAt.toISOString(),
    location: seed.location,
    reporterId: reporter(idx),
    assigneeId: a,
    escalationLevel,
    attachments: [],
    resolutionNote,
    resolvedAt,
    resolvedBy,
    createdAt: createdAt.toISOString(),
    updatedAt: (resolvedAt ? new Date(resolvedAt) : createdAt).toISOString(),
    comments,
    events,
  };
}

export const INCIDENTS: IIncident[] = SEEDS.map((s, idx) => generate(s, idx));

export function findIncident(id: string): IIncident | undefined {
  return INCIDENTS.find((i) => i.id === id);
}
