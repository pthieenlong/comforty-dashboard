import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  type TemplateRef,
  computed,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucidePackage, LucidePlus } from '@lucide/angular';
import {
  BadgeComponent,
  ButtonComponent,
  type ColumnDef,
  DataTableComponent,
  IconComponent,
  PageHeaderComponent,
  PaginationComponent,
  SearchInputComponent,
  SelectComponent,
  type SelectOption,
  type SortState,
  TreeSelectComponent,
  type TreeNode,
} from '@/shared/ui';
import { BRANDS } from '../brand.mock';
import { CATEGORIES, buildCategoryTree, getCategoryPath } from '../category.mock';
import { PRODUCTS } from '../product.mock';
import type { ICategory, IProduct, ProductStatus } from '../product.types';

const PRICE_FORMATTER = new Intl.NumberFormat('vi-VN');

const STATUS_OPTIONS: SelectOption<string>[] = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'active', label: 'Đang bán' },
  { value: 'draft', label: 'Nháp' },
  { value: 'archived', label: 'Ngừng bán' },
];

const STATUS_LABEL: Record<ProductStatus, string> = {
  active: 'Đang bán',
  draft: 'Nháp',
  archived: 'Ngừng bán',
};

const STATUS_VARIANT: Record<ProductStatus, 'success' | 'warning' | 'neutral'> = {
  active: 'success',
  draft: 'warning',
  archived: 'neutral',
};

