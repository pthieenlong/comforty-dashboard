import { type IPermission, type IRole, type IUser, type PermissionAction } from './iam.types';

const RESOURCES = [
  { key: 'user', label: 'Người dùng' },
  { key: 'role', label: 'Vai trò' },
  { key: 'tenant', label: 'Chi nhánh' },
  { key: 'product', label: 'Sản phẩm' },
  { key: 'category', label: 'Danh mục' },
  { key: 'order', label: 'Đơn hàng' },
  { key: 'customer', label: 'Khách hàng' },
  { key: 'inventory', label: 'Kho' },
  { key: 'promotion', label: 'Khuyến mãi' },
  { key: 'audit', label: 'Audit log' },
] as const;

const ACTIONS: PermissionAction[] = ['create', 'read', 'update', 'delete'];
const ACTION_LABEL: Record<PermissionAction, string> = {
  create: 'Tạo mới',
  read: 'Xem',
  update: 'Cập nhật',
  delete: 'Xóa',
};

export const RESOURCE_LIST = RESOURCES;
export const ACTION_LIST = ACTIONS;
export const ACTION_LABELS = ACTION_LABEL;

export const PERMISSIONS: IPermission[] = RESOURCES.flatMap(({ key, label }) =>
  ACTIONS.map(
    (action): IPermission => ({
      id: `${key}:${action}`,
      resource: key,
      action,
      description: `${ACTION_LABEL[action]} ${label.toLowerCase()}`,
    }),
  ),
);

const allPermissionIds = PERMISSIONS.map((p) => p.id);
const readOnlyPermissions = PERMISSIONS.filter((p) => p.action === 'read').map((p) => p.id);
const orderManagement = PERMISSIONS.filter((p) =>
  ['order', 'customer', 'product'].includes(p.resource),
).map((p) => p.id);
const productOnly = PERMISSIONS.filter((p) => p.resource === 'product').map((p) => p.id);
const inventoryOps = PERMISSIONS.filter((p) => ['inventory', 'product'].includes(p.resource)).map(
  (p) => p.id,
);

export const ROLES: IRole[] = [
  {
    id: 'role-super-admin',
    name: 'Super Admin',
    description: 'Toàn quyền hệ thống, chỉ HQ team được gán.',
    permissionIds: allPermissionIds,
    isSystem: true,
  },
  {
    id: 'role-hq-admin',
    name: 'HQ Admin',
    description: 'Quản trị viên trụ sở chính, quản lý tất cả tenant.',
    permissionIds: allPermissionIds.filter((id) => !id.startsWith('role:')),
    isSystem: true,
  },
  {
    id: 'role-store-manager',
    name: 'Store Manager',
    description: 'Quản lý chi nhánh, đầy đủ quyền vận hành tại store.',
    permissionIds: [
      ...orderManagement,
      ...inventoryOps,
      'promotion:read',
      'promotion:update',
      'user:read',
    ],
    isSystem: false,
  },
  {
    id: 'role-sales-lead',
    name: 'Sales Lead',
    description: 'Trưởng nhóm bán hàng, quản lý đội ngũ và đơn hàng.',
    permissionIds: [...orderManagement, 'customer:create', 'user:read'],
    isSystem: false,
  },
  {
    id: 'role-cashier',
    name: 'Thu ngân',
    description: 'Tạo đơn POS, xem khách hàng.',
    permissionIds: [
      'order:create',
      'order:read',
      'customer:read',
      'customer:create',
      'product:read',
    ],
    isSystem: false,
  },
  {
    id: 'role-inventory-clerk',
    name: 'Nhân viên kho',
    description: 'Nhập/xuất/kiểm kê kho hàng.',
    permissionIds: inventoryOps,
    isSystem: false,
  },
  {
    id: 'role-marketing',
    name: 'Marketing',
    description: 'Quản lý khuyến mãi và voucher.',
    permissionIds: [
      'promotion:create',
      'promotion:read',
      'promotion:update',
      'promotion:delete',
      'customer:read',
      'product:read',
    ],
    isSystem: false,
  },
  {
    id: 'role-auditor',
    name: 'Auditor',
    description: 'Chỉ xem audit log và báo cáo, không can thiệp dữ liệu.',
    permissionIds: [...readOnlyPermissions, 'audit:read'],
    isSystem: false,
  },
  {
    id: 'role-cs-manager',
    name: 'Customer Service Manager',
    description: 'Quản lý team CSKH tại chi nhánh, duyệt yêu cầu hỗ trợ.',
    permissionIds: ['customer:read', 'customer:update', 'order:read', 'user:read'],
    isSystem: false,
  },
  {
    id: 'role-cs-staff',
    name: 'Customer Service Staff',
    description: 'Nhân viên CSKH xử lý yêu cầu khách hàng.',
    permissionIds: ['customer:read', 'order:read'],
    isSystem: false,
  },
  {
    id: 'role-staff',
    name: 'Nhân viên',
    description: 'Vai trò mặc định cho nhân viên mới.',
    permissionIds: [...productOnly.filter((p) => p.endsWith(':read')), 'order:read'],
    isSystem: false,
  },
];

