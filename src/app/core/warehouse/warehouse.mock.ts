import type { IWarehouse } from './warehouse.types';

export const MOCK_WAREHOUSES: IWarehouse[] = [
  {
    id: 'wh-hq-01',
    tenantId: 't-hq',
    code: 'WH-HQ-01',
    name: 'Kho tổng trụ sở',
    address: '500 Phạm Văn Đồng, Phường Hiệp Bình Chánh, TP. Thủ Đức',
    isPrimary: true,
    managerName: 'Bùi Văn Hùng',
    capacity: 5000,
  },
  {
    id: 'wh-q1-01',
    tenantId: 't-q1',
    code: 'WH-Q1-01',
    name: 'Kho chi nhánh Quận 1',
    address: '45 Lê Lợi, Phường Bến Thành, Quận 1',
    isPrimary: true,
    managerName: 'Nguyễn Thị Hằng',
    capacity: 800,
  },
  {
    id: 'wh-q7-01',
    tenantId: 't-q7',
    code: 'WH-Q7-01',
    name: 'Kho chi nhánh Quận 7',
    address: '88 Nguyễn Thị Thập, Phường Tân Phú, Quận 7',
    isPrimary: true,
    managerName: 'Phạm Quốc Cường',
    capacity: 750,
  },
  {
    id: 'wh-td-01',
    tenantId: 't-td',
    code: 'WH-TD-01',
    name: 'Kho chi nhánh Thủ Đức',
    address: '210 Võ Văn Ngân, Phường Linh Chiểu, TP. Thủ Đức',
    isPrimary: true,
    managerName: 'Lê Hoàng Nam',
    capacity: 700,
  },
  {
    id: 'wh-hk-01',
    tenantId: 't-hk',
    code: 'WH-HK-01',
    name: 'Kho chi nhánh Hoàn Kiếm',
    address: '72 Hàng Bài, Phường Hàng Bài, Quận Hoàn Kiếm',
    isPrimary: true,
    managerName: 'Đỗ Thu Trang',
    capacity: 600,
  },
  {
    id: 'wh-hc-01',
    tenantId: 't-hc',
    code: 'WH-HC-01',
    name: 'Kho chi nhánh Hải Châu',
    address: '15 Trần Phú, Phường Hải Châu I, Quận Hải Châu',
    isPrimary: true,
    managerName: 'Võ Minh Tuấn',
    capacity: 500,
  },
];

export function findWarehousesByTenant(tenantId: string): IWarehouse[] {
  return MOCK_WAREHOUSES.filter((w) => w.tenantId === tenantId);
}
