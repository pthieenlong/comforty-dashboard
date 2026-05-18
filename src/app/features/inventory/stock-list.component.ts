import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  type TemplateRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideFilter } from '@lucide/angular';
import {
  BadgeComponent,
  ButtonComponent,
  CheckboxComponent,
  type ColumnDef,
  DataTableComponent,
  DrawerService,
  IconComponent,
  PageHeaderComponent,
  PaginationComponent,
  SearchInputComponent,
  SelectComponent,
  type SelectOption,
  type SortState,
} from '@/shared/ui';
import { MOCK_WAREHOUSES } from '@/core/warehouse/warehouse.mock';
import { STOCK_ROWS } from './inventory.mock';
import type { IStockRow } from './inventory.types';

const WAREHOUSE_OPTIONS: SelectOption<string>[] = [
  { value: '', label: 'Tất cả kho' },
  ...MOCK_WAREHOUSES.map((w) => ({ value: w.id, label: w.name })),
];

@Component({
  selector: 'app-stock-list',
  imports: [
    BadgeComponent,
    ButtonComponent,
    CheckboxComponent,
    DataTableComponent,
    DatePipe,
    FormsModule,
    IconComponent,
    PageHeaderComponent,
    PaginationComponent,
    SearchInputComponent,
    SelectComponent,
  ],
  template: `
    <div class="space-y-6">
      <app-page-header
        title="Tồn kho"
        description="Xem tồn kho theo kho + SKU. Tổng {{ rows.length }} dòng tồn kho."
        [breadcrumb]="breadcrumb"
      >
        <app-button variant="secondary" page-actions (click)="openFilters()">
          <app-icon [icon]="filterIcon" size="md" />
          Lọc nâng cao
          @if (advancedFiltersCount() > 0) {
            <app-badge variant="primary" size="sm">{{ advancedFiltersCount() }}</app-badge>
          }
        </app-button>
      </app-page-header>

      <div class="grid gap-3 sm:grid-cols-3">
        <app-search-input
          id="stock-search"
          placeholder="Tìm SKU, tên sản phẩm..."
          [(ngModel)]="searchTerm"
        />
        <app-select
          id="stock-warehouse"
          [options]="warehouseOptions"
          placeholder="Kho"
          [(ngModel)]="warehouseFilter"
        />
        <div class="flex items-end">
          <app-checkbox id="stock-low" label="Chỉ hiển thị tồn thấp" [(ngModel)]="lowStockOnly" />
        </div>
      </div>

      <app-data-table
        tableId="stock-table"
        [columns]="columns()"
        [rows]="paged()"
        trackByKey="id"
        [(sort)]="sortState"
        emptyTitle="Không có tồn kho"
        emptyDescription="Thử thay đổi kho hoặc xóa từ khóa tìm kiếm."
      />

      <app-pagination [(page)]="page" [pageSize]="pageSize" [totalItems]="filtered().length" />
    </div>

    <ng-template #productCell let-row="row">
      <div class="min-w-0">
        <p class="text-sm font-medium text-slate-900 truncate">{{ row.productName }}</p>
        @if (row.variantLabel) {
          <p class="text-xs text-slate-500 truncate">{{ row.variantLabel }}</p>
        }
      </div>
    </ng-template>

    <ng-template #skuCell let-row="row">
      <span class="text-xs font-mono text-slate-700">{{ row.variantSku }}</span>
    </ng-template>

    <ng-template #warehouseCell let-row="row">
      <span class="text-sm text-slate-700">{{ warehouseName(row.warehouseId) }}</span>
    </ng-template>

    <ng-template #qtyCell let-row="row">
      <span [class]="qtyClass(row)">{{ row.quantity }}</span>
    </ng-template>

    <ng-template #reservedCell let-row="row">
      @if (row.reservedQuantity > 0) {
        <span class="text-sm text-amber-700">{{ row.reservedQuantity }}</span>
      } @else {
        <span class="text-sm text-slate-400">—</span>
      }
    </ng-template>

    <ng-template #availableCell let-row="row">
      <span class="text-sm font-medium text-slate-900">
        {{ row.quantity - row.reservedQuantity }}
      </span>
    </ng-template>

    <ng-template #statusCell let-row="row">
      @if (row.quantity === 0) {
        <app-badge variant="danger" [dot]="true">Hết hàng</app-badge>
      } @else if (row.quantity <= row.reorderPoint) {
        <app-badge variant="warning" [dot]="true">Tồn thấp</app-badge>
      } @else {
        <app-badge variant="success" [dot]="true">Đủ</app-badge>
      }
    </ng-template>

    <ng-template #updatedCell let-row="row">
      <span class="text-xs text-slate-600">{{ row.updatedAt | date: 'dd/MM HH:mm' }}</span>
    </ng-template>

    <ng-template #filtersTpl>
      <div class="space-y-4">
        <div>
          <label for="filter-min" class="text-xs font-medium uppercase text-slate-500">
            Tồn tối thiểu
          </label>
          <input
            id="filter-min"
            type="number"
            min="0"
            class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            [(ngModel)]="minQty"
          />
        </div>
        <div>
          <label for="filter-max" class="text-xs font-medium uppercase text-slate-500">
            Tồn tối đa
          </label>
          <input
            id="filter-max"
            type="number"
            min="0"
            class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            [(ngModel)]="maxQty"
          />
        </div>
        <app-checkbox
          id="filter-reserved"
          label="Chỉ tồn đang reserved"
          [(ngModel)]="onlyReserved"
        />
        <app-checkbox id="filter-zero" label="Bao gồm SKU hết hàng" [(ngModel)]="includeZero" />
      </div>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockListComponent {
  private readonly drawer = inject(DrawerService);

  protected readonly rows = STOCK_ROWS;
  protected readonly breadcrumb = [{ label: 'Kho' }, { label: 'Tồn kho' }];

  protected readonly filterIcon = LucideFilter.icon;

  protected readonly searchTerm = signal('');
  protected readonly warehouseFilter = signal<string>('');
  protected readonly lowStockOnly = signal(false);
  protected readonly sortState = signal<SortState | null>({
    column: 'quantity',
    direction: 'asc',
  });
  protected readonly page = signal(1);
  protected readonly pageSize = 15;

  // Advanced (drawer) filters
  protected readonly minQty = signal<number | null>(null);
  protected readonly maxQty = signal<number | null>(null);
  protected readonly onlyReserved = signal(false);
  protected readonly includeZero = signal(true);

  protected readonly warehouseOptions = WAREHOUSE_OPTIONS;

  protected readonly productCell =
    viewChild.required<TemplateRef<{ row: IStockRow }>>('productCell');
  protected readonly skuCell = viewChild.required<TemplateRef<{ row: IStockRow }>>('skuCell');
  protected readonly warehouseCell =
    viewChild.required<TemplateRef<{ row: IStockRow }>>('warehouseCell');
  protected readonly qtyCell = viewChild.required<TemplateRef<{ row: IStockRow }>>('qtyCell');
  protected readonly reservedCell =
    viewChild.required<TemplateRef<{ row: IStockRow }>>('reservedCell');
  protected readonly availableCell =
    viewChild.required<TemplateRef<{ row: IStockRow }>>('availableCell');
  protected readonly statusCell = viewChild.required<TemplateRef<{ row: IStockRow }>>('statusCell');
  protected readonly updatedCell =
    viewChild.required<TemplateRef<{ row: IStockRow }>>('updatedCell');
  protected readonly filtersTpl = viewChild.required<TemplateRef<unknown>>('filtersTpl');

  protected readonly columns = computed<ColumnDef<IStockRow>[]>(() => [
    {
      key: 'productName',
      header: 'Sản phẩm',
      sortable: true,
      width: '24%',
      cell: this.productCell(),
    },
    { key: 'variantSku', header: 'SKU', sortable: true, width: '14%', cell: this.skuCell() },
    { key: 'warehouseId', header: 'Kho', width: '14%', cell: this.warehouseCell() },
    { key: 'quantity', header: 'Tồn', sortable: true, width: '8%', cell: this.qtyCell() },
    {
      key: 'reservedQuantity',
      header: 'Giữ',
      sortable: true,
      width: '8%',
      cell: this.reservedCell(),
    },
    { key: 'available', header: 'Khả dụng', width: '10%', cell: this.availableCell() },
    { key: 'status', header: 'Trạng thái', width: '10%', cell: this.statusCell() },
    {
      key: 'updatedAt',
      header: 'Cập nhật',
      sortable: true,
      width: '12%',
      cell: this.updatedCell(),
    },
  ]);

  protected readonly advancedFiltersCount = computed(() => {
    let n = 0;
    if (this.minQty() !== null) n++;
    if (this.maxQty() !== null) n++;
    if (this.onlyReserved()) n++;
    if (!this.includeZero()) n++;
    return n;
  });

  protected readonly filtered = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const wh = this.warehouseFilter();
    const lowOnly = this.lowStockOnly();
    const min = this.minQty();
    const max = this.maxQty();
    const reservedOnly = this.onlyReserved();
    const includeZero = this.includeZero();

    return this.rows.filter((r) => {
      if (wh && r.warehouseId !== wh) return false;
      if (lowOnly && r.quantity > r.reorderPoint) return false;
      if (!includeZero && r.quantity === 0) return false;
      if (min !== null && r.quantity < min) return false;
      if (max !== null && r.quantity > max) return false;
      if (reservedOnly && r.reservedQuantity === 0) return false;
      if (!term) return true;
      return (
        r.productName.toLowerCase().includes(term) || r.variantSku.toLowerCase().includes(term)
      );
    });
  });

  protected readonly sorted = computed(() => {
    const sort = this.sortState();
    const list = this.filtered();
    if (!sort) return list;
    return [...list].sort((a, b) => {
      const av = a[sort.column as keyof IStockRow];
      const bv = b[sort.column as keyof IStockRow];
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

  protected warehouseName(id: string): string {
    return MOCK_WAREHOUSES.find((w) => w.id === id)?.name ?? id;
  }

  protected qtyClass(row: IStockRow): string {
    if (row.quantity === 0) return 'text-sm font-semibold text-red-600';
    if (row.quantity <= row.reorderPoint) return 'text-sm font-semibold text-amber-700';
    return 'text-sm font-semibold text-slate-900';
  }

  protected openFilters(): void {
    void this.drawer.open(this.filtersTpl(), {
      title: 'Lọc nâng cao',
      description: 'Áp dụng thêm điều kiện để thu hẹp danh sách tồn kho.',
      width: 'md',
    });
  }
}
