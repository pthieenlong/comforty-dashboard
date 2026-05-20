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
import { RouterLink } from '@angular/router';
import { LucidePlus } from '@lucide/angular';
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
import { VoucherStore } from './voucher.store';
import {
  VOUCHER_STATUS_META,
  VOUCHER_TYPE_META,
  type IVoucherBatch,
  type VoucherStatus,
  type VoucherType,
} from './marketing.types';

const TYPE_OPTIONS: SelectOption<string>[] = [
  { value: '', label: 'Tất cả loại' },
  ...(
    Object.entries(VOUCHER_TYPE_META) as [VoucherType, (typeof VOUCHER_TYPE_META)[VoucherType]][]
  ).map(([value, meta]) => ({ value, label: meta.label })),
];

const STATUS_OPTIONS: SelectOption<string>[] = [
  { value: '', label: 'Tất cả trạng thái' },
  ...(
    Object.entries(VOUCHER_STATUS_META) as [
      VoucherStatus,
      (typeof VOUCHER_STATUS_META)[VoucherStatus],
    ][]
  ).map(([value, meta]) => ({ value, label: meta.label })),
];

const PRICE_FORMATTER = new Intl.NumberFormat('vi-VN');

@Component({
  selector: 'app-vouchers-list',
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
        title="Voucher"
        description="Quản lý batch voucher (mã code). {{ batches().length }} batch."
        [breadcrumb]="breadcrumb"
      >
        <a routerLink="/marketing/vouchers/new" page-actions>
          <app-button variant="primary">
            <app-icon [icon]="plusIcon" size="md" />
            Tạo batch voucher
          </app-button>
        </a>
      </app-page-header>

      <div class="grid gap-3 sm:grid-cols-3">
        <app-search-input
          id="vch-search"
          placeholder="Tìm mã code, tên batch..."
          [(ngModel)]="searchTerm"
        />
        <app-select
          id="vch-type"
          [options]="typeOptions"
          placeholder="Loại"
          [(ngModel)]="typeFilter"
        />
        <app-select
          id="vch-status"
          [options]="statusOptions"
          placeholder="Trạng thái"
          [(ngModel)]="statusFilter"
        />
      </div>

      <app-data-table
        tableId="vouchers-table"
        [columns]="columns()"
        [rows]="paged()"
        trackByKey="id"
        [(sort)]="sortState"
        emptyTitle="Không có batch voucher nào"
        emptyDescription="Thay đổi bộ lọc hoặc tạo batch mới."
      />

      <app-pagination [(page)]="page" [pageSize]="pageSize" [totalItems]="filtered().length" />
    </div>

    <ng-template #nameCell let-row="row">
      <a [routerLink]="['/marketing/vouchers', row.id]" class="block hover:text-indigo-600">
        <p class="font-medium text-sm text-slate-900 truncate">{{ row.name }}</p>
        <p class="font-mono text-xs text-slate-500">{{ row.code }}</p>
      </a>
    </ng-template>

    <ng-template #typeCell let-row="row">
      <app-badge [variant]="row.voucherType === 'single_use' ? 'info' : 'neutral'">
        {{ typeLabel(row.voucherType) }}
      </app-badge>
    </ng-template>

    <ng-template #discountCell let-row="row">
      <span class="text-sm font-medium text-slate-900">
        @if (row.discountPercent !== null) {
          -{{ row.discountPercent }}%
        } @else if (row.discountAmount !== null) {
          -{{ formatPrice(row.discountAmount) }}₫
        } @else {
          —
        }
      </span>
      @if (row.minOrderValue > 0) {
        <p class="text-xs text-slate-500">đơn ≥ {{ formatPrice(row.minOrderValue) }}₫</p>
      }
    </ng-template>

    <ng-template #usageCell let-row="row">
      <span class="text-sm font-medium text-slate-900">
        {{ row.usedCount }} / {{ row.totalCodes }}
      </span>
      <p class="text-xs text-slate-500">{{ usagePercent(row) }}%</p>
    </ng-template>

    <ng-template #statusCell let-row="row">
      <app-badge [variant]="statusVariant(row.status)" [dot]="true">
        {{ statusLabel(row.status) }}
      </app-badge>
    </ng-template>

    <ng-template #rangeCell let-row="row">
      <p class="text-xs text-slate-700">{{ row.startAt | date: 'dd/MM/yyyy' }}</p>
      <p class="text-xs text-slate-500">→ {{ row.endAt | date: 'dd/MM/yyyy' }}</p>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VouchersListComponent {
  private readonly voucherStore = inject(VoucherStore);

  protected readonly batches = this.voucherStore.batches;
  protected readonly breadcrumb = [
    { label: 'Trang chủ', to: '/dashboard' },
    { label: 'Marketing' },
    { label: 'Voucher' },
  ];

  protected readonly plusIcon = LucidePlus.icon;
  protected readonly typeOptions = TYPE_OPTIONS;
  protected readonly statusOptions = STATUS_OPTIONS;

  protected readonly searchTerm = signal('');
  protected readonly typeFilter = signal<string>('');
  protected readonly statusFilter = signal<string>('');
  protected readonly sortState = signal<SortState | null>({
    column: 'startAt',
    direction: 'desc',
  });
  protected readonly page = signal(1);
  protected readonly pageSize = 10;

  protected readonly nameCell = viewChild.required<TemplateRef<{ row: IVoucherBatch }>>('nameCell');
  protected readonly typeCell = viewChild.required<TemplateRef<{ row: IVoucherBatch }>>('typeCell');
  protected readonly discountCell =
    viewChild.required<TemplateRef<{ row: IVoucherBatch }>>('discountCell');
  protected readonly usageCell =
    viewChild.required<TemplateRef<{ row: IVoucherBatch }>>('usageCell');
  protected readonly statusCell =
    viewChild.required<TemplateRef<{ row: IVoucherBatch }>>('statusCell');
  protected readonly rangeCell =
    viewChild.required<TemplateRef<{ row: IVoucherBatch }>>('rangeCell');

  protected readonly columns = computed<ColumnDef<IVoucherBatch>[]>(() => [
    { key: 'name', header: 'Batch voucher', sortable: true, width: '28%', cell: this.nameCell() },
    { key: 'voucherType', header: 'Loại', width: '14%', cell: this.typeCell() },
    { key: 'discount', header: 'Giảm', width: '16%', cell: this.discountCell() },
    {
      key: 'usedCount',
      header: 'Đã dùng',
      sortable: true,
      width: '12%',
      align: 'right',
      cell: this.usageCell(),
    },
    { key: 'status', header: 'Trạng thái', sortable: true, width: '12%', cell: this.statusCell() },
    { key: 'startAt', header: 'Thời gian', sortable: true, width: '18%', cell: this.rangeCell() },
  ]);

  protected readonly filtered = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const type = this.typeFilter();
    const status = this.statusFilter();
    return this.batches().filter((b) => {
      if (type && b.voucherType !== type) return false;
      if (status && b.status !== status) return false;
      if (!term) return true;
      return b.code.toLowerCase().includes(term) || b.name.toLowerCase().includes(term);
    });
  });

  protected readonly sorted = computed(() => {
    const sort = this.sortState();
    const list = this.filtered();
    if (!sort) return list;
    return [...list].sort((a, b) => {
      const av = a[sort.column as keyof IVoucherBatch];
      const bv = b[sort.column as keyof IVoucherBatch];
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

  protected typeLabel(t: VoucherType): string {
    return VOUCHER_TYPE_META[t].label;
  }

  protected statusLabel(s: VoucherStatus): string {
    return VOUCHER_STATUS_META[s].label;
  }

  protected statusVariant(s: VoucherStatus) {
    return VOUCHER_STATUS_META[s].badgeVariant;
  }

  protected formatPrice(n: number): string {
    return PRICE_FORMATTER.format(n);
  }

  protected usagePercent(b: IVoucherBatch): number {
    if (b.totalCodes === 0) return 0;
    return Math.round((b.usedCount / b.totalCodes) * 100);
  }
}