const TENANTS = [
  { id: 'tenant-hq', name: 'HQ — Trụ sở chính' },
  { id: 'tenant-q1', name: 'Chi nhánh Quận 1' },
  { id: 'tenant-q7', name: 'Chi nhánh Quận 7' },
  { id: 'tenant-td', name: 'Chi nhánh Thủ Đức' },
  { id: 'tenant-hk', name: 'Chi nhánh Hoàn Kiếm' },
  { id: 'tenant-hc', name: 'Chi nhánh Hải Châu' },
];

export const TENANT_LIST = TENANTS;

const VIETNAMESE_NAMES = [
  'Phạm Thiện Long',
  'Nguyễn Minh Anh',
  'Trần Thị Hồng',
  'Lê Quốc Bảo',
  'Hoàng Thu Hà',
  'Đặng Văn Đạt',
  'Vũ Thị Lan',
  'Bùi Hữu Nam',
  'Phan Mỹ Linh',
  'Đỗ Quang Huy',
  'Hồ Thị Diệu',
  'Ngô Bá Thành',
  'Lý Thuỳ Dương',
  'Cao Hoàng Vũ',
  'Dương Khánh Vy',
  'Mai Quốc Cường',
  'Tô Diệu Linh',
  'Lâm Tuấn Kiệt',
  'Đinh Thanh Tùng',
  'Tạ Minh Châu',
  'Quách Phương Thảo',
  'Trương Đức Mạnh',
  'Võ Thị Kim',
  'Châu Hoàng Long',
  'Tống Thị Yến',
  'Lê Anh Quân',
  'Nguyễn Hà My',
  'Phùng Đăng Khoa',
];

function emailFromName(name: string, idx: number): string {
  const ascii = name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, 'd')
    .replace(/\s+/g, '.')
    .toLowerCase();
  return `${ascii}${idx + 1}@comforty.vn`;
}

function pickRole(idx: number): string {
  const roleIds = [
    'role-super-admin',
    'role-hq-admin',
    'role-store-manager',
    'role-sales-lead',
    'role-cashier',
    'role-inventory-clerk',
    'role-marketing',
    'role-auditor',
    'role-cs-manager',
    'role-cs-staff',
    'role-staff',
  ];
  if (idx === 0) return 'role-super-admin';
  if (idx === 1 || idx === 2) return 'role-hq-admin';
  return roleIds[(idx % (roleIds.length - 3)) + 2];
}

export const USERS: IUser[] = VIETNAMESE_NAMES.map((name, idx) => {
  const phoneTail = String(10000000 + idx * 13)
    .padStart(8, '0')
    .slice(-8);
  const primaryTenant = TENANTS[(idx % (TENANTS.length - 1)) + 1];
  const roleId = pickRole(idx);
  const isHq = roleId === 'role-super-admin' || roleId === 'role-hq-admin';

  return {
    id: `user-${String(idx + 1).padStart(3, '0')}`,
    email: emailFromName(name, idx),
    fullName: name,
    phone: `09${phoneTail}`,
    avatar: null,
    active: idx % 11 !== 5,
    lastLoginAt:
      idx % 7 === 0 ? null : new Date(Date.now() - idx * 1000 * 60 * 60 * 6).toISOString(),
    createdAt: new Date(2025, 0, 1 + idx).toISOString(),
    assignments: isHq
      ? [{ tenantId: TENANTS[0].id, tenantName: TENANTS[0].name, roleIds: [roleId] }]
      : [
          {
            tenantId: primaryTenant.id,
            tenantName: primaryTenant.name,
            roleIds: [roleId],
          },
          ...(idx % 9 === 0
            ? [
                {
                  tenantId: TENANTS[(idx % (TENANTS.length - 2)) + 1].id,
                  tenantName: TENANTS[(idx % (TENANTS.length - 2)) + 1].name,
                  roleIds: ['role-staff'],
                },
              ]
            : []),
        ],
  };
});

export function findUser(id: string): IUser | undefined {
  return USERS.find((u) => u.id === id);
}

export function findRole(id: string): IRole | undefined {
  return ROLES.find((r) => r.id === id);
}

export function findPermission(id: string): IPermission | undefined {
  return PERMISSIONS.find((p) => p.id === id);
}

export function getResourceLabel(resourceKey: string): string {
  return RESOURCES.find((r) => r.key === resourceKey)?.label ?? resourceKey;
}
