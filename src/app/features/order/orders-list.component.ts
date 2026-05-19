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
import { Router, RouterLink } from '@angular/router';
import {
  LucideBan,
  LucideCheck,
  LucideEye,
  LucideMoreHorizontal,
  LucidePlus,
  LucideRotateCcw,
} from '@lucide/angular';
import {
  BadgeComponent,
  ButtonComponent,
  type ColumnDef,
  ConfirmDialogService,
  DataTableComponent,
  type DateRange,
  DateRangePickerComponent,
  DropdownComponent,
  DropdownItemComponent,
  DropdownTriggerDirective,
  IconComponent,
  PageHeaderComponent,
  PaginationComponent,
  SearchInputComponent,
  SelectComponent,
  type SelectOption,
  type SortState,
  ToastService,
} from '@/shared/ui';
import { MOCK_TENANTS } from '@/core/tenant/tenant.mock';
import { OrderStore } from './order.store';
import { ORDER_STATUS_META, type OrderStatus } from './order.types';
import type { IOrder } from './order.types';

const CHANNEL_OPTIONS: SelectOption<string>[] = [
  { value: '', label: 'Tất cả kênh' },
  { value: 'online', label: 'Online' },
  { value: 'pos', label: 'POS' },
];

const STATUS_OPTIONS: SelectOption<string>[] = [
  { value: '', label: 'Tất cả trạng thái' },
  ...(
    Object.entries(ORDER_STATUS_META) as [OrderStatus, (typeof ORDER_STATUS_META)[OrderStatus]][]
  ).map(([value, meta]) => ({ value, label: meta.label })),
];

const TENANT_OPTIONS: SelectOption<string>[] = [
  { value: '', label: 'Tất cả chi nhánh' },
  ...MOCK_TENANTS.filter((t) => t.type === 'store').map((t) => ({ value: t.id, label: t.name })),
];

