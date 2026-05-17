export type ProductStatus = 'draft' | 'active' | 'archived';

export interface IBrand {
  id: string;
  code: string;
  name: string;
  description: string;
  country: string;
  website: string;
  active: boolean;
  productCount: number;
  createdAt: string;
}

export interface ICategory {
  id: string;
  parentId: string | null;
  code: string;
  name: string;
  description: string;
  sortOrder: number;
  active: boolean;
  productCount: number;
}

export interface ICategoryNode extends ICategory {
  children: ICategoryNode[];
  depth: number;
}

export interface IProductAttribute {
  key: string;
  label: string;
  values: string[];
}

export interface IProductVariant {
  id: string;
  productId: string;
  sku: string;
  attributes: Record<string, string>;
  price: number;
  compareAtPrice: number | null;
  stock: number;
}

export interface IProduct {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  brandId: string;
  categoryId: string;
  status: ProductStatus;
  images: string[];
  attributes: IProductAttribute[];
  variants: IProductVariant[];
  basePrice: number;
  createdAt: string;
  updatedAt: string;
}
