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
import { PromotionStore } from './promotion.store';
import {
  PROMOTION_STATUS_META,
  PROMOTION_TYPE_META,
  type IPromotion,
  type PromotionStatus,
  type PromotionType,
} from './marketing.types';

const STATUS_OPTIONS: SelectOption<string>[] = [
  { value: '', label: 'Tất cả trạng thái' },
  ...(
    Object.entries(PROMOTION_STATUS_META) as [
      PromotionStatus,
      (typeof PROMOTION_STATUS_META)[PromotionStatus],
    ][]
  ).map(([value, meta]) => ({ value, label: meta.label })),
];

const TYPE_OPTIONS: SelectOption<string>[] = [
  { value: '', label: 'Tất cả loại' },
  ...(
    Object.entries(PROMOTION_TYPE_META) as [
      PromotionType,
      (typeof PROMOTION_TYPE_META)[PromotionType],
    ][]
  ).map(([value, meta]) => ({ value, label: meta.label })),
];

@Component({
  selector: 'app-promotions-list',
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
        title="Khuyến mãi"
        description="Rule tự động áp dụng cho đơn hàng. {{ promotions().length }} khuyến mãi."
        [breadcrumb]="breadcrumb"
      >
        <a routerLink="/marketing/promotions/new" page-actions>
          <app-button variant="primary">
            <app-icon [icon]="plusIcon" size="md" />
            Tạo khuyến mãi
          </app-button>
        </a>
      </app-page-header>

      <div class="grid gap-3 sm:grid-cols-3">
        <app-search-input
          id="promo-search"
          placeholder="Tìm mã, tên khuyến mãi..."
          [(ngModel)]="searchTerm"
        />
        <app-select
          id="promo-type"
          [options]="typeOptions"
          placeholder="Loại"
          [(ngModel)]="typeFilter"
        />
        <app-select
          id="promo-status"
          [options]="statusOptions"
          placeholder="Trạng thái"
          [(ngModel)]="statusFilter"
        />
      </div>

      <app-data-table
        tableId="promotions-table"
        [columns]="columns()"
        [rows]="paged()"
        trackByKey="id"
        [(sort)]="sortState"
        emptyTitle="Không có khuyến mãi nào"
        emptyDescription="Thay đổi bộ lọc hoặc tạo khuyến mãi mới."
      />

      <app-pagination [(page)]="page" [pageSize]="pageSize" [totalItems]="filtered().length" />
    </div>

    <ng-template #nameCell let-row="row">
      <a [routerLink]="['/marketing/promotions', row.id]" class="block hover:text-indigo-600">
        <p class="font-medium text-sm text-slate-900 truncate">{{ row.name }}</p>
        <p class="font-mono text-xs text-slate-500">{{ row.code }}</p>
      </a>
    </ng-template>

    <ng-template #typeCell let-row="row">
      <span class="text-sm text-slate-700">{{ typeLabel(row.rule.type) }}</span>
    </ng-template>

    <ng-template #statusCell let-row="row">
      <app-badge [variant]="statusVariant(row.status)" [dot]="true">
        {{ statusLabel(row.status) }}
      </app-badge>
    </ng-template>

    <ng-template #usageCell let-row="row">
      <span class="text-sm font-medium text-slate-900">{{ row.usageCount }}</span>
      <span class="text-xs text-slate-400"> lượt</span>
    </ng-template>

    <ng-template #rangeCell let-row="row">
      <p class="text-xs text-slate-700">{{ row.startAt | date: 'dd/MM/yyyy' }}</p>
      <p class="text-xs text-slate-500">→ {{ row.endAt | date: 'dd/MM/yyyy' }}</p>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromotionsListComponent {
  private readonly promotionStore = inject(PromotionStore);

  protected readonly promotions = this.promotionStore.promotions;
  protected readonly breadcrumb = [
    { label: 'Trang chủ', to: '/dashboard' },
    { label: 'Marketing' },
    { label: 'Khuyến mãi' },
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

  protected readonly nameCell = viewChild.required<TemplateRef<{ row: IPromotion }>>('nameCell');
  protected readonly typeCell = viewChild.required<TemplateRef<{ row: IPromotion }>>('typeCell');
  protected readonly statusCell =
    viewChild.required<TemplateRef<{ row: IPromotion }>>('statusCell');
  protected readonly usageCell = viewChild.required<TemplateRef<{ row: IPromotion }>>('usageCell');
  protected readonly rangeCell = viewChild.required<TemplateRef<{ row: IPromotion }>>('rangeCell');

  protected readonly columns = computed<ColumnDef<IPromotion>[]>(() => [
    { key: 'name', header: 'Tên khuyến mãi', sortable: true, width: '32%', cell: this.nameCell() },
    { key: 'type', header: 'Loại', width: '20%', cell: this.typeCell() },
    { key: 'status', header: 'Trạng thái', sortable: true, width: '14%', cell: this.statusCell() },
    {
      key: 'usageCount',
      header: 'Đã dùng',
      sortable: true,
      width: '12%',
      align: 'right',
      cell: this.usageCell(),
    },
    { key: 'startAt', header: 'Thời gian', sortable: true, width: '22%', cell: this.rangeCell() },
  ]);

  protected readonly filtered = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const type = this.typeFilter();
    const status = this.statusFilter();
    return this.promotions().filter((p) => {
      if (type && p.rule.type !== type) return false;
      if (status && p.status !== status) return false;
      if (!term) return true;
      return p.code.toLowerCase().includes(term) || p.name.toLowerCase().includes(term);
    });
  });

  protected readonly sorted = computed(() => {
    const sort = this.sortState();
    const list = this.filtered();
    if (!sort) return list;
    return [...list].sort((a, b) => {
      const av = a[sort.column as keyof IPromotion];
      const bv = b[sort.column as keyof IPromotion];
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

  protected typeLabel(t: PromotionType): string {
    return PROMOTION_TYPE_META[t].label;
  }

  protected statusLabel(s: PromotionStatus): string {
    return PROMOTION_STATUS_META[s].label;
  }

  protected statusVariant(s: PromotionStatus) {
    return PROMOTION_STATUS_META[s].badgeVariant;
  }
}
