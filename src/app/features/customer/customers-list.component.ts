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
import { LucideUserPlus } from '@lucide/angular';
import {
  AvatarComponent,
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
import { CUSTOMERS, TIER_META } from './customer.mock';
import type { ICustomer, LoyaltyTier } from './customer.types';

const PRICE_FORMATTER = new Intl.NumberFormat('vi-VN');

const TIER_OPTIONS: SelectOption<string>[] = [
  { value: '', label: 'Tất cả hạng' },
  { value: 'bronze', label: 'Bronze' },
  { value: 'silver', label: 'Silver' },
  { value: 'gold', label: 'Gold' },
  { value: 'platinum', label: 'Platinum' },
];

const HAS_ORDERS_OPTIONS: SelectOption<string>[] = [
  { value: '', label: 'Tất cả khách hàng' },
  { value: 'yes', label: 'Đã có đơn' },
  { value: 'no', label: 'Chưa có đơn' },
];

@Component({
  selector: 'app-customers-list',
  imports: [
    AvatarComponent,
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
        title="Khách hàng"
        description="Quản lý {{ customers.length }} khách hàng, phân loại theo hạng và lịch sử mua."
        [breadcrumb]="breadcrumb"
      >
        <app-button variant="primary" page-actions [disabled]="true">
          <app-icon [icon]="userPlusIcon" size="md" />
          Thêm khách hàng
        </app-button>
      </app-page-header>

      <div class="grid gap-3 lg:grid-cols-4">
        <app-search-input
          id="cust-search"
          placeholder="Tìm tên, email, số điện thoại, mã..."
          [(ngModel)]="searchTerm"
          class="lg:col-span-2"
        />
        <app-select
          id="cust-tier"
          [options]="tierOptions"
          placeholder="Hạng"
          [(ngModel)]="tierFilter"
        />
        <app-select
          id="cust-orders"
          [options]="hasOrdersOptions"
          placeholder="Lịch sử đơn"
          [(ngModel)]="hasOrdersFilter"
        />
      </div>

      <div class="grid gap-3 sm:grid-cols-2">
        <label class="flex flex-col gap-1">
          <span class="text-xs font-medium text-slate-500">Đặt hàng từ ngày</span>
          <input
            type="date"
            class="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            [(ngModel)]="dateFrom"
          />
        </label>
        <label class="flex flex-col gap-1">
          <span class="text-xs font-medium text-slate-500">đến ngày</span>
          <input
            type="date"
            class="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            [(ngModel)]="dateTo"
          />
        </label>
      </div>

      <app-data-table
        tableId="customers-table"
        [columns]="columns()"
        [rows]="paged()"
        trackByKey="id"
        [(sort)]="sortState"
        emptyTitle="Không tìm thấy khách hàng"
        emptyDescription="Thử thay đổi bộ lọc hoặc xóa từ khóa tìm kiếm."
      />

      <app-pagination [(page)]="page" [pageSize]="pageSize" [totalItems]="filtered().length" />
    </div>

    <ng-template #customerCell let-row="row">
      <div class="flex items-center gap-3 min-w-0">
        <app-avatar [name]="row.fullName" size="sm" />
        <div class="min-w-0">
          <a
            [routerLink]="['/customers', row.id]"
            class="text-sm font-medium text-slate-900 hover:text-indigo-600 truncate block"
          >
            {{ row.fullName }}
          </a>
          <p class="text-xs text-slate-500 truncate">{{ row.email }}</p>
        </div>
      </div>
    </ng-template>

    <ng-template #codeCell let-row="row">
      <span class="text-xs font-mono text-slate-600">{{ row.code }}</span>
    </ng-template>

    <ng-template #phoneCell let-row="row">
      <span class="text-sm text-slate-700">{{ row.phone }}</span>
    </ng-template>

    <ng-template #tierCell let-row="row">
      <app-tag [variant]="tierVariant(row.tier)">
        {{ tierLabel(row.tier) }}
      </app-tag>
    </ng-template>

    <ng-template #ordersCell let-row="row">
      <span class="text-sm font-medium text-slate-900">{{ row.totalOrders }}</span>
    </ng-template>

    <ng-template #spentCell let-row="row">
      <span class="text-sm font-medium text-slate-900">{{ formatPrice(row.totalSpent) }} ₫</span>
    </ng-template>

    <ng-template #lastOrderCell let-row="row">
      @if (row.lastOrderAt) {
        <span class="text-xs text-slate-600">{{ row.lastOrderAt | date: 'dd/MM/yyyy' }}</span>
      } @else {
        <span class="text-xs text-slate-400">Chưa có</span>
      }
    </ng-template>

    <ng-template #statusCell let-row="row">
      @if (row.status === 'active') {
        <app-badge variant="success" [dot]="true">Hoạt động</app-badge>
      } @else {
        <app-badge variant="neutral" [dot]="true">Ngừng</app-badge>
      }
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomersListComponent {
  protected readonly customers = CUSTOMERS;
  protected readonly breadcrumb = [{ label: 'Bán hàng' }, { label: 'Khách hàng' }];

  protected readonly userPlusIcon = LucideUserPlus.icon;

  protected readonly searchTerm = signal('');
  protected readonly tierFilter = signal<string>('');
  protected readonly hasOrdersFilter = signal<string>('');
  protected readonly dateFrom = signal<string>('');
  protected readonly dateTo = signal<string>('');
  protected readonly sortState = signal<SortState | null>({
    column: 'lastOrderAt',
    direction: 'desc',
  });
  protected readonly page = signal(1);
  protected readonly pageSize = 10;

  protected readonly tierOptions = TIER_OPTIONS;
  protected readonly hasOrdersOptions = HAS_ORDERS_OPTIONS;

  protected readonly customerCell =
    viewChild.required<TemplateRef<{ row: ICustomer }>>('customerCell');
  protected readonly codeCell = viewChild.required<TemplateRef<{ row: ICustomer }>>('codeCell');
  protected readonly phoneCell = viewChild.required<TemplateRef<{ row: ICustomer }>>('phoneCell');
  protected readonly tierCell = viewChild.required<TemplateRef<{ row: ICustomer }>>('tierCell');
  protected readonly ordersCell = viewChild.required<TemplateRef<{ row: ICustomer }>>('ordersCell');
  protected readonly spentCell = viewChild.required<TemplateRef<{ row: ICustomer }>>('spentCell');
  protected readonly lastOrderCell =
    viewChild.required<TemplateRef<{ row: ICustomer }>>('lastOrderCell');
  protected readonly statusCell = viewChild.required<TemplateRef<{ row: ICustomer }>>('statusCell');

  protected readonly columns = computed<ColumnDef<ICustomer>[]>(() => [
    {
      key: 'fullName',
      header: 'Khách hàng',
      sortable: true,
      width: '24%',
      cell: this.customerCell(),
    },
    { key: 'code', header: 'Mã', width: '10%', cell: this.codeCell() },
    { key: 'phone', header: 'SĐT', width: '12%', cell: this.phoneCell() },
    { key: 'tier', header: 'Hạng', sortable: true, width: '10%', cell: this.tierCell() },
    { key: 'totalOrders', header: 'Đơn', sortable: true, width: '8%', cell: this.ordersCell() },
    { key: 'totalSpent', header: 'Chi tiêu', sortable: true, width: '14%', cell: this.spentCell() },
    {
      key: 'lastOrderAt',
      header: 'Đơn cuối',
      sortable: true,
      width: '12%',
      cell: this.lastOrderCell(),
    },
    { key: 'status', header: 'Trạng thái', width: '10%', cell: this.statusCell() },
  ]);

  protected readonly filtered = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const tier = this.tierFilter() as LoyaltyTier | '';
    const hasOrders = this.hasOrdersFilter();
    const from = this.dateFrom() ? new Date(this.dateFrom()).getTime() : null;
    const to = this.dateTo() ? new Date(this.dateTo()).getTime() + 86399999 : null;

    return this.customers.filter((c) => {
      if (tier && c.tier !== tier) return false;
      if (hasOrders === 'yes' && c.totalOrders === 0) return false;
      if (hasOrders === 'no' && c.totalOrders > 0) return false;

      if (from !== null || to !== null) {
        if (!c.lastOrderAt) return false;
        const t = new Date(c.lastOrderAt).getTime();
        if (from !== null && t < from) return false;
        if (to !== null && t > to) return false;
      }

      if (!term) return true;
      return (
        c.fullName.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        c.phone.includes(term) ||
        c.code.toLowerCase().includes(term)
      );
    });
  });

  protected readonly sorted = computed(() => {
    const sort = this.sortState();
    const list = this.filtered();
    if (!sort) return list;
    return [...list].sort((a, b) => {
      const av = a[sort.column as keyof ICustomer];
      const bv = b[sort.column as keyof ICustomer];
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

  protected tierLabel(tier: LoyaltyTier): string {
    return TIER_META[tier].label;
  }

  protected tierVariant(tier: LoyaltyTier): 'neutral' | 'info' | 'warning' | 'success' {
    return TIER_META[tier].badgeVariant;
  }

  protected formatPrice(n: number): string {
    return PRICE_FORMATTER.format(n);
  }
}
