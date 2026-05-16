import {
  LucideArchive,
  LucideBarChart3,
  LucideBoxes,
  LucideClipboardList,
  LucideFileText,
  LucideLayoutDashboard,
  LucideMegaphone,
  LucidePackage,
  LucideShieldCheck,
  LucideShoppingCart,
  LucideStore,
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
      { label: 'Khách hàng', icon: LucideUsers.icon, to: '/customers' },
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
      { label: 'Điều chuyển', icon: LucideArchive.icon, to: '/inventory/transfers' },
    ],
  },
  {
    label: 'Marketing',
    items: [{ label: 'Khuyến mãi', icon: LucideMegaphone.icon, to: '/marketing/promotions' }],
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
        icon: LucideShieldCheck.icon,
        to: '/iam/users',
        permission: 'iam:read',
      },
      { label: 'Audit log', icon: LucideFileText.icon, to: '/audit', permission: 'audit:read' },
      { label: 'Báo cáo', icon: LucideBarChart3.icon, to: '/reports' },
    ],
  },
];
