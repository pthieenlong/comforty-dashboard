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
import { LucideArrowRight, LucidePlus } from '@lucide/angular';
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
} from '@/shared/ui';
import { MOCK_WAREHOUSES } from '@/core/warehouse/warehouse.mock';
import { TRANSFERS } from './inventory.mock';
import type { ITransfer, TransferStatus } from './inventory.types';

const STATUS_LABEL: Record<TransferStatus, string> = {
  draft: 'Nháp',
  pending: 'Chờ xuất kho',
  in_transit: 'Đang chuyển',
  received: 'Đã nhận',
  cancelled: 'Đã huỷ',
};

const STATUS_VARIANT: Record<
  TransferStatus,
  'neutral' | 'warning' | 'info' | 'success' | 'danger'
> = {
  draft: 'neutral',
  pending: 'warning',
  in_transit: 'info',
  received: 'success',
  cancelled: 'danger',
};

const STATUS_OPTIONS: SelectOption<string>[] = [
  { value: '', label: 'Tất cả trạng thái' },
  ...Object.entries(STATUS_LABEL).map(([value, label]) => ({ value, label })),
];

@Component({
  selector: 'app-transfers-list',
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
  ],
  template: `
    <div class="space-y-6">
      <app-page-header
        title="Điều chuyển kho"
        description="Quản lý các phiếu chuyển hàng giữa kho. {{ transfers.length }} phiếu."
        [breadcrumb]="breadcrumb"
      >
        <a routerLink="/inventory/transfers/new" page-actions>
          <app-button variant="primary">
            <app-icon [icon]="plusIcon" size="md" />
            Tạo phiếu chuyển
          </app-button>
        </a>
      </app-page-header>

      <div class="grid gap-3 sm:grid-cols-2">
        <app-search-input
          id="trf-search"
          placeholder="Tìm mã phiếu, ghi chú..."
          [(ngModel)]="searchTerm"
        />
        <app-select
          id="trf-status"
          [options]="statusOptions"
          placeholder="Trạng thái"
          [(ngModel)]="statusFilter"
        />
      </div>

      <app-data-table
        tableId="transfers-table"
        [columns]="columns()"
        [rows]="paged()"
        trackByKey="id"
        [(sort)]="sortState"
        emptyTitle="Chưa có phiếu chuyển"
        emptyDescription="Tạo phiếu mới hoặc thay đổi bộ lọc."
      />

      <app-pagination [(page)]="page" [pageSize]="pageSize" [totalItems]="filtered().length" />
    </div>

    <ng-template #codeCell let-row="row">
      <a
        [routerLink]="['/inventory/transfers', row.id]"
        class="text-sm font-medium text-slate-900 hover:text-indigo-600 font-mono"
      >
        {{ row.code }}
      </a>
    </ng-template>

    <ng-template #routeCell let-row="row">
      <div class="flex items-center gap-2 text-sm text-slate-700">
        <span class="truncate">{{ warehouseName(row.fromWarehouseId) }}</span>
        <app-icon [icon]="arrowIcon" size="xs" />
        <span class="truncate">{{ warehouseName(row.toWarehouseId) }}</span>
      </div>
    </ng-template>

    <ng-template #linesCell let-row="row">
      <span class="text-sm text-slate-700">
        {{ row.lines.length }} dòng · {{ row.totalQuantity }} sp
      </span>
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

    <ng-template #etaCell let-row="row">
      @if (row.receivedAt) {
        <span class="text-xs text-green-700"> Nhận: {{ row.receivedAt | date: 'dd/MM' }} </span>
      } @else if (row.expectedAt) {
        <span class="text-xs text-slate-600"> Dự kiến: {{ row.expectedAt | date: 'dd/MM' }} </span>
      } @else {
        <span class="text-xs text-slate-400">—</span>
      }
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransfersListComponent {
  protected readonly transfers = TRANSFERS;
  protected readonly breadcrumb = [{ label: 'Kho' }, { label: 'Điều chuyển' }];

  protected readonly plusIcon = LucidePlus.icon;
  protected readonly arrowIcon = LucideArrowRight.icon;

  protected readonly searchTerm = signal('');
  protected readonly statusFilter = signal<string>('');
  protected readonly sortState = signal<SortState | null>({
    column: 'createdAt',
    direction: 'desc',
  });
  protected readonly page = signal(1);
  protected readonly pageSize = 10;

  protected readonly statusOptions = STATUS_OPTIONS;

  protected readonly codeCell = viewChild.required<TemplateRef<{ row: ITransfer }>>('codeCell');
  protected readonly routeCell = viewChild.required<TemplateRef<{ row: ITransfer }>>('routeCell');
  protected readonly linesCell = viewChild.required<TemplateRef<{ row: ITransfer }>>('linesCell');
  protected readonly statusCell = viewChild.required<TemplateRef<{ row: ITransfer }>>('statusCell');
  protected readonly createdCell =
    viewChild.required<TemplateRef<{ row: ITransfer }>>('createdCell');
  protected readonly etaCell = viewChild.required<TemplateRef<{ row: ITransfer }>>('etaCell');

  protected readonly columns = computed<ColumnDef<ITransfer>[]>(() => [
    { key: 'code', header: 'Mã phiếu', sortable: true, width: '12%', cell: this.codeCell() },
    { key: 'route', header: 'Tuyến', width: '26%', cell: this.routeCell() },
    { key: 'lines', header: 'Hàng', width: '16%', cell: this.linesCell() },
    { key: 'status', header: 'Trạng thái', sortable: true, width: '14%', cell: this.statusCell() },
    {
      key: 'createdAt',
      header: 'Tạo lúc',
      sortable: true,
      width: '16%',
      cell: this.createdCell(),
    },
    { key: 'eta', header: 'Dự kiến/Nhận', width: '16%', cell: this.etaCell() },
  ]);

  protected readonly filtered = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const status = this.statusFilter() as TransferStatus | '';
    return this.transfers.filter((t) => {
      if (status && t.status !== status) return false;
      if (!term) return true;
      return t.code.toLowerCase().includes(term) || t.note.toLowerCase().includes(term);
    });
  });

  protected readonly sorted = computed(() => {
    const sort = this.sortState();
    const list = this.filtered();
    if (!sort) return list;
    return [...list].sort((a, b) => {
      const av = a[sort.column as keyof ITransfer];
      const bv = b[sort.column as keyof ITransfer];
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

  protected statusLabel(s: TransferStatus): string {
    return STATUS_LABEL[s];
  }

  protected statusVariant(s: TransferStatus) {
    return STATUS_VARIANT[s];
  }

  protected warehouseName(id: string): string {
    return MOCK_WAREHOUSES.find((w) => w.id === id)?.name ?? id;
  }
}
