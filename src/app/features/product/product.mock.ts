import type { IProduct, IProductAttribute, IProductVariant, ProductStatus } from './product.types';

interface ProductSeed {
  id: string;
  sku: string;
  name: string;
  brandId: string;
  categoryId: string;
  status: ProductStatus;
  basePrice: number;
  attributes: IProductAttribute[];
  description: string;
}

const COLORS_BASIC = ['Đen', 'Trắng', 'Be', 'Xám'];
const SIZES_TOP = ['S', 'M', 'L', 'XL'];
const SIZES_BOTTOM = ['28', '30', '32', '34'];

const seeds: ProductSeed[] = [
  // Nam › Áo › Áo thun (4)
  {
    id: 'p-men-ts-cmf-001',
    sku: 'CMF-MEN-TS-001',
    name: 'Áo thun nam Comforty Essential',
    brandId: 'brand-comforty',
    categoryId: 'cat-men-tshirt',
    status: 'active',
    basePrice: 199000,
    attributes: [
      { key: 'color', label: 'Màu', values: COLORS_BASIC },
      { key: 'size', label: 'Size', values: SIZES_TOP },
    ],
    description: 'Áo thun cotton 100% form regular, basic mọi tủ đồ.',
  },
  {
    id: 'p-men-ts-cmf-002',
    sku: 'CMF-MEN-TS-002',
    name: 'Áo polo nam Comforty Pique',
    brandId: 'brand-comforty',
    categoryId: 'cat-men-tshirt',
    status: 'active',
    basePrice: 349000,
    attributes: [
      { key: 'color', label: 'Màu', values: ['Đen', 'Navy', 'Trắng', 'Xanh rêu'] },
      { key: 'size', label: 'Size', values: SIZES_TOP },
    ],
    description: 'Polo vải cá sấu cotton, cổ dệt khuy gỗ.',
  },
  {
    id: 'p-men-ts-msg-001',
    sku: 'MSG-MEN-TS-001',
    name: 'Áo thun graphic Mode Saigon Street',
    brandId: 'brand-mode-saigon',
    categoryId: 'cat-men-tshirt',
    status: 'active',
    basePrice: 299000,
    attributes: [
      { key: 'color', label: 'Màu', values: ['Đen', 'Trắng', 'Xám tro'] },
      { key: 'size', label: 'Size', values: ['M', 'L', 'XL', 'XXL'] },
    ],
    description: 'Áo thun oversized in graphic limited.',
  },
  {
    id: 'p-men-ts-tkl-001',
    sku: 'TKL-MEN-TS-001',
    name: 'Tokyo Line Heavyweight Tee',
    brandId: 'brand-tokyo-line',
    categoryId: 'cat-men-tshirt',
    status: 'draft',
    basePrice: 590000,
    attributes: [{ key: 'color', label: 'Màu', values: ['Đen', 'Trắng', 'Olive'] }],
    description: 'T-shirt 280gsm dệt vòng tròn Nhật Bản.',
  },
  // Nam › Áo › Áo sơ mi (3)
  {
    id: 'p-men-sh-cmf-001',
    sku: 'CMF-MEN-SH-001',
    name: 'Sơ mi nam Comforty Oxford',
    brandId: 'brand-comforty',
    categoryId: 'cat-men-shirt',
    status: 'active',
    basePrice: 549000,
    attributes: [
      { key: 'color', label: 'Màu', values: ['Trắng', 'Xanh nhạt', 'Hồng nhạt'] },
      { key: 'size', label: 'Size', values: SIZES_TOP },
    ],
    description: 'Sơ mi vải Oxford, cổ button-down.',
  },
  {
    id: 'p-men-sh-nrt-001',
    sku: 'NRT-MEN-SH-001',
    name: 'Nordic Linen Shirt',
    brandId: 'brand-nordic-thread',
    categoryId: 'cat-men-shirt',
    status: 'active',
    basePrice: 1290000,
    attributes: [
      { key: 'color', label: 'Màu', values: ['Trắng kem', 'Be', 'Xanh navy'] },
      { key: 'size', label: 'Size', values: SIZES_TOP },
    ],
    description: 'Sơ mi linen 100%, phù hợp mùa hè.',
  },
  {
    id: 'p-men-sh-cmf-002',
    sku: 'CMF-MEN-SH-002',
    name: 'Sơ mi nam Comforty Flannel',
    brandId: 'brand-comforty',
    categoryId: 'cat-men-shirt',
    status: 'active',
    basePrice: 690000,
    attributes: [
      { key: 'pattern', label: 'Hoạ tiết', values: ['Ca rô đỏ', 'Ca rô xanh', 'Ca rô đen'] },
      { key: 'size', label: 'Size', values: SIZES_TOP },
    ],
    description: 'Sơ mi flannel ca rô dày, ấm cho mùa lạnh.',
  },
  // Nam › Quần › Quần jean (2)
  {
    id: 'p-men-jn-cmf-001',
    sku: 'CMF-MEN-JN-001',
    name: 'Quần jean nam Comforty Slim',
    brandId: 'brand-comforty',
    categoryId: 'cat-men-jeans',
    status: 'active',
    basePrice: 690000,
    attributes: [
      { key: 'wash', label: 'Wash', values: ['Xanh đậm', 'Xanh nhạt', 'Đen'] },
      { key: 'size', label: 'Size', values: SIZES_BOTTOM },
    ],
    description: 'Quần jean slim fit co giãn 2 chiều.',
  },
  {
    id: 'p-men-jn-tkl-001',
    sku: 'TKL-MEN-JN-001',
    name: 'Tokyo Line Selvedge Denim',
    brandId: 'brand-tokyo-line',
    categoryId: 'cat-men-jeans',
    status: 'active',
    basePrice: 2890000,
    attributes: [
      { key: 'wash', label: 'Wash', values: ['Raw indigo', 'One-wash'] },
      { key: 'size', label: 'Size', values: SIZES_BOTTOM },
    ],
    description: 'Quần jean selvedge 14oz, dệt thoi Nhật Bản.',
  },
  // Nam › Quần › Quần chinos (1)
  {
    id: 'p-men-ch-cmf-001',
    sku: 'CMF-MEN-CH-001',
    name: 'Quần chinos Comforty Tapered',
    brandId: 'brand-comforty',
    categoryId: 'cat-men-chinos',
    status: 'active',
    basePrice: 590000,
    attributes: [
      { key: 'color', label: 'Màu', values: ['Be', 'Đen', 'Olive', 'Navy'] },
      { key: 'size', label: 'Size', values: SIZES_BOTTOM },
    ],
    description: 'Quần kaki ống côn, vải cotton stretch.',
  },
  // Nam › Quần › Quần short (1)
  {
    id: 'p-men-st-msg-001',
    sku: 'MSG-MEN-ST-001',
    name: 'Short nam Mode Saigon Beach',
    brandId: 'brand-mode-saigon',
    categoryId: 'cat-men-shorts',
    status: 'active',
    basePrice: 349000,
    attributes: [
      { key: 'color', label: 'Màu', values: ['Đen', 'Trắng', 'Xanh navy', 'Đỏ'] },
      { key: 'size', label: 'Size', values: ['M', 'L', 'XL'] },
    ],
    description: 'Short polyester nhẹ, lưng thun co giãn.',
  },
  // Nam › Outerwear (1)
  {
    id: 'p-men-ot-nrt-001',
    sku: 'NRT-MEN-OT-001',
    name: 'Nordic Wool Coat',
    brandId: 'brand-nordic-thread',
    categoryId: 'cat-men-outer',
    status: 'draft',
    basePrice: 4890000,
    attributes: [
      { key: 'color', label: 'Màu', values: ['Camel', 'Xám', 'Đen'] },
      { key: 'size', label: 'Size', values: ['M', 'L', 'XL'] },
    ],
    description: 'Áo khoác dạ len 80% wool, dáng dài.',
  },
  // Nữ › Áo › Áo kiểu (3)
  {
    id: 'p-women-bl-cmf-001',
    sku: 'CMF-WMN-BL-001',
    name: 'Áo kiểu Comforty Silk Touch',
    brandId: 'brand-comforty',
    categoryId: 'cat-women-blouse',
    status: 'active',
    basePrice: 549000,
    attributes: [
      { key: 'color', label: 'Màu', values: ['Trắng', 'Hồng pastel', 'Xanh mint'] },
      { key: 'size', label: 'Size', values: ['S', 'M', 'L'] },
    ],
    description: 'Blouse chất liệu satin mềm rủ.',
  },
  {
    id: 'p-women-bl-msg-001',
    sku: 'MSG-WMN-BL-001',
    name: 'Mode Saigon Ruffle Blouse',
    brandId: 'brand-mode-saigon',
    categoryId: 'cat-women-blouse',
    status: 'active',
    basePrice: 490000,
    attributes: [
      { key: 'color', label: 'Màu', values: ['Trắng', 'Đen'] },
      { key: 'size', label: 'Size', values: ['S', 'M', 'L', 'XL'] },
    ],
    description: 'Áo kiểu bèo cổ, tay phồng.',
  },
  {
    id: 'p-women-bl-nrt-001',
    sku: 'NRT-WMN-BL-001',
    name: 'Nordic Linen Blouse',
    brandId: 'brand-nordic-thread',
    categoryId: 'cat-women-blouse',
    status: 'active',
    basePrice: 1190000,
    attributes: [
      { key: 'color', label: 'Màu', values: ['Trắng', 'Be tự nhiên', 'Xanh nhạt'] },
      { key: 'size', label: 'Size', values: ['S', 'M', 'L'] },
    ],
    description: 'Áo linen oversized, phong cách Bắc Âu.',
  },
  // Nữ › Áo › Áo thun (2)
  {
    id: 'p-women-ts-cmf-001',
    sku: 'CMF-WMN-TS-001',
    name: 'Áo thun nữ Comforty Crop',
    brandId: 'brand-comforty',
    categoryId: 'cat-women-tshirt',
    status: 'active',
    basePrice: 229000,
    attributes: [
      { key: 'color', label: 'Màu', values: ['Đen', 'Trắng', 'Hồng', 'Vàng pastel'] },
      { key: 'size', label: 'Size', values: ['S', 'M', 'L'] },
    ],
    description: 'Crop top cotton co giãn nhẹ.',
  },
  {
    id: 'p-women-ts-msg-001',
    sku: 'MSG-WMN-TS-001',
    name: 'Mode Saigon Tank Top',
    brandId: 'brand-mode-saigon',
    categoryId: 'cat-women-tshirt',
    status: 'active',
    basePrice: 259000,
    attributes: [
      { key: 'color', label: 'Màu', values: ['Đen', 'Trắng', 'Be'] },
      { key: 'size', label: 'Size', values: ['S', 'M', 'L'] },
    ],
    description: 'Tank rib body fit.',
  },
  // Nữ › Đầm ngắn (2)
  {
    id: 'p-women-dr-mn-cmf-001',
    sku: 'CMF-WMN-DR-MN-001',
    name: 'Đầm Comforty A-Line',
    brandId: 'brand-comforty',
    categoryId: 'cat-women-dress-mini',
    status: 'active',
    basePrice: 690000,
    attributes: [
      { key: 'color', label: 'Màu', values: ['Đen', 'Hồng', 'Xanh navy'] },
      { key: 'size', label: 'Size', values: ['S', 'M', 'L'] },
    ],
    description: 'Đầm A-line ngắn, vải tweed.',
  },
  {
    id: 'p-women-dr-mn-msg-001',
    sku: 'MSG-WMN-DR-MN-001',
    name: 'Mode Saigon Wrap Mini',
    brandId: 'brand-mode-saigon',
    categoryId: 'cat-women-dress-mini',
    status: 'active',
    basePrice: 590000,
    attributes: [
      { key: 'color', label: 'Màu', values: ['Đen', 'Đỏ đô', 'Hoa nhí'] },
      { key: 'size', label: 'Size', values: ['S', 'M', 'L'] },
    ],
    description: 'Đầm quấn dáng mini, dây buộc eo.',
  },
  // Nữ › Đầm midi/maxi (2)
  {
    id: 'p-women-dr-md-cmf-001',
    sku: 'CMF-WMN-DR-MD-001',
    name: 'Đầm Comforty Midi Pleated',
    brandId: 'brand-comforty',
    categoryId: 'cat-women-dress-midi',
    status: 'active',
    basePrice: 890000,
    attributes: [
      { key: 'color', label: 'Màu', values: ['Đen', 'Be', 'Xanh rêu'] },
      { key: 'size', label: 'Size', values: ['S', 'M', 'L'] },
    ],
    description: 'Đầm midi xếp ly, vải chiffon.',
  },
  {
    id: 'p-women-dr-md-nrt-001',
    sku: 'NRT-WMN-DR-MD-001',
    name: 'Nordic Maxi Linen Dress',
    brandId: 'brand-nordic-thread',
    categoryId: 'cat-women-dress-midi',
    status: 'active',
    basePrice: 1690000,
    attributes: [
      { key: 'color', label: 'Màu', values: ['Trắng', 'Be tự nhiên'] },
      { key: 'size', label: 'Size', values: ['S', 'M', 'L'] },
    ],
    description: 'Đầm maxi linen dây buộc lưng.',
  },
  // Nữ › Chân váy (1)
  {
    id: 'p-women-sk-cmf-001',
    sku: 'CMF-WMN-SK-001',
    name: 'Chân váy Comforty Midi',
    brandId: 'brand-comforty',
    categoryId: 'cat-women-skirt',
    status: 'active',
    basePrice: 490000,
    attributes: [
      { key: 'color', label: 'Màu', values: ['Đen', 'Be', 'Caro'] },
      { key: 'size', label: 'Size', values: ['S', 'M', 'L'] },
    ],
    description: 'Chân váy midi xếp ly.',
  },
  // Nữ › Quần (3)
  {
    id: 'p-women-jn-cmf-001',
    sku: 'CMF-WMN-JN-001',
    name: 'Quần jean nữ Comforty Mom',
    brandId: 'brand-comforty',
    categoryId: 'cat-women-bottoms',
    status: 'active',
    basePrice: 590000,
    attributes: [
      { key: 'wash', label: 'Wash', values: ['Xanh sáng', 'Xanh đậm', 'Đen'] },
      { key: 'size', label: 'Size', values: ['26', '27', '28', '29'] },
    ],
    description: 'Mom jeans cạp cao, dáng rộng cổ điển.',
  },
  {
    id: 'p-women-pn-cmf-001',
    sku: 'CMF-WMN-PN-001',
    name: 'Quần tây nữ Comforty Wide-Leg',
    brandId: 'brand-comforty',
    categoryId: 'cat-women-bottoms',
    status: 'active',
    basePrice: 590000,
    attributes: [
      { key: 'color', label: 'Màu', values: ['Đen', 'Be', 'Navy'] },
      { key: 'size', label: 'Size', values: ['S', 'M', 'L'] },
    ],
    description: 'Quần ống rộng cạp cao, vải tuyết mưa.',
  },
  {
    id: 'p-women-st-msg-001',
    sku: 'MSG-WMN-ST-001',
    name: 'Mode Saigon Denim Shorts',
    brandId: 'brand-mode-saigon',
    categoryId: 'cat-women-bottoms',
    status: 'draft',
    basePrice: 449000,
    attributes: [
      { key: 'wash', label: 'Wash', values: ['Xanh sáng', 'Trắng'] },
      { key: 'size', label: 'Size', values: ['S', 'M', 'L'] },
    ],
    description: 'Quần short jean cạp cao xé gấu.',
  },
  // Nữ › Outerwear (1)
  {
    id: 'p-women-ot-cmf-001',
    sku: 'CMF-WMN-OT-001',
    name: 'Cardigan Comforty Oversized',
    brandId: 'brand-comforty',
    categoryId: 'cat-women-outer',
    status: 'active',
    basePrice: 790000,
    attributes: [
      { key: 'color', label: 'Màu', values: ['Be', 'Đen', 'Hồng khói', 'Olive'] },
      { key: 'size', label: 'Size', values: ['M', 'L'] },
    ],
    description: 'Cardigan len pha cotton, dáng oversized.',
  },
  // Trẻ em › Bé trai (2)
  {
    id: 'p-kid-by-cmf-001',
    sku: 'CMF-KID-BY-001',
    name: 'Áo thun bé trai Comforty Mini',
    brandId: 'brand-comforty',
    categoryId: 'cat-kids-boy',
    status: 'active',
    basePrice: 159000,
    attributes: [
      { key: 'color', label: 'Màu', values: ['Trắng', 'Xanh navy', 'Vàng'] },
      { key: 'size', label: 'Size (tuổi)', values: ['3-4', '5-6', '7-8', '9-10'] },
    ],
    description: 'Áo thun bé trai cotton organic.',
  },
  {
    id: 'p-kid-by-cmf-002',
    sku: 'CMF-KID-BY-002',
    name: 'Quần short kaki bé trai Comforty',
    brandId: 'brand-comforty',
    categoryId: 'cat-kids-boy',
    status: 'active',
    basePrice: 199000,
    attributes: [
      { key: 'color', label: 'Màu', values: ['Be', 'Xanh navy', 'Đen'] },
      { key: 'size', label: 'Size (tuổi)', values: ['3-4', '5-6', '7-8'] },
    ],
    description: 'Short kaki lưng thun cho bé.',
  },
  // Trẻ em › Bé gái (1)
  {
    id: 'p-kid-gr-cmf-001',
    sku: 'CMF-KID-GR-001',
    name: 'Đầm bé gái Comforty Flora',
    brandId: 'brand-comforty',
    categoryId: 'cat-kids-girl',
    status: 'active',
    basePrice: 249000,
    attributes: [
      { key: 'pattern', label: 'Hoạ tiết', values: ['Hoa hồng', 'Hoa xanh', 'Trơn trắng'] },
      { key: 'size', label: 'Size (tuổi)', values: ['3-4', '5-6', '7-8'] },
    ],
    description: 'Đầm bé gái cotton in hoa.',
  },
  // Phụ kiện › Túi (2)
  {
    id: 'p-acc-bg-cmf-001',
    sku: 'CMF-ACC-BG-001',
    name: 'Túi tote Comforty Canvas',
    brandId: 'brand-comforty',
    categoryId: 'cat-acc-bag',
    status: 'active',
    basePrice: 290000,
    attributes: [{ key: 'color', label: 'Màu', values: ['Be', 'Đen', 'Trắng', 'Olive'] }],
    description: 'Túi tote vải canvas dày 14oz.',
  },
  {
    id: 'p-acc-bg-sgc-001',
    sku: 'SGC-ACC-BG-001',
    name: 'Saigon Craft Leather Crossbody',
    brandId: 'brand-saigon-craft',
    categoryId: 'cat-acc-bag',
    status: 'archived',
    basePrice: 1890000,
    attributes: [{ key: 'color', label: 'Màu', values: ['Nâu cognac', 'Đen', 'Be'] }],
    description: 'Túi đeo chéo da bò handmade.',
  },
  // Phụ kiện › Thắt lưng (1)
  {
    id: 'p-acc-bl-cmf-001',
    sku: 'CMF-ACC-BL-001',
    name: 'Thắt lưng nam Comforty Classic',
    brandId: 'brand-comforty',
    categoryId: 'cat-acc-belt',
    status: 'active',
    basePrice: 390000,
    attributes: [
      { key: 'color', label: 'Màu', values: ['Đen', 'Nâu'] },
      { key: 'size', label: 'Size', values: ['90cm', '100cm', '110cm', '120cm'] },
    ],
    description: 'Thắt lưng da bò khoá kim loại.',
  },
  // Phụ kiện › Mũ (2)
  {
    id: 'p-acc-ht-msg-001',
    sku: 'MSG-ACC-HT-001',
    name: 'Mũ lưỡi trai Mode Saigon Logo',
    brandId: 'brand-mode-saigon',
    categoryId: 'cat-acc-hat',
    status: 'active',
    basePrice: 249000,
    attributes: [{ key: 'color', label: 'Màu', values: ['Đen', 'Trắng', 'Beige', 'Navy'] }],
    description: 'Mũ snapback thêu logo.',
  },
  {
    id: 'p-acc-ht-cmf-001',
    sku: 'CMF-ACC-HT-001',
    name: 'Mũ bucket Comforty Summer',
    brandId: 'brand-comforty',
    categoryId: 'cat-acc-hat',
    status: 'active',
    basePrice: 199000,
    attributes: [{ key: 'color', label: 'Màu', values: ['Be', 'Xanh navy', 'Hồng pastel'] }],
    description: 'Mũ bucket vải cotton, vành mềm.',
  },
];

