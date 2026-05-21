/**
 * Department mapping derived from IAM roles.
 *
 * Project currently does NOT have a Department entity. Until BE introduces one,
 * we group users into departments by their role's prefix/keyword.
 */

export type DepartmentKey =
  | 'management'
  | 'sales'
  | 'inventory'
  | 'marketing'
  | 'customer_service'
  | 'audit'
  | 'general';

export interface IDepartmentMeta {
  key: DepartmentKey;
  label: string;
  badgeClass: string;
}

export const DEPARTMENTS: Record<DepartmentKey, IDepartmentMeta> = {
  management: {
    key: 'management',
    label: 'Ban quản lý',
    badgeClass: 'bg-indigo-100 text-indigo-700',
  },
  sales: {
    key: 'sales',
    label: 'Bán hàng',
    badgeClass: 'bg-emerald-100 text-emerald-700',
  },
  inventory: {
    key: 'inventory',
    label: 'Kho vận',
    badgeClass: 'bg-amber-100 text-amber-800',
  },
  marketing: {
    key: 'marketing',
    label: 'Marketing',
    badgeClass: 'bg-pink-100 text-pink-700',
  },
  customer_service: {
    key: 'customer_service',
    label: 'CSKH',
    badgeClass: 'bg-sky-100 text-sky-700',
  },
  audit: {
    key: 'audit',
    label: 'Kiểm toán',
    badgeClass: 'bg-slate-100 text-slate-700',
  },
  general: {
    key: 'general',
    label: 'Khác',
    badgeClass: 'bg-slate-100 text-slate-600',
  },
};

/** Map roleId → department. Update when new roles are added. */
const ROLE_DEPARTMENT_MAP: Record<string, DepartmentKey> = {
  'role-super-admin': 'management',
  'role-hq-admin': 'management',
  'role-store-manager': 'sales',
  'role-sales-lead': 'sales',
  'role-cashier': 'sales',
  'role-inventory-clerk': 'inventory',
  'role-marketing': 'marketing',
  'role-cs-manager': 'customer_service',
  'role-cs-staff': 'customer_service',
  'role-auditor': 'audit',
  'role-staff': 'general',
};

export function departmentOfRole(roleId: string): DepartmentKey {
  return ROLE_DEPARTMENT_MAP[roleId] ?? 'general';
}

/** Manager-tier role IDs — these can view their department's data. */
const MANAGER_ROLE_IDS = new Set([
  'role-super-admin',
  'role-hq-admin',
  'role-store-manager',
  'role-sales-lead',
  'role-cs-manager',
]);

export function isManagerRole(roleId: string): boolean {
  return MANAGER_ROLE_IDS.has(roleId);
}

/** Whole-company viewers: Super Admin + HQ Admin. */
const COMPANY_VIEWER_ROLE_IDS = new Set(['role-super-admin', 'role-hq-admin']);

export function canViewWholeCompany(roleId: string): boolean {
  return COMPANY_VIEWER_ROLE_IDS.has(roleId);
}