@Component({
  selector: 'app-products-list',
  imports: [
    BadgeComponent,
    ButtonComponent,
    DataTableComponent,
    DatePipe,
    FormsModule,
    IconComponent,
    PageHeaderComponent,
    PaginationComponent,
    RouterLink,
    SearchInputComponent,
    SelectComponent,
    TreeSelectComponent,
  ],
  template: `
    <div class="space-y-6">
      <app-page-header
        title="Sản phẩm"
        description="Quản lý kho sản phẩm — {{ products.length }} sản phẩm, {{
          totalVariants()
        }} variant."
        [breadcrumb]="breadcrumb"
      >
        <a routerLink="/catalog/products/new" page-actions>
          <app-button variant="primary">
            <app-icon [icon]="plusIcon" size="md" />
            Thêm sản phẩm
          </app-button>
        </a>
      </app-page-header>

      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <app-search-input
          id="product-search"
          placeholder="Tìm theo tên, SKU..."
          [(ngModel)]="searchTerm"
          class="lg:col-span-2"
        />
        <app-tree-select
          id="product-category"
          [nodes]="categoryNodes()"
          placeholder="Tất cả danh mục"
          [(ngModel)]="categoryFilter"
        />
        <div class="grid grid-cols-2 gap-3">
          <app-select
            id="product-brand"
            [options]="brandOptions"
            placeholder="Thương hiệu"
            [(ngModel)]="brandFilter"
          />
          <app-select
            id="product-status"
            [options]="statusOptions"
            placeholder="Trạng thái"
            [(ngModel)]="statusFilter"
          />
        </div>
      </div>

      <app-data-table
        tableId="products-table"
        [columns]="columns()"
        [rows]="paged()"
        trackByKey="id"
        [(sort)]="sortState"
        emptyTitle="Không tìm thấy sản phẩm"
        emptyDescription="Thử thay đổi bộ lọc hoặc xóa từ khóa tìm kiếm."
      />

      <app-pagination [(page)]="page" [pageSize]="pageSize" [totalItems]="filtered().length" />
    </div>

    <ng-template #productCell let-row="row">
      <div class="flex items-center gap-3 min-w-0">
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-400"
        >
          <app-icon [icon]="packageIcon" size="md" />
        </div>
        <div class="min-w-0">
          <a
            [routerLink]="['/catalog/products', row.id]"
            class="text-sm font-medium text-slate-900 hover:text-indigo-600 truncate block"
          >
            {{ row.name }}
          </a>
          <p class="text-xs text-slate-500 font-mono truncate">{{ row.sku }}</p>
        </div>
      </div>
    </ng-template>

    <ng-template #categoryCell let-row="row">
      <span class="text-xs text-slate-600 truncate">{{ categoryPath(row.categoryId) }}</span>
    </ng-template>

    <ng-template #brandCell let-row="row">
      <span class="text-sm text-slate-700">{{ brandName(row.brandId) }}</span>
    </ng-template>

    <ng-template #priceCell let-row="row">
      <span class="text-sm font-medium text-slate-900">
        {{ formatPrice(row.basePrice) }}
      </span>
    </ng-template>

    <ng-template #stockCell let-row="row">
      <div class="text-xs">
        <div class="text-slate-700">{{ totalStock(row) }} sp</div>
        <div class="text-slate-400">{{ row.variants.length }} variant</div>
      </div>
    </ng-template>

    <ng-template #statusCell let-row="row">
      <app-badge [variant]="statusVariant(row.status)" [dot]="true">
        {{ statusLabel(row.status) }}
      </app-badge>
    </ng-template>

    <ng-template #updatedCell let-row="row">
      <span class="text-xs text-slate-600">{{ row.updatedAt | date: 'dd/MM/yyyy' }}</span>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsListComponent {
  protected readonly products = PRODUCTS;
  protected readonly breadcrumb = [{ label: 'Sản phẩm' }, { label: 'Danh sách' }];

  protected readonly plusIcon = LucidePlus.icon;
  protected readonly packageIcon = LucidePackage.icon;

  protected readonly searchTerm = signal('');
  protected readonly categoryFilter = signal<string | null>(null);
  protected readonly brandFilter = signal<string>('');
  protected readonly statusFilter = signal<string>('');
  protected readonly sortState = signal<SortState | null>({
    column: 'updatedAt',
    direction: 'desc',
  });
  protected readonly page = signal(1);
  protected readonly pageSize = 10;

  protected readonly statusOptions = STATUS_OPTIONS;
  protected readonly brandOptions: SelectOption<string>[] = [
    { value: '', label: 'Tất cả thương hiệu' },
    ...BRANDS.map((b) => ({ value: b.id, label: b.name })),
  ];

  protected readonly categoryNodes = computed<TreeNode<ICategory>[]>(() => {
    const roots = buildCategoryTree();
    const toTreeNode = (
      node: ReturnType<typeof buildCategoryTree>[number],
    ): TreeNode<ICategory> => ({
      id: node.id,
      label: node.name,
      data: node,
      children: node.children.map(toTreeNode),
    });
    return roots.map(toTreeNode);
  });

  protected readonly productCell =
    viewChild.required<TemplateRef<{ row: IProduct }>>('productCell');
  protected readonly categoryCell =
    viewChild.required<TemplateRef<{ row: IProduct }>>('categoryCell');
  protected readonly brandCell = viewChild.required<TemplateRef<{ row: IProduct }>>('brandCell');
  protected readonly priceCell = viewChild.required<TemplateRef<{ row: IProduct }>>('priceCell');
  protected readonly stockCell = viewChild.required<TemplateRef<{ row: IProduct }>>('stockCell');
  protected readonly statusCell = viewChild.required<TemplateRef<{ row: IProduct }>>('statusCell');
  protected readonly updatedCell =
    viewChild.required<TemplateRef<{ row: IProduct }>>('updatedCell');

  protected readonly columns = computed<ColumnDef<IProduct>[]>(() => [
    { key: 'name', header: 'Sản phẩm', sortable: true, width: '28%', cell: this.productCell() },
    { key: 'categoryId', header: 'Danh mục', width: '20%', cell: this.categoryCell() },
    { key: 'brandId', header: 'Thương hiệu', width: '12%', cell: this.brandCell() },
    { key: 'basePrice', header: 'Giá', sortable: true, width: '12%', cell: this.priceCell() },
    { key: 'stock', header: 'Kho', width: '10%', cell: this.stockCell() },
    { key: 'status', header: 'Trạng thái', sortable: true, width: '10%', cell: this.statusCell() },
    { key: 'updatedAt', header: 'Cập nhật', sortable: true, width: '8%', cell: this.updatedCell() },
  ]);

  protected readonly totalVariants = computed(() =>
    this.products.reduce((sum, p) => sum + p.variants.length, 0),
  );

  protected readonly filtered = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const categoryId = this.categoryFilter();
    const brandId = this.brandFilter();
    const status = this.statusFilter();

    const categoryDescendants = categoryId ? this.collectCategoryIds(categoryId) : null;

    return this.products.filter((p) => {
      if (categoryDescendants && !categoryDescendants.has(p.categoryId)) return false;
      if (brandId && p.brandId !== brandId) return false;
      if (status && p.status !== status) return false;
      if (!term) return true;
      return (
        p.name.toLowerCase().includes(term) ||
        p.sku.toLowerCase().includes(term) ||
        p.variants.some((v) => v.sku.toLowerCase().includes(term))
      );
    });
  });

  protected readonly sorted = computed(() => {
    const sort = this.sortState();
    const list = this.filtered();
    if (!sort) return list;
    return [...list].sort((a, b) => {
      const av = a[sort.column as keyof IProduct];
      const bv = b[sort.column as keyof IProduct];
      if (typeof av === 'number' && typeof bv === 'number') {
        return sort.direction === 'asc' ? av - bv : bv - av;
      }
      const cmp = String(av ?? '').localeCompare(String(bv ?? ''), 'vi');
      return sort.direction === 'asc' ? cmp : -cmp;
    });
  });

  protected readonly paged = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.sorted().slice(start, start + this.pageSize);
  });

  protected categoryPath(id: string): string {
    return getCategoryPath(id)
      .map((c) => c.name)
      .join(' › ');
  }

  protected brandName(id: string): string {
    return BRANDS.find((b) => b.id === id)?.name ?? id;
  }

  protected formatPrice(n: number): string {
    return `${PRICE_FORMATTER.format(n)} ₫`;
  }

  protected totalStock(p: IProduct): number {
    return p.variants.reduce((sum, v) => sum + v.stock, 0);
  }

  protected statusLabel(s: ProductStatus): string {
    return STATUS_LABEL[s];
  }

  protected statusVariant(s: ProductStatus): 'success' | 'warning' | 'neutral' {
    return STATUS_VARIANT[s];
  }

  private collectCategoryIds(rootId: string): Set<string> {
    const ids = new Set<string>([rootId]);
    let added = true;
    while (added) {
      added = false;
      CATEGORIES.forEach((c) => {
        if (c.parentId && ids.has(c.parentId) && !ids.has(c.id)) {
          ids.add(c.id);
          added = true;
        }
      });
    }
    return ids;
  }
}