const createdBase = new Date('2024-01-01').getTime();
const day = 86400000;

function cartesian(attrs: IProductAttribute[]): Record<string, string>[] {
  if (attrs.length === 0) return [{}];
  return attrs.reduce<Record<string, string>[]>(
    (acc, attr) => acc.flatMap((combo) => attr.values.map((v) => ({ ...combo, [attr.key]: v }))),
    [{}],
  );
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const PLACEHOLDER_PALETTE = [
  { bg: '1f2937', fg: 'f9fafb' },
  { bg: 'fef3c7', fg: '92400e' },
  { bg: 'dbeafe', fg: '1e3a8a' },
  { bg: 'fce7f3', fg: '9d174d' },
  { bg: 'e0e7ff', fg: '3730a3' },
  { bg: 'd1fae5', fg: '065f46' },
];

function buildImages(seed: ProductSeed, seedIndex: number): string[] {
  const palette = PLACEHOLDER_PALETTE[seedIndex % PLACEHOLDER_PALETTE.length];
  const label = encodeURIComponent(seed.sku);
  const count = 3 + (seedIndex % 3);
  return Array.from(
    { length: count },
    (_, i) => `https://placehold.co/600x800/${palette.bg}/${palette.fg}?text=${label}+${i + 1}`,
  );
}

function buildVariants(seed: ProductSeed): IProductVariant[] {
  const combos = cartesian(seed.attributes);
  return combos.map((combo, idx) => {
    const suffix = Object.values(combo)
      .map((v) => slugify(v).slice(0, 3).toUpperCase())
      .join('-');
    const priceJitter = (idx % 3) * 50000;
    const stockBase = ((idx * 7) % 30) + 5;
    return {
      id: `${seed.id}-v${idx + 1}`,
      productId: seed.id,
      sku: suffix ? `${seed.sku}-${suffix}` : seed.sku,
      attributes: combo,
      price: seed.basePrice + priceJitter,
      compareAtPrice: idx % 4 === 0 ? seed.basePrice + priceJitter + 100000 : null,
      stock: seed.status === 'archived' ? 0 : stockBase,
    };
  });
}

export const PRODUCTS: IProduct[] = seeds.map((seed, i) => {
  const created = new Date(createdBase + i * 5 * day).toISOString();
  const updated = new Date(createdBase + (i * 5 + 2) * day).toISOString();
  return {
    id: seed.id,
    sku: seed.sku,
    name: seed.name,
    slug: slugify(seed.name),
    description: seed.description,
    brandId: seed.brandId,
    categoryId: seed.categoryId,
    status: seed.status,
    images: buildImages(seed, i),
    attributes: seed.attributes,
    variants: buildVariants(seed),
    basePrice: seed.basePrice,
    createdAt: created,
    updatedAt: updated,
  };
});

export function findProduct(id: string): IProduct | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function findProductsByBrand(brandId: string): IProduct[] {
  return PRODUCTS.filter((p) => p.brandId === brandId);
}

export function findProductsByCategory(categoryId: string): IProduct[] {
  return PRODUCTS.filter((p) => p.categoryId === categoryId);
}
