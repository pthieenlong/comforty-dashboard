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
import { LucideClipboardCheck, LucidePlus } from '@lucide/angular';
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
  TagComponent,
} from '@/shared/ui';
import { MOCK_WAREHOUSES } from '@/core/warehouse/warehouse.mock';
import { STOCK_TAKES } from './inventory.mock';
import type { IStockTake, StockTakeStatus } from './inventory.types';

const STATUS_LABEL: Record<StockTakeStatus, string> = {
  draft: 'Nháp',
  in_progress: 'Đang kiểm',
  completed: 'Đã hoàn tất',
  cancelled: 'Đã huỷ',
};

const STATUS_VARIANT: Record<StockTakeStatus, 'neutral' | 'warning' | 'success' | 'danger'> = {
  draft: 'neutral',
  in_progress: 'warning',
  completed: 'success',
  cancelled: 'danger',
};

const STATUS_OPTIONS: SelectOption<string>[] = [
  { value: '', label: 'Tất cả trạng thái' },
  ...Object.entries(STATUS_LABEL).map(([value, label]) => ({ value, label })),
];

const WAREHOUSE_OPTIONS: SelectOption<string>[] = [
  { value: '', label: 'Tất cả kho' },
  ...MOCK_WAREHOUSES.map((w) => ({ value: w.id, label: w.name })),
];

