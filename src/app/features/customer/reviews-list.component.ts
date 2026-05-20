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
import { LucideStar } from '@lucide/angular';
import {
  BadgeComponent,
  CardComponent,
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
import { ReviewStore } from './review.store';
import { REVIEW_STATUS_META, type IReview, type ReviewStatus } from './review.types';

const STATUS_OPTIONS: SelectOption<string>[] = [
  { value: '', label: 'Tất cả trạng thái' },
  ...(
    Object.entries(REVIEW_STATUS_META) as [
      ReviewStatus,
      (typeof REVIEW_STATUS_META)[ReviewStatus],
    ][]
  ).map(([value, meta]) => ({ value, label: meta.label })),
];

const RATING_OPTIONS: SelectOption<string>[] = [
  { value: '', label: 'Tất cả sao' },
  { value: '5', label: '5 sao' },
  { value: '4', label: '4 sao' },
  { value: '3', label: '3 sao' },
  { value: '2', label: '2 sao' },
  { value: '1', label: '1 sao' },
];

@Component({
  selector: 'app-reviews-list',
  imports: [
    BadgeComponent,
    CardComponent,
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
        title="Đánh giá khách hàng"
        description="Moderation queue cho review sản phẩm. {{ reviews().length }} đánh giá."
        [breadcrumb]="breadcrumb"
      />

      <div class="grid gap-4 sm:grid-cols-4">
        @for (s of statusSummary(); track s.status) {
          <app-card padding="md">
            <p class="text-xs uppercase text-slate-500">{{ s.label }}</p>
            <p class="mt-1 text-2xl font-bold" [class]="s.colorClass">
              {{ s.count }}
            </p>
          </app-card>
        }
      </div>

      <div class="grid gap-3 sm:grid-cols-3">
        <app-search-input
          id="rv-search"
          placeholder="Tìm theo khách hàng, sản phẩm, nội dung..."
          [(ngModel)]="searchTerm"
        />
        <app-select
          id="rv-status"
          [options]="statusOptions"
          placeholder="Trạng thái"
          [(ngModel)]="statusFilter"
        />
        <app-select
          id="rv-rating"
          [options]="ratingOptions"
          placeholder="Số sao"
          [(ngModel)]="ratingFilter"
        />
      </div>

      <app-data-table
        tableId="reviews-table"
        [columns]="columns()"
        [rows]="paged()"
        trackByKey="id"
        [(sort)]="sortState"
        emptyTitle="Không có đánh giá nào"
        emptyDescription="Thay đổi bộ lọc để xem kết quả khác."
      />

      <app-pagination [(page)]="page" [pageSize]="pageSize" [totalItems]="filtered().length" />
    </div>

    <ng-template #ratingCell let-row="row">
      <div class="flex items-center gap-1">
        @for (i of [1, 2, 3, 4, 5]; track i) {
          <app-icon
            [icon]="starIcon"
            size="xs"
            [class]="i <= row.rating ? 'text-amber-500' : 'text-slate-200'"
          />
        }
      </div>
    </ng-template>

    <ng-template #reviewCell let-row="row">
      <a [routerLink]="['/crm/reviews', row.id]" class="block hover:text-indigo-600 min-w-0">
        <p class="font-medium text-sm text-slate-900 truncate">{{ row.title }}</p>
        <p class="text-xs text-slate-500 line-clamp-1">{{ row.content }}</p>
      </a>
      @if (row.verifiedPurchase) {
        <app-badge variant="success" class="mt-1">Đã mua</app-badge>
      }
    </ng-template>

    <ng-template #customerCell let-row="row">
      <a
        [routerLink]="['/customers', row.customerId]"
        class="text-sm text-slate-700 hover:text-indigo-600 truncate block"
      >
        {{ row.customerName }}
      </a>
    </ng-template>

    <ng-template #productCell let-row="row">
      <a
        [routerLink]="['/catalog/products', row.productId]"
        class="text-sm text-slate-700 hover:text-indigo-600 truncate block"
      >
        {{ row.productName }}
      </a>
      @if (row.variantSku) {
        <p class="font-mono text-xs text-slate-400">{{ row.variantSku }}</p>
      }
    </ng-template>

    <ng-template #statusCell let-row="row">
      <app-badge [variant]="statusVariant(row.status)" [dot]="true">
        {{ statusLabel(row.status) }}
      </app-badge>
      @if (row.reportedCount > 0) {
        <p class="mt-1 text-xs text-red-600">{{ row.reportedCount }} báo cáo</p>
      }
    </ng-template>

    <ng-template #dateCell let-row="row">
      <p class="text-xs text-slate-700">{{ row.submittedAt | date: 'dd/MM/yyyy HH:mm' }}</p>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewsListComponent {
  private readonly reviewStore = inject(ReviewStore);

  protected readonly reviews = this.reviewStore.reviews;
  protected readonly breadcrumb = [
    { label: 'Trang chủ', to: '/dashboard' },
    { label: 'CRM' },
    { label: 'Đánh giá' },
  ];

  protected readonly starIcon = LucideStar.icon;
  protected readonly statusOptions = STATUS_OPTIONS;
  protected readonly ratingOptions = RATING_OPTIONS;

  protected readonly searchTerm = signal('');
  protected readonly statusFilter = signal<string>('');
  protected readonly ratingFilter = signal<string>('');
  protected readonly sortState = signal<SortState | null>({
    column: 'submittedAt',
    direction: 'desc',
  });
  protected readonly page = signal(1);
  protected readonly pageSize = 10;

  protected readonly ratingCell = viewChild.required<TemplateRef<{ row: IReview }>>('ratingCell');
  protected readonly reviewCell = viewChild.required<TemplateRef<{ row: IReview }>>('reviewCell');
  protected readonly customerCell =
    viewChild.required<TemplateRef<{ row: IReview }>>('customerCell');
  protected readonly productCell = viewChild.required<TemplateRef<{ row: IReview }>>('productCell');
  protected readonly statusCell = viewChild.required<TemplateRef<{ row: IReview }>>('statusCell');
  protected readonly dateCell = viewChild.required<TemplateRef<{ row: IReview }>>('dateCell');

  protected readonly columns = computed<ColumnDef<IReview>[]>(() => [
    { key: 'rating', header: 'Sao', sortable: true, width: '8%', cell: this.ratingCell() },
    { key: 'title', header: 'Nội dung', sortable: true, width: '28%', cell: this.reviewCell() },
    {
      key: 'customerName',
      header: 'Khách hàng',
      sortable: true,
      width: '16%',
      cell: this.customerCell(),
    },
    {
      key: 'productName',
      header: 'Sản phẩm',
      sortable: true,
      width: '20%',
      cell: this.productCell(),
    },
    { key: 'status', header: 'Trạng thái', sortable: true, width: '12%', cell: this.statusCell() },
    { key: 'submittedAt', header: 'Gửi lúc', sortable: true, width: '16%', cell: this.dateCell() },
  ]);

  protected readonly statusSummary = computed(() => {
    const map = this.reviewStore.countByStatus();
    const all: {
      status: ReviewStatus;
      label: string;
      count: number;
      colorClass: string;
    }[] = [
      {
        status: 'pending',
        label: 'Chờ duyệt',
        count: map.get('pending') ?? 0,
        colorClass: 'text-amber-600',
      },
      {
        status: 'approved',
        label: 'Đã duyệt',
        count: map.get('approved') ?? 0,
        colorClass: 'text-green-600',
      },
      {
        status: 'rejected',
        label: 'Từ chối',
        count: map.get('rejected') ?? 0,
        colorClass: 'text-red-600',
      },
      {
        status: 'hidden',
        label: 'Đã ẩn',
        count: map.get('hidden') ?? 0,
        colorClass: 'text-slate-600',
      },
    ];
    return all;
  });

  protected readonly filtered = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const status = this.statusFilter();
    const rating = this.ratingFilter();
    return this.reviews().filter((r) => {
      if (status && r.status !== status) return false;
      if (rating && r.rating !== parseInt(rating, 10)) return false;
      if (!term) return true;
      return (
        r.title.toLowerCase().includes(term) ||
        r.content.toLowerCase().includes(term) ||
        r.customerName.toLowerCase().includes(term) ||
        r.productName.toLowerCase().includes(term)
      );
    });
  });

  protected readonly sorted = computed(() => {
    const sort = this.sortState();
    const list = this.filtered();
    if (!sort) return list;
    return [...list].sort((a, b) => {
      const av = a[sort.column as keyof IReview];
      const bv = b[sort.column as keyof IReview];
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

  protected statusLabel(s: ReviewStatus): string {
    return REVIEW_STATUS_META[s].label;
  }

  protected statusVariant(s: ReviewStatus) {
    return REVIEW_STATUS_META[s].badgeVariant;
  }
}
