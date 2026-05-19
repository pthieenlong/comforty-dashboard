import { CurrencyPipe, DatePipe } from '@angular/common';
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
import {
  BadgeComponent,
  type ColumnDef,
  DataTableComponent,
  type DateRange,
  DateRangePickerComponent,
  PageHeaderComponent,
  PaginationComponent,
  SearchInputComponent,
  SelectComponent,
  type SelectOption,
  type SortState,
} from '@/shared/ui';
import { MOCK_TENANTS } from '@/core/tenant/tenant.mock';
import { PaymentStore } from './payment.store';
import {
  PAYMENT_METHOD_META,
  PAYMENT_STATUS_META,
  type IPayment,
  type PaymentMethod,
  type PaymentStatus,
} from './order.types';

const METHOD_OPTIONS: SelectOption<string>[] = [
  { value: '', label: 'Tất cả phương thức' },
  ...(
    Object.entries(PAYMENT_METHOD_META) as [
      PaymentMethod,
      (typeof PAYMENT_METHOD_META)[PaymentMethod],
    ][]
  ).map(([value, meta]) => ({ value, label: meta.label })),
];

const STATUS_OPTIONS: SelectOption<string>[] = [
  { value: '', label: 'Tất cả trạng thái' },
  ...(
    Object.entries(PAYMENT_STATUS_META) as [
      PaymentStatus,
      (typeof PAYMENT_STATUS_META)[PaymentStatus],
    ][]
  ).map(([value, meta]) => ({ value, label: meta.label })),
];

const TENANT_OPTIONS: SelectOption<string>[] = [
  { value: '', label: 'Tất cả chi nhánh' },
  ...MOCK_TENANTS.filter((t) => t.type === 'store').map((t) => ({ value: t.id, label: t.name })),
];

