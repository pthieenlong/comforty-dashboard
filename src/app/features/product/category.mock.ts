import type { ICategory, ICategoryNode } from './product.types';

export const CATEGORIES: ICategory[] = [
  // Root level — gender / segment
  {
    id: 'cat-men',
    parentId: null,
    code: 'MEN',
    name: 'Nam',
    description: 'Thời trang nam: áo, quần, outerwear.',
    sortOrder: 1,
    active: true,
    productCount: 12,
  },
  {
    id: 'cat-women',
    parentId: null,
    code: 'WMN',
    name: 'Nữ',
    description: 'Thời trang nữ: áo, đầm, váy, quần.',
    sortOrder: 2,
    active: true,
    productCount: 14,
  },
  {
    id: 'cat-kids',
    parentId: null,
    code: 'KID',
    name: 'Trẻ em',
    description: 'Thời trang cho bé trai và bé gái.',
    sortOrder: 3,
    active: true,
    productCount: 3,
  },
  {
    id: 'cat-accessories',
    parentId: null,
    code: 'ACC',
    name: 'Phụ kiện',
    description: 'Túi xách, thắt lưng, mũ, khăn.',
    sortOrder: 4,
    active: true,
    productCount: 5,
  },

  // Level 2 — under Nam
  {
    id: 'cat-men-tops',
    parentId: 'cat-men',
    code: 'MEN-TP',
    name: 'Áo',
    description: 'Các loại áo nam.',
    sortOrder: 1,
    active: true,
    productCount: 7,
  },
  {
    id: 'cat-men-bottoms',
    parentId: 'cat-men',
    code: 'MEN-BT',
    name: 'Quần',
    description: 'Quần dài, quần short, quần jean.',
    sortOrder: 2,
    active: true,
    productCount: 4,
  },
  {
    id: 'cat-men-outer',
    parentId: 'cat-men',
    code: 'MEN-OT',
    name: 'Outerwear',
    description: 'Áo khoác, blazer, hoodie nam.',
    sortOrder: 3,
    active: true,
    productCount: 1,
  },

  // Level 3 — under Nam › Áo
  {
    id: 'cat-men-tshirt',
    parentId: 'cat-men-tops',
    code: 'MEN-TP-TS',
    name: 'Áo thun',
    description: 'T-shirt, polo.',
    sortOrder: 1,
    active: true,
    productCount: 4,
  },
  {
    id: 'cat-men-shirt',
    parentId: 'cat-men-tops',
    code: 'MEN-TP-SH',
    name: 'Áo sơ mi',
    description: 'Sơ mi tay dài, tay ngắn.',
    sortOrder: 2,
    active: true,
    productCount: 3,
  },

  // Level 3 — under Nam › Quần
  {
    id: 'cat-men-jeans',
    parentId: 'cat-men-bottoms',
    code: 'MEN-BT-JN',
    name: 'Quần jean',
    description: 'Quần denim nam các phom.',
    sortOrder: 1,
    active: true,
    productCount: 2,
  },
  {
    id: 'cat-men-chinos',
    parentId: 'cat-men-bottoms',
    code: 'MEN-BT-CH',
    name: 'Quần chinos',
    description: 'Quần kaki chinos.',
    sortOrder: 2,
    active: true,
    productCount: 1,
  },
  {
    id: 'cat-men-shorts',
    parentId: 'cat-men-bottoms',
    code: 'MEN-BT-SH',
    name: 'Quần short',
    description: 'Short jean, short kaki, short thể thao.',
    sortOrder: 3,
    active: true,
    productCount: 1,
  },

  // Level 2 — under Nữ
  {
    id: 'cat-women-tops',
    parentId: 'cat-women',
    code: 'WMN-TP',
    name: 'Áo',
    description: 'Các loại áo nữ.',
    sortOrder: 1,
    active: true,
    productCount: 5,
  },
  {
    id: 'cat-women-dress',
    parentId: 'cat-women',
    code: 'WMN-DR',
    name: 'Đầm & Váy',
    description: 'Đầm, váy ngắn, váy dài.',
    sortOrder: 2,
    active: true,
    productCount: 5,
  },
  {
    id: 'cat-women-bottoms',
    parentId: 'cat-women',
    code: 'WMN-BT',
    name: 'Quần',
    description: 'Quần dài, quần short nữ.',
    sortOrder: 3,
    active: true,
    productCount: 3,
  },
  {
    id: 'cat-women-outer',
    parentId: 'cat-women',
    code: 'WMN-OT',
    name: 'Outerwear',
    description: 'Áo khoác, blazer, cardigan nữ.',
    sortOrder: 4,
    active: true,
    productCount: 1,
  },

  // Level 3 — under Nữ › Áo
  {
    id: 'cat-women-blouse',
    parentId: 'cat-women-tops',
    code: 'WMN-TP-BL',
    name: 'Áo kiểu',
    description: 'Blouse, áo cánh nữ.',
    sortOrder: 1,
    active: true,
    productCount: 3,
  },
  {
    id: 'cat-women-tshirt',
    parentId: 'cat-women-tops',
    code: 'WMN-TP-TS',
    name: 'Áo thun',
    description: 'T-shirt, crop top, tank.',
    sortOrder: 2,
    active: true,
    productCount: 2,
  },

  // Level 3 — under Nữ › Đầm & Váy
  {
    id: 'cat-women-dress-mini',
    parentId: 'cat-women-dress',
    code: 'WMN-DR-MN',
    name: 'Đầm ngắn',
    description: 'Đầm mini, đầm dáng A ngắn.',
    sortOrder: 1,
    active: true,
    productCount: 2,
  },
  {
    id: 'cat-women-dress-midi',
    parentId: 'cat-women-dress',
    code: 'WMN-DR-MD',
    name: 'Đầm midi/maxi',
    description: 'Đầm dài qua gối hoặc dài tới gót.',
    sortOrder: 2,
    active: true,
    productCount: 2,
  },
  {
    id: 'cat-women-skirt',
    parentId: 'cat-women-dress',
    code: 'WMN-DR-SK',
    name: 'Chân váy',
    description: 'Chân váy ngắn, midi.',
    sortOrder: 3,
    active: true,
    productCount: 1,
  },

  // Level 2 — under Trẻ em
  {
    id: 'cat-kids-boy',
    parentId: 'cat-kids',
    code: 'KID-BY',
    name: 'Bé trai',
    description: 'Áo, quần cho bé trai.',
    sortOrder: 1,
    active: true,
    productCount: 2,
  },
  {
    id: 'cat-kids-girl',
    parentId: 'cat-kids',
    code: 'KID-GR',
    name: 'Bé gái',
    description: 'Áo, đầm cho bé gái.',
    sortOrder: 2,
    active: true,
    productCount: 1,
  },

  // Level 2 — under Phụ kiện
  {
    id: 'cat-acc-bag',
    parentId: 'cat-accessories',
    code: 'ACC-BG',
    name: 'Túi xách',
    description: 'Túi tote, túi đeo chéo, ba lô.',
    sortOrder: 1,
    active: true,
    productCount: 2,
  },
  {
    id: 'cat-acc-belt',
    parentId: 'cat-accessories',
    code: 'ACC-BL',
    name: 'Thắt lưng',
    description: 'Thắt lưng da, vải.',
    sortOrder: 2,
    active: true,
    productCount: 1,
  },
  {
    id: 'cat-acc-hat',
    parentId: 'cat-accessories',
    code: 'ACC-HT',
    name: 'Mũ',
    description: 'Mũ lưỡi trai, mũ bucket, beanie.',
    sortOrder: 3,
    active: true,
    productCount: 2,
  },
];

