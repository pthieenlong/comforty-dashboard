import type { ITenant } from './tenant.types';

export const MOCK_TENANTS: ITenant[] = [
  { id: 't-hq', code: 'HQ', name: 'Trụ sở chính', type: 'hq', city: 'TP. Hồ Chí Minh' },
  { id: 't-q1', code: 'Q1', name: 'Chi nhánh Quận 1', type: 'store', city: 'TP. Hồ Chí Minh' },
  { id: 't-q7', code: 'Q7', name: 'Chi nhánh Quận 7', type: 'store', city: 'TP. Hồ Chí Minh' },
  { id: 't-td', code: 'TD', name: 'Chi nhánh Thủ Đức', type: 'store', city: 'TP. Hồ Chí Minh' },
  { id: 't-hk', code: 'HK', name: 'Chi nhánh Hoàn Kiếm', type: 'store', city: 'Hà Nội' },
  { id: 't-hc', code: 'HC', name: 'Chi nhánh Hải Châu', type: 'store', city: 'Đà Nẵng' },
];

export const DEFAULT_TENANT_ID = 't-q1';
