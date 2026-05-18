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
import {
  type ColumnDef,
  DataTableComponent,
  PageHeaderComponent,
  PaginationComponent,
  SearchInputComponent,
  SelectComponent,
  type SelectOption,
  type SortState,
  TagComponent,
} from '@/shared/ui';
import { MOCK_WAREHOUSES } from '@/core/warehouse/warehouse.mock';
import { MOVEMENTS } from './inventory.mock';
import type { IMovement, MovementType } from './inventory.types';

const TYPE_LABEL: Record<MovementType, string> = {
  in: 'Nhập kho',
  out: 'Xuất kho',
  transfer_in: 'Chuyển đến',
  transfer_out: 'Chuyển đi',
  adjust: 'Điều chỉnh',
  sale: 'Bán hàng',
  return: 'Trả hàng',
};

const TYPE_VARIANT: Record<
  MovementType,
  'success' | 'danger' | 'info' | 'warning' | 'primary' | 'neutral'
> = {
  in: 'success',
  out: 'danger',
  transfer_in: 'info',
  transfer_out: 'warning',
  adjust: 'neutral',
  sale: 'primary',
  return: 'success',
};

const TYPE_OPTIONS: SelectOption<string>[] = [
  { value: '', label: 'Tất cả loại' },
  ...Object.entries(TYPE_LABEL).map(([value, label]) => ({ value, label })),
];

const WAREHOUSE_OPTIONS: SelectOption<string>[] = [
  { value: '', label: 'Tất cả kho' },
  ...MOCK_WAREHOUSES.map((w) => ({ value: w.id, label: w.name })),
];