@Component({
  selector: 'app-payments-list',
  imports: [
    BadgeComponent,
    CurrencyPipe,
    DataTableComponent,
    DatePipe,
    DateRangePickerComponent,
    FormsModule,
    PageHeaderComponent,
    PaginationComponent,
    RouterLink,
    SearchInputComponent,
    SelectComponent,
  ],
  template: `
    <div class="space-y-6">
      <app-page-header
        title="Thanh toán"
        description="Sổ giao dịch thanh toán. {{ payments().length }} giao dịch."
        [breadcrumb]="breadcrumb"
      />

      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <app-search-input
          id="pay-search"
          placeholder="Tìm mã giao dịch, đơn hàng..."
          [(ngModel)]="searchTerm"
        />
        <app-select
          id="pay-method"
          [options]="methodOptions"
          placeholder="Phương thức"
          [(ngModel)]="methodFilter"
        />
        <app-select
          id="pay-status"
          [options]="statusOptions"
          placeholder="Trạng thái"
          [(ngModel)]="statusFilter"
        />
        <app-select
          id="pay-tenant"
          [options]="tenantOptions"
          placeholder="Chi nhánh"
          [(ngModel)]="tenantFilter"
        />
        <app-date-range-picker id="pay-date" placeholder="Khoảng ngày" [(ngModel)]="dateRange" />
      </div>

      <app-data-table
        tableId="payments-table"
        [columns]="columns()"
        [rows]="paged()"
        trackByKey="id"
        [(sort)]="sortState"
        emptyTitle="Không có giao dịch nào khớp bộ lọc"
        emptyDescription="Thay đổi bộ lọc để tìm giao dịch khác."
      />

      <app-pagination [(page)]="page" [pageSize]="pageSize" [totalItems]="filtered().length" />
    </div>

    <ng-template #codeCell let-row="row">
      <a
        [routerLink]="['/payments', row.id]"
        class="font-mono text-sm font-medium text-slate-900 hover:text-indigo-600"
      >
        {{ row.code }}
      </a>
    </ng-template>

    <ng-template #orderCell let-row="row">
      <a
        [routerLink]="['/orders', row.orderId]"
        class="font-mono text-xs text-slate-600 hover:text-indigo-600"
      >
        {{ row.orderCode }}
      </a>
    </ng-template>

    <ng-template #methodCell let-row="row">
      <span class="text-sm text-slate-700">{{ methodLabel(row.method) }}</span>
    </ng-template>

    <ng-template #amountCell let-row="row">
      <span class="text-sm font-medium text-slate-900">
        {{ row.amount | currency: 'VND' : 'symbol-narrow' : '1.0-0' }}
      </span>
    </ng-template>

    <ng-template #statusCell let-row="row">
      <app-badge [variant]="statusVariant(row.status)" [dot]="true">
        {{ statusLabel(row.status) }}
      </app-badge>
    </ng-template>

    <ng-template #paidAtCell let-row="row">
      @if (row.paidAt) {
        <p class="text-xs text-slate-700">{{ row.paidAt | date: 'dd/MM/yyyy HH:mm' }}</p>
      } @else {
        <span class="text-xs text-slate-400">—</span>
      }
      <p class="text-xs text-slate-400">{{ tenantName(row.tenantId) }}</p>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentsListComponent {
  private readonly paymentStore = inject(PaymentStore);

  protected readonly payments = this.paymentStore.payments;
  protected readonly breadcrumb = [
    { label: 'Trang chủ', to: '/dashboard' },
    { label: 'Thanh toán' },
  ];

  protected readonly methodOptions = METHOD_OPTIONS;
  protected readonly statusOptions = STATUS_OPTIONS;
  protected readonly tenantOptions = TENANT_OPTIONS;

  protected readonly searchTerm = signal('');
  protected readonly methodFilter = signal<string>('');
  protected readonly statusFilter = signal<string>('');
  protected readonly tenantFilter = signal<string>('');
  protected readonly dateRange = signal<DateRange | null>(null);
  protected readonly sortState = signal<SortState | null>({
    column: 'paidAt',
    direction: 'desc',
  });
  protected readonly page = signal(1);
  protected readonly pageSize = 10;

  protected readonly codeCell = viewChild.required<TemplateRef<{ row: IPayment }>>('codeCell');
  protected readonly orderCell = viewChild.required<TemplateRef<{ row: IPayment }>>('orderCell');
  protected readonly methodCell = viewChild.required<TemplateRef<{ row: IPayment }>>('methodCell');
  protected readonly amountCell = viewChild.required<TemplateRef<{ row: IPayment }>>('amountCell');
  protected readonly statusCell = viewChild.required<TemplateRef<{ row: IPayment }>>('statusCell');
  protected readonly paidAtCell = viewChild.required<TemplateRef<{ row: IPayment }>>('paidAtCell');

  protected readonly columns = computed<ColumnDef<IPayment>[]>(() => [
    { key: 'code', header: 'Mã giao dịch', sortable: true, width: '14%', cell: this.codeCell() },
    { key: 'orderCode', header: 'Đơn hàng', sortable: true, width: '12%', cell: this.orderCell() },
    { key: 'method', header: 'Phương thức', width: '14%', cell: this.methodCell() },
    {
      key: 'amount',
      header: 'Số tiền',
      sortable: true,
      width: '16%',
      align: 'right',
      cell: this.amountCell(),
    },
    { key: 'status', header: 'Trạng thái', sortable: true, width: '14%', cell: this.statusCell() },
    {
      key: 'paidAt',
      header: 'Thanh toán lúc',
      sortable: true,
      width: '20%',
      cell: this.paidAtCell(),
    },
  ]);

  protected readonly filtered = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const method = this.methodFilter();
    const status = this.statusFilter();
    const tenant = this.tenantFilter();
    const range = this.dateRange();

    return this.payments().filter((p) => {
      if (method && p.method !== method) return false;
      if (status && p.status !== status) return false;
      if (tenant && p.tenantId !== tenant) return false;
      if (range?.start && (!p.paidAt || p.paidAt < range.start)) return false;
      if (range?.end && (!p.paidAt || p.paidAt > `${range.end}T23:59:59.999Z`)) return false;
      if (!term) return true;
      return (
        p.code.toLowerCase().includes(term) ||
        p.orderCode.toLowerCase().includes(term) ||
        (p.transactionRef?.toLowerCase().includes(term) ?? false)
      );
    });
  });

  protected readonly sorted = computed(() => {
    const sort = this.sortState();
    const list = this.filtered();
    if (!sort) return list;
    return [...list].sort((a, b) => {
      const av = a[sort.column as keyof IPayment];
      const bv = b[sort.column as keyof IPayment];
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

  protected methodLabel(m: PaymentMethod): string {
    return PAYMENT_METHOD_META[m].label;
  }

  protected statusLabel(s: PaymentStatus): string {
    return PAYMENT_STATUS_META[s].label;
  }

  protected statusVariant(s: PaymentStatus) {
    return PAYMENT_STATUS_META[s].badgeVariant;
  }

  protected tenantName(id: string): string {
    return MOCK_TENANTS.find((t) => t.id === id)?.name ?? id;
  }
}