@Component({
  selector: 'app-stock-take-list',
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
    TagComponent,
  ],
  template: `
    <div class="space-y-6">
      <app-page-header
        title="Kiểm kê kho"
        description="Quản lý phiên kiểm kê — đối chiếu tồn thực tế với hệ thống. {{
          takes.length
        }} phiên."
        [breadcrumb]="breadcrumb"
      >
        <a routerLink="/inventory/stock-take/new" page-actions>
          <app-button variant="primary">
            <app-icon [icon]="plusIcon" size="md" />
            Tạo phiên kiểm kê
          </app-button>
        </a>
      </app-page-header>

      <div class="grid gap-3 sm:grid-cols-3">
        <app-search-input
          id="st-search"
          placeholder="Tìm mã, ghi chú..."
          [(ngModel)]="searchTerm"
        />
        <app-select
          id="st-status"
          [options]="statusOptions"
          placeholder="Trạng thái"
          [(ngModel)]="statusFilter"
        />
        <app-select
          id="st-wh"
          [options]="warehouseOptions"
          placeholder="Kho"
          [(ngModel)]="warehouseFilter"
        />
      </div>

      <app-data-table
        tableId="stock-take-table"
        [columns]="columns()"
        [rows]="paged()"
        trackByKey="id"
        [(sort)]="sortState"
        emptyTitle="Chưa có phiên kiểm kê"
        emptyDescription="Tạo phiên mới hoặc thay đổi bộ lọc."
      />

      <app-pagination [(page)]="page" [pageSize]="pageSize" [totalItems]="filtered().length" />
    </div>

    <ng-template #codeCell let-row="row">
      <a
        [routerLink]="['/inventory/stock-take', row.id]"
        class="flex items-center gap-2 text-sm font-medium text-slate-900 hover:text-indigo-600"
      >
        <app-icon [icon]="clipboardIcon" size="sm" />
        <span class="font-mono">{{ row.code }}</span>
      </a>
    </ng-template>

    <ng-template #scopeCell let-row="row">
      @if (row.scope === 'full') {
        <app-tag variant="primary">Toàn bộ</app-tag>
      } @else {
        <app-tag variant="neutral">Một phần</app-tag>
      }
    </ng-template>

    <ng-template #warehouseCell let-row="row">
      <span class="text-sm text-slate-700">{{ warehouseName(row.warehouseId) }}</span>
    </ng-template>

    <ng-template #linesCell let-row="row">
      <span class="text-sm text-slate-700">
        {{ countedLines(row) }}/{{ row.lines.length }} dòng
      </span>
    </ng-template>

    <ng-template #varianceCell let-row="row">
      @if (varianceFor(row); as v) {
        <span [class]="varianceClass(v)"> {{ v > 0 ? '+' : '' }}{{ v }} </span>
      } @else {
        <span class="text-xs text-slate-400">—</span>
      }
    </ng-template>

    <ng-template #statusCell let-row="row">
      <app-badge [variant]="statusVariant(row.status)" [dot]="true">
        {{ statusLabel(row.status) }}
      </app-badge>
    </ng-template>

    <ng-template #createdCell let-row="row">
      <div>
        <p class="text-xs text-slate-700">{{ row.createdAt | date: 'dd/MM/yyyy' }}</p>
        <p class="text-xs text-slate-400">{{ row.createdBy }}</p>
      </div>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockTakeListComponent {
  protected readonly takes = STOCK_TAKES;
  protected readonly breadcrumb = [{ label: 'Kho' }, { label: 'Kiểm kê' }];

  protected readonly plusIcon = LucidePlus.icon;
  protected readonly clipboardIcon = LucideClipboardCheck.icon;

  protected readonly searchTerm = signal('');
  protected readonly statusFilter = signal<string>('');
  protected readonly warehouseFilter = signal<string>('');
  protected readonly sortState = signal<SortState | null>({
    column: 'createdAt',
    direction: 'desc',
  });
  protected readonly page = signal(1);
  protected readonly pageSize = 10;

  protected readonly statusOptions = STATUS_OPTIONS;
  protected readonly warehouseOptions = WAREHOUSE_OPTIONS;

  protected readonly codeCell = viewChild.required<TemplateRef<{ row: IStockTake }>>('codeCell');
  protected readonly scopeCell = viewChild.required<TemplateRef<{ row: IStockTake }>>('scopeCell');
  protected readonly warehouseCell =
    viewChild.required<TemplateRef<{ row: IStockTake }>>('warehouseCell');
  protected readonly linesCell = viewChild.required<TemplateRef<{ row: IStockTake }>>('linesCell');
  protected readonly varianceCell =
    viewChild.required<TemplateRef<{ row: IStockTake }>>('varianceCell');
  protected readonly statusCell =
    viewChild.required<TemplateRef<{ row: IStockTake }>>('statusCell');
  protected readonly createdCell =
    viewChild.required<TemplateRef<{ row: IStockTake }>>('createdCell');

  protected readonly columns = computed<ColumnDef<IStockTake>[]>(() => [
    { key: 'code', header: 'Mã phiên', sortable: true, width: '14%', cell: this.codeCell() },
    { key: 'scope', header: 'Phạm vi', width: '10%', cell: this.scopeCell() },
    { key: 'warehouseId', header: 'Kho', width: '18%', cell: this.warehouseCell() },
    { key: 'lines', header: 'Tiến độ', width: '14%', cell: this.linesCell() },
    { key: 'variance', header: 'Chênh lệch', width: '12%', cell: this.varianceCell() },
    { key: 'status', header: 'Trạng thái', sortable: true, width: '14%', cell: this.statusCell() },
    {
      key: 'createdAt',
      header: 'Tạo lúc',
      sortable: true,
      width: '18%',
      cell: this.createdCell(),
    },
  ]);

  protected readonly filtered = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const status = this.statusFilter() as StockTakeStatus | '';
    const wh = this.warehouseFilter();
    return this.takes.filter((t) => {
      if (status && t.status !== status) return false;
      if (wh && t.warehouseId !== wh) return false;
      if (!term) return true;
      return t.code.toLowerCase().includes(term) || t.note.toLowerCase().includes(term);
    });
  });

  protected readonly sorted = computed(() => {
    const sort = this.sortState();
    const list = this.filtered();
    if (!sort) return list;
    return [...list].sort((a, b) => {
      const av = a[sort.column as keyof IStockTake];
      const bv = b[sort.column as keyof IStockTake];
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

  protected statusLabel(s: StockTakeStatus): string {
    return STATUS_LABEL[s];
  }

  protected statusVariant(s: StockTakeStatus) {
    return STATUS_VARIANT[s];
  }

  protected warehouseName(id: string): string {
    return MOCK_WAREHOUSES.find((w) => w.id === id)?.name ?? id;
  }

  protected countedLines(t: IStockTake): number {
    return t.lines.filter((l) => l.countedQuantity !== null).length;
  }

  protected varianceFor(t: IStockTake): number | null {
    if (t.status === 'draft' || t.status === 'cancelled') return null;
    const counted = t.lines.filter((l) => l.countedQuantity !== null);
    if (counted.length === 0) return null;
    return counted.reduce((sum, l) => sum + ((l.countedQuantity ?? 0) - l.expectedQuantity), 0);
  }

  protected varianceClass(v: number): string {
    const base = 'text-sm font-semibold';
    if (v > 0) return `${base} text-green-700`;
    if (v < 0) return `${base} text-red-600`;
    return `${base} text-slate-700`;
  }
}