@Component({
  selector: 'app-movements-list',
  imports: [
    DataTableComponent,
    DatePipe,
    FormsModule,
    PageHeaderComponent,
    PaginationComponent,
    SearchInputComponent,
    SelectComponent,
    TagComponent,
  ],
  template: `
    <div class="space-y-6">
      <app-page-header
        title="Biến động kho"
        description="Lịch sử mọi giao dịch ảnh hưởng tồn kho. {{ movements.length }} bản ghi."
        [breadcrumb]="breadcrumb"
      />

      <div class="grid gap-3 lg:grid-cols-4">
        <app-search-input
          id="mv-search"
          placeholder="Tìm SKU, mã ref, sản phẩm..."
          [(ngModel)]="searchTerm"
          class="lg:col-span-2"
        />
        <app-select
          id="mv-type"
          [options]="typeOptions"
          placeholder="Loại"
          [(ngModel)]="typeFilter"
        />
        <app-select
          id="mv-warehouse"
          [options]="warehouseOptions"
          placeholder="Kho"
          [(ngModel)]="warehouseFilter"
        />
      </div>

      <div class="grid gap-3 sm:grid-cols-2">
        <label class="flex flex-col gap-1">
          <span class="text-xs font-medium text-slate-500">Từ ngày</span>
          <input
            type="date"
            class="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            [(ngModel)]="dateFrom"
          />
        </label>
        <label class="flex flex-col gap-1">
          <span class="text-xs font-medium text-slate-500">đến ngày</span>
          <input
            type="date"
            class="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            [(ngModel)]="dateTo"
          />
        </label>
      </div>

      <app-data-table
        tableId="movements-table"
        [columns]="columns()"
        [rows]="paged()"
        trackByKey="id"
        [(sort)]="sortState"
        emptyTitle="Không tìm thấy biến động"
        emptyDescription="Thử thay đổi bộ lọc hoặc khoảng thời gian."
      />

      <app-pagination [(page)]="page" [pageSize]="pageSize" [totalItems]="filtered().length" />
    </div>

    <ng-template #codeCell let-row="row">
      <span class="text-xs font-mono text-slate-700">{{ row.code }}</span>
    </ng-template>

    <ng-template #typeCell let-row="row">
      <app-tag [variant]="typeVariant(row.type)">{{ typeLabel(row.type) }}</app-tag>
    </ng-template>

    <ng-template #productCell let-row="row">
      <div class="min-w-0">
        <p class="text-sm text-slate-900 truncate">{{ row.productName }}</p>
        <p class="text-xs text-slate-500 font-mono">{{ row.variantSku }}</p>
      </div>
    </ng-template>

    <ng-template #warehouseCell let-row="row">
      <span class="text-sm text-slate-700">{{ warehouseName(row.warehouseId) }}</span>
    </ng-template>

    <ng-template #qtyCell let-row="row">
      <span [class]="qtyClass(row)"> {{ row.quantity > 0 ? '+' : '' }}{{ row.quantity }} </span>
    </ng-template>

    <ng-template #refCell let-row="row">
      <div>
        <p class="text-xs font-mono text-slate-700">{{ row.refCode }}</p>
        <p class="text-[10px] uppercase text-slate-400">{{ row.refType }}</p>
      </div>
    </ng-template>

    <ng-template #reasonCell let-row="row">
      <span class="text-xs text-slate-600">{{ row.reason }}</span>
    </ng-template>

    <ng-template #actorCell let-row="row">
      <span class="text-xs text-slate-600">{{ row.performedBy }}</span>
    </ng-template>

    <ng-template #timeCell let-row="row">
      <span class="text-xs text-slate-600">{{ row.performedAt | date: 'dd/MM HH:mm' }}</span>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovementsListComponent {
  protected readonly movements = MOVEMENTS;
  protected readonly breadcrumb = [{ label: 'Kho' }, { label: 'Biến động' }];

  protected readonly searchTerm = signal('');
  protected readonly typeFilter = signal<string>('');
  protected readonly warehouseFilter = signal<string>('');
  protected readonly dateFrom = signal<string>('');
  protected readonly dateTo = signal<string>('');
  protected readonly sortState = signal<SortState | null>({
    column: 'performedAt',
    direction: 'desc',
  });
  protected readonly page = signal(1);
  protected readonly pageSize = 15;

  protected readonly typeOptions = TYPE_OPTIONS;
  protected readonly warehouseOptions = WAREHOUSE_OPTIONS;

  protected readonly codeCell = viewChild.required<TemplateRef<{ row: IMovement }>>('codeCell');
  protected readonly typeCell = viewChild.required<TemplateRef<{ row: IMovement }>>('typeCell');
  protected readonly productCell =
    viewChild.required<TemplateRef<{ row: IMovement }>>('productCell');
  protected readonly warehouseCell =
    viewChild.required<TemplateRef<{ row: IMovement }>>('warehouseCell');
  protected readonly qtyCell = viewChild.required<TemplateRef<{ row: IMovement }>>('qtyCell');
  protected readonly refCell = viewChild.required<TemplateRef<{ row: IMovement }>>('refCell');
  protected readonly reasonCell = viewChild.required<TemplateRef<{ row: IMovement }>>('reasonCell');
  protected readonly actorCell = viewChild.required<TemplateRef<{ row: IMovement }>>('actorCell');
  protected readonly timeCell = viewChild.required<TemplateRef<{ row: IMovement }>>('timeCell');

  protected readonly columns = computed<ColumnDef<IMovement>[]>(() => [
    { key: 'code', header: 'Mã', sortable: true, width: '10%', cell: this.codeCell() },
    { key: 'type', header: 'Loại', sortable: true, width: '10%', cell: this.typeCell() },
    {
      key: 'productName',
      header: 'Sản phẩm',
      sortable: true,
      width: '20%',
      cell: this.productCell(),
    },
    { key: 'warehouseId', header: 'Kho', width: '12%', cell: this.warehouseCell() },
    { key: 'quantity', header: 'SL', sortable: true, width: '8%', cell: this.qtyCell() },
    { key: 'refCode', header: 'Ref', width: '10%', cell: this.refCell() },
    { key: 'reason', header: 'Lý do', width: '14%', cell: this.reasonCell() },
    { key: 'performedBy', header: 'Người thực hiện', width: '10%', cell: this.actorCell() },
    {
      key: 'performedAt',
      header: 'Thời gian',
      sortable: true,
      width: '12%',
      cell: this.timeCell(),
    },
  ]);

  protected readonly filtered = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const type = this.typeFilter();
    const wh = this.warehouseFilter();
    const from = this.dateFrom() ? new Date(this.dateFrom()).getTime() : null;
    const to = this.dateTo() ? new Date(this.dateTo()).getTime() + 86399999 : null;

    return this.movements.filter((m) => {
      if (type && m.type !== type) return false;
      if (wh && m.warehouseId !== wh) return false;
      const t = new Date(m.performedAt).getTime();
      if (from !== null && t < from) return false;
      if (to !== null && t > to) return false;
      if (!term) return true;
      return (
        m.code.toLowerCase().includes(term) ||
        m.variantSku.toLowerCase().includes(term) ||
        m.productName.toLowerCase().includes(term) ||
        m.refCode.toLowerCase().includes(term)
      );
    });
  });

  protected readonly sorted = computed(() => {
    const sort = this.sortState();
    const list = this.filtered();
    if (!sort) return list;
    return [...list].sort((a, b) => {
      const av = a[sort.column as keyof IMovement];
      const bv = b[sort.column as keyof IMovement];
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

  protected typeLabel(t: MovementType): string {
    return TYPE_LABEL[t];
  }

  protected typeVariant(t: MovementType) {
    return TYPE_VARIANT[t];
  }

  protected warehouseName(id: string): string {
    return MOCK_WAREHOUSES.find((w) => w.id === id)?.name ?? id;
  }

  protected qtyClass(m: IMovement): string {
    const base = 'text-sm font-semibold';
    if (m.quantity > 0) return `${base} text-green-700`;
    if (m.quantity < 0) return `${base} text-red-600`;
    return `${base} text-slate-700`;
  }
}
