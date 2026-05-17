import type { IBrand } from './product.types';

export const BRANDS: IBrand[] = [
  {
    id: 'brand-comforty',
    code: 'CMF',
    name: 'Comforty',
    description: 'Thương hiệu chủ lực, sản xuất tại Việt Nam, basics chất lượng cao.',
    country: 'Việt Nam',
    website: 'https://comforty.vn',
    active: true,
    productCount: 14,
    createdAt: '2018-06-15',
  },
  {
    id: 'brand-mode-saigon',
    code: 'MSG',
    name: 'Mode Saigon',
    description: 'Local brand thiết kế, phong cách đường phố trẻ trung.',
    country: 'Việt Nam',
    website: 'https://modesaigon.vn',
    active: true,
    productCount: 7,
    createdAt: '2020-04-18',
  },
  {
    id: 'brand-nordic-thread',
    code: 'NRT',
    name: 'Nordic Thread',
    description: 'Phong cách tối giản Bắc Âu, vải hữu cơ và linen.',
    country: 'Đan Mạch',
    website: 'https://nordicthread.dk',
    active: true,
    productCount: 5,
    createdAt: '2021-09-02',
  },
  {
    id: 'brand-tokyo-line',
    code: 'TKL',
    name: 'Tokyo Line',
    description: 'Phong cách Nhật Bản tối giản, denim selvedge nhập khẩu.',
    country: 'Nhật Bản',
    website: 'https://tokyoline.jp',
    active: true,
    productCount: 3,
    createdAt: '2022-02-10',
  },
  {
    id: 'brand-saigon-craft',
    code: 'SGC',
    name: 'Saigon Craft',
    description: 'Phụ kiện thủ công da bò, sản xuất tại làng nghề Củ Chi.',
    country: 'Việt Nam',
    website: '',
    active: false,
    productCount: 1,
    createdAt: '2023-03-12',
  },
];

export function findBrand(id: string): IBrand | undefined {
  return BRANDS.find((b) => b.id === id);
}