export function findCategory(id: string): ICategory | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

export function buildCategoryTree(categories: ICategory[] = CATEGORIES): ICategoryNode[] {
  const map = new Map<string, ICategoryNode>();
  categories.forEach((c) => map.set(c.id, { ...c, children: [], depth: 0 }));

  const roots: ICategoryNode[] = [];
  map.forEach((node) => {
    if (node.parentId === null) {
      roots.push(node);
    } else {
      const parent = map.get(node.parentId);
      if (parent) parent.children.push(node);
    }
  });

  const assignDepth = (nodes: ICategoryNode[], depth: number): void => {
    nodes.forEach((n) => {
      n.depth = depth;
      n.children.sort((a, b) => a.sortOrder - b.sortOrder);
      assignDepth(n.children, depth + 1);
    });
  };
  roots.sort((a, b) => a.sortOrder - b.sortOrder);
  assignDepth(roots, 0);

  return roots;
}

export function flattenCategoryTree(nodes: ICategoryNode[]): ICategoryNode[] {
  const flat: ICategoryNode[] = [];
  const visit = (list: ICategoryNode[]): void => {
    list.forEach((n) => {
      flat.push(n);
      visit(n.children);
    });
  };
  visit(nodes);
  return flat;
}

export function getCategoryPath(id: string): ICategory[] {
  const path: ICategory[] = [];
  let current = findCategory(id);
  while (current) {
    path.unshift(current);
    current = current.parentId ? findCategory(current.parentId) : undefined;
  }
  return path;
}
