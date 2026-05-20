import {
  LucideArchive,
  LucideBarChart3,
  LucideBoxes,
  LucideBuilding2,
  LucideClipboardCheck,
  LucideClipboardList,
  LucideCreditCard,
  LucideFileText,
  LucideLayoutDashboard,
  LucideMail,
  LucideMegaphone,
  LucideMessageSquare,
  LucidePackage,
  LucideShieldCheck,
  LucideShoppingCart,
  LucideStar,
  LucideStore,
  LucideTicket,
  LucideUserCog,
  LucideUsers,
  type LucideIconData,
} from '@lucide/angular';

export interface NavItem {
  label: string;
  icon: LucideIconData;
  to: string;
  permission?: string;
}

export interface NavGroup {
  label?: string;
  items: NavItem[];
}

export const SIDEBAR_NAV: NavGroup[] = [
  {
    items: [{ label: 'Dashboard', icon: LucideLayoutDashboard.icon, to: '/dashboard' }],
  },
  {
    label: 'Bán hàng',
    items: [
      { label: 'Đơn hàng', icon: LucideShoppingCart.icon, to: '/orders' },
      { label: 'Thanh toán', icon: LucideCreditCard.icon, to: '/payments' },
      { label: 'Khách hàng', icon: LucideUsers.icon, to: '/customers' },
    ],
  },
  {
    label: 'CRM',
    items: [
      { label: 'Đánh giá', icon: LucideStar.icon, to: '/crm/reviews' },
      { label: 'Yêu cầu hỗ trợ', icon: LucideMessageSquare.icon, to: '/crm/tickets' },
      { label: 'Liên hệ', icon: LucideMail.icon, to: '/crm/inquiries' },
    ],
  },
  {
    label: 'Sản phẩm',
    items: [
      { label: 'Danh mục', icon: LucideClipboardList.icon, to: '/catalog/categories' },
      { label: 'Thương hiệu', icon: LucideStore.icon, to: '/catalog/brands' },
      { label: 'Sản phẩm', icon: LucidePackage.icon, to: '/catalog/products' },
    ],
  },
  {
    label: 'Kho',
    items: [
      { label: 'Tồn kho', icon: LucideBoxes.icon, to: '/inventory/stock' },
      { label: 'Biến động', icon: LucideClipboardList.icon, to: '/inventory/movements' },
      { label: 'Điều chuyển', icon: LucideArchive.icon, to: '/inventory/transfers' },
      { label: 'Kiểm kê', icon: LucideClipboardCheck.icon, to: '/inventory/stock-take' },
    ],
  },
  {
    label: 'Marketing',
    items: [
      { label: 'Chiến dịch', icon: LucideMegaphone.icon, to: '/marketing/campaigns' },
      { label: 'Khuyến mãi', icon: LucideClipboardList.icon, to: '/marketing/promotions' },
      { label: 'Voucher', icon: LucideTicket.icon, to: '/marketing/vouchers' },
    ],
  },
  {
    label: 'Nhân sự',
    items: [{ label: 'Chấm công', icon: LucideUserCog.icon, to: '/hr/attendance' }],
  },
  {
    label: 'Hệ thống',
    items: [
      {
        label: 'Người dùng',
        icon: LucideUsers.icon,
        to: '/iam/users',
        permission: 'user:read',
      },
      {
        label: 'Vai trò',
        icon: LucideShieldCheck.icon,
        to: '/iam/roles',
        permission: 'role:read',
      },
      {
        label: 'Quyền hạn',
        icon: LucideUserCog.icon,
        to: '/iam/permissions',
        permission: 'role:read',
      },
      {
        label: 'Chi nhánh',
        icon: LucideBuilding2.icon,
        to: '/tenants',
        permission: 'tenant:read',
      },
      { label: 'Audit log', icon: LucideFileText.icon, to: '/audit', permission: 'audit:read' },
      { label: 'Báo cáo', icon: LucideBarChart3.icon, to: '/reports' },
    ],
  },
];