@Component({
  selector: 'app-orders-list',
  imports: [
    BadgeComponent,
    ButtonComponent,
    CurrencyPipe,
    DataTableComponent,
    DatePipe,
    DateRangePickerComponent,
    DropdownComponent,
    DropdownItemComponent,
    DropdownTriggerDirective,
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
        title="Đơn hàng"
        description="Quản lý đơn hàng online và POS. {{ orders().length }} đơn."
        [breadcrumb]="breadcrumb"
      >
        <a routerLink="/orders/new" page-actions>
          <app-button variant="primary">
            <app-icon [icon]="plusIcon" size="md" />
            Tạo đơn POS
          </app-button>
        </a>
      </app-page-header>

      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <app-search-input
          id="ord-search"
          placeholder="Tìm mã đơn, khách hàng..."
          [(ngModel)]="searchTerm"
        />
        <app-select
          id="ord-channel"
          [options]="channelOptions"
          placeholder="Kênh"
          [(ngModel)]="channelFilter"
        />
        <app-select
          id="ord-status"
          [options]="statusOptions"
          placeholder="Trạng thái"
          [searchable]="true"
          [(ngModel)]="statusFilter"
        />
        <app-select
          id="ord-tenant"
          [options]="tenantOptions"
          placeholder="Chi nhánh"
          [(ngModel)]="tenantFilter"
        />
        <app-date-range-picker id="ord-date" placeholder="Khoảng ngày" [(ngModel)]="dateRange" />
      </div>

      <app-data-table
        tableId="orders-table"
        [columns]="columns()"
        [rows]="paged()"
        trackByKey="id"
        [(sort)]="sortState"
        emptyTitle="Không có đơn nào khớp bộ lọc"
        emptyDescription="Thay đổi bộ lọc hoặc tạo đơn mới."
      />

      <app-pagination [(page)]="page" [pageSize]="pageSize" [totalItems]="filtered().length" />
    </div>

    <ng-template #codeCell let-row="row">
      <a
        [routerLink]="['/orders', row.id]"
        class="font-mono text-sm font-medium text-slate-900 hover:text-indigo-600"
      >
        {{ row.code }}
      </a>
    </ng-template>

    <ng-template #channelCell let-row="row">
      @if (row.channel === 'pos') {
        <app-badge variant="info">POS</app-badge>
      } @else {
        <app-badge variant="neutral">Online</app-badge>
      }
    </ng-template>

    <ng-template #actionsCell let-row="row">
      <app-dropdown align="end">
        <button
          appDropdownTrigger
          type="button"
          class="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          [attr.aria-label]="'Thao tác đơn ' + row.code"
          (click)="$event.stopPropagation()"
        >
          <app-icon [icon]="moreIcon" size="md" />
        </button>
        <a [routerLink]="['/orders', row.id]" class="block" (click)="$event.stopPropagation()">
          <app-dropdown-item>
            <app-icon [icon]="viewIcon" size="sm" />
            Xem chi tiết
          </app-dropdown-item>
        </a>
        @if (canConfirm(row)) {
          <app-dropdown-item (click)="onConfirm(row); $event.stopPropagation()">
            <app-icon [icon]="checkIcon" size="sm" />
            Xác nhận đơn
          </app-dropdown-item>
        }
        @if (canRefund(row)) {
          <app-dropdown-item (click)="onGoToRefund(row); $event.stopPropagation()">
            <app-icon [icon]="refundIcon" size="sm" />
            Hoàn hàng
          </app-dropdown-item>
        }
        @if (canCancel(row)) {
          <app-dropdown-item [danger]="true" (click)="onCancel(row); $event.stopPropagation()">
            <app-icon [icon]="banIcon" size="sm" />
            Huỷ đơn
          </app-dropdown-item>
        }
      </app-dropdown>
    </ng-template>

    <ng-template #customerCell let-row="row">
      <div class="min-w-0">
        <p class="truncate text-sm text-slate-900">{{ row.customerName }}</p>
        @if (row.customerPhone) {
          <p class="truncate text-xs text-slate-500">{{ row.customerPhone }}</p>
        }
      </div>
    </ng-template>

    <ng-template #itemsCell let-row="row">
      <span class="text-sm text-slate-700">{{ row.items.length }} sản phẩm</span>
    </ng-template>

    <ng-template #totalCell let-row="row">
      <span class="text-sm font-medium text-slate-900">
        {{ row.total | currency: 'VND' : 'symbol-narrow' : '1.0-0' }}
      </span>
    </ng-template>

    <ng-template #statusCell let-row="row">
      <app-badge [variant]="statusVariant(row.status)" [dot]="true">
        {{ statusLabel(row.status) }}
      </app-badge>
    </ng-template>

    <ng-template #placedAtCell let-row="row">
      <p class="text-xs text-slate-700">{{ row.placedAt | date: 'dd/MM/yyyy HH:mm' }}</p>
      <p class="text-xs text-slate-400">{{ tenantName(row.tenantId) }}</p>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersListComponent {
  private readonly orderStore = inject(OrderStore);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly confirmDialog = inject(ConfirmDialogService);

  protected readonly orders = this.orderStore.orders;
  protected readonly breadcrumb = [{ label: 'Trang chủ', to: '/dashboard' }, { label: 'Đơn hàng' }];

  protected readonly plusIcon = LucidePlus.icon;
  protected readonly moreIcon = LucideMoreHorizontal.icon;
  protected readonly viewIcon = LucideEye.icon;
  protected readonly checkIcon = LucideCheck.icon;
  protected readonly refundIcon = LucideRotateCcw.icon;
  protected readonly banIcon = LucideBan.icon;

  protected readonly channelOptions = CHANNEL_OPTIONS;
  protected readonly statusOptions = STATUS_OPTIONS;
  protected readonly tenantOptions = TENANT_OPTIONS;

  protected readonly searchTerm = signal('');
  protected readonly channelFilter = signal<string>('');
  protected readonly statusFilter = signal<string>('');
  protected readonly tenantFilter = signal<string>('');
  protected readonly dateRange = signal<DateRange | null>(null);
  protected readonly sortState = signal<SortState | null>({
    column: 'placedAt',
    direction: 'desc',
  });
  protected readonly page = signal(1);
  protected readonly pageSize = 10;

  protected readonly codeCell = viewChild.required<TemplateRef<{ row: IOrder }>>('codeCell');
  protected readonly channelCell = viewChild.required<TemplateRef<{ row: IOrder }>>('channelCell');
  protected readonly customerCell =
    viewChild.required<TemplateRef<{ row: IOrder }>>('customerCell');
  protected readonly itemsCell = viewChild.required<TemplateRef<{ row: IOrder }>>('itemsCell');
  protected readonly totalCell = viewChild.required<TemplateRef<{ row: IOrder }>>('totalCell');
  protected readonly statusCell = viewChild.required<TemplateRef<{ row: IOrder }>>('statusCell');
  protected readonly placedAtCell =
    viewChild.required<TemplateRef<{ row: IOrder }>>('placedAtCell');
  protected readonly actionsCell = viewChild.required<TemplateRef<{ row: IOrder }>>('actionsCell');

  protected readonly columns = computed<ColumnDef<IOrder>[]>(() => [
    { key: 'code', header: 'Mã đơn', sortable: true, width: '11%', cell: this.codeCell() },
    { key: 'channel', header: 'Loại', sortable: true, width: '8%', cell: this.channelCell() },
    {
      key: 'customerName',
      header: 'Khách hàng',
      sortable: true,
      width: '18%',
      cell: this.customerCell(),
    },
    { key: 'items', header: 'Hàng', width: '10%', cell: this.itemsCell() },
    {
      key: 'total',
      header: 'Tổng',
      sortable: true,
      width: '12%',
      align: 'right',
      cell: this.totalCell(),
    },
    { key: 'status', header: 'Trạng thái', sortable: true, width: '13%', cell: this.statusCell() },
    { key: 'placedAt', header: 'Đặt lúc', sortable: true, width: '16%', cell: this.placedAtCell() },
    { key: 'actions', header: '', width: '60px', align: 'right', cell: this.actionsCell() },
  ]);

  protected readonly filtered = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const channel = this.channelFilter();
    const status = this.statusFilter();
    const tenant = this.tenantFilter();
    const range = this.dateRange();

    return this.orders().filter((o) => {
      if (channel && o.channel !== channel) return false;
      if (status && o.status !== status) return false;
      if (tenant && o.tenantId !== tenant) return false;
      if (range?.start && o.placedAt < range.start) return false;
      if (range?.end && o.placedAt > `${range.end}T23:59:59.999Z`) return false;
      if (!term) return true;
      return (
        o.code.toLowerCase().includes(term) ||
        o.customerName.toLowerCase().includes(term) ||
        o.customerPhone.includes(term)
      );
    });
  });

  protected readonly sorted = computed(() => {
    const sort = this.sortState();
    const list = this.filtered();
    if (!sort) return list;
    return [...list].sort((a, b) => {
      const av = a[sort.column as keyof IOrder];
      const bv = b[sort.column as keyof IOrder];
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

  protected statusLabel(s: OrderStatus): string {
    return ORDER_STATUS_META[s].label;
  }

  protected statusVariant(s: OrderStatus) {
    return ORDER_STATUS_META[s].badgeVariant;
  }

  protected tenantName(id: string): string {
    return MOCK_TENANTS.find((t) => t.id === id)?.name ?? id;
  }

  protected canConfirm(o: IOrder): boolean {
    return o.status === 'draft' || o.status === 'pending_payment';
  }

  protected canCancel(o: IOrder): boolean {
    return ['draft', 'pending_payment', 'confirmed', 'preparing'].includes(o.status);
  }

  protected canRefund(o: IOrder): boolean {
    if (o.status !== 'completed' && o.status !== 'partial_refunded') return false;
    return o.items.some((it) => it.quantity - it.refundedQuantity > 0);
  }

  protected async onConfirm(o: IOrder): Promise<void> {
    const result = await this.orderStore.transition(
      o.id,
      'confirmed',
      'Bạn',
      'Xác nhận đơn từ danh sách',
    );
    if (result) {
      this.toast.success(`Đã xác nhận đơn ${o.code}`);
    }
  }

  protected async onCancel(o: IOrder): Promise<void> {
    const ok = await this.confirmDialog.confirm({
      title: `Huỷ đơn ${o.code}`,
      message: 'Đơn sẽ bị huỷ và không thể tiếp tục. Bạn có chắc chắn?',
      confirmText: 'Huỷ đơn',
      variant: 'danger',
    });
    if (!ok) return;
    await this.orderStore.transition(o.id, 'cancelled', 'Bạn', 'Huỷ đơn từ danh sách');
    this.toast.success(`Đã huỷ đơn ${o.code}`);
  }

  protected onGoToRefund(o: IOrder): void {
    // Refund flow lives on the detail page (line-item picker).
    this.router.navigate(['/orders', o.id], { queryParams: { action: 'refund' } });
  }
}
