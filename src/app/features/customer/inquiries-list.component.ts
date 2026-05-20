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
import {
  BadgeComponent,
  CardComponent,
  type ColumnDef,
  DataTableComponent,
  PageHeaderComponent,
  PaginationComponent,
  SearchInputComponent,
  SelectComponent,
  type SelectOption,
  type SortState,
} from '@/shared/ui';
import { InquiryStore } from './inquiry.store';
import {
  INQUIRY_SOURCE_META,
  INQUIRY_STATUS_META,
  type IInquiry,
  type InquirySource,
  type InquiryStatus,
} from './inquiry.types';

const STATUS_OPTIONS: SelectOption<string>[] = [
  { value: '', label: 'Tất cả trạng thái' },
  ...(
    Object.entries(INQUIRY_STATUS_META) as [
      InquiryStatus,
      (typeof INQUIRY_STATUS_META)[InquiryStatus],
    ][]
  ).map(([value, meta]) => ({ value, label: meta.label })),
];

const SOURCE_OPTIONS: SelectOption<string>[] = [
  { value: '', label: 'Tất cả nguồn' },
  ...(
    Object.entries(INQUIRY_SOURCE_META) as [
      InquirySource,
      (typeof INQUIRY_SOURCE_META)[InquirySource],
    ][]
  ).map(([value, meta]) => ({ value, label: meta.label })),
];

@Component({
  selector: 'app-inquiries-list',
  imports: [
    BadgeComponent,
    CardComponent,
    DataTableComponent,
    DatePipe,
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
        title="Liên hệ"
        description="Yêu cầu liên hệ qua contact form. {{ inquiries().length }} yêu cầu."
        [breadcrumb]="breadcrumb"
      />

      <div class="grid gap-4 sm:grid-cols-3">
        @for (s of statusSummary(); track s.label) {
          <app-card padding="md">
            <p class="text-xs uppercase text-slate-500">{{ s.label }}</p>
            <p class="mt-1 text-2xl font-bold" [class]="s.colorClass">{{ s.count }}</p>
          </app-card>
        }
      </div>

      <div class="grid gap-3 sm:grid-cols-3">
        <app-search-input
          id="iq-search"
          placeholder="Tìm theo chủ đề, email, tên người gửi..."
          [(ngModel)]="searchTerm"
        />
        <app-select
          id="iq-status"
          [options]="statusOptions"
          placeholder="Trạng thái"
          [(ngModel)]="statusFilter"
        />
        <app-select
          id="iq-source"
          [options]="sourceOptions"
          placeholder="Nguồn"
          [(ngModel)]="sourceFilter"
        />
      </div>

      <app-data-table
        tableId="inquiries-table"
        [columns]="columns()"
        [rows]="paged()"
        trackByKey="id"
        [(sort)]="sortState"
        emptyTitle="Không có yêu cầu nào"
        emptyDescription="Thay đổi bộ lọc để xem kết quả khác."
      />

      <app-pagination [(page)]="page" [pageSize]="pageSize" [totalItems]="filtered().length" />
    </div>

    <ng-template #subjectCell let-row="row">
      <a [routerLink]="['/crm/inquiries', row.id]" class="block hover:text-indigo-600 min-w-0">
        <p class="font-mono text-xs font-medium text-slate-900">{{ row.code }}</p>
        <p class="text-sm text-slate-700 truncate">{{ row.subject }}</p>
      </a>
    </ng-template>

    <ng-template #senderCell let-row="row">
      <p class="text-sm text-slate-700 truncate">{{ row.senderName }}</p>
      <p class="text-xs text-slate-500 truncate">{{ row.senderEmail }}</p>
      @if (row.matchedCustomerId) {
        <app-badge variant="info" class="mt-1">Đã đăng ký</app-badge>
      }
    </ng-template>

    <ng-template #sourceCell let-row="row">
      <app-badge variant="neutral">{{ sourceLabel(row.source) }}</app-badge>
    </ng-template>

    <ng-template #assigneeCell let-row="row">
      @if (row.assigneeName) {
        <span class="text-sm text-slate-700">{{ row.assigneeName }}</span>
      } @else {
        <span class="text-xs text-slate-400 italic">Chưa giao</span>
      }
    </ng-template>

    <ng-template #statusCell let-row="row">
      <app-badge [variant]="statusVariant(row.status)" [dot]="true">
        {{ statusLabel(row.status) }}
      </app-badge>
    </ng-template>

    <ng-template #dateCell let-row="row">
      <p class="text-xs text-slate-700">{{ row.createdAt | date: 'dd/MM/yyyy HH:mm' }}</p>
      @if (row.repliedAt) {
        <p class="text-xs text-green-600">Đã rep {{ row.repliedAt | date: 'dd/MM HH:mm' }}</p>
      }
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InquiriesListComponent {
  private readonly inquiryStore = inject(InquiryStore);

  protected readonly inquiries = this.inquiryStore.inquiries;
  protected readonly breadcrumb = [
    { label: 'Trang chủ', to: '/dashboard' },
    { label: 'CRM' },
    { label: 'Liên hệ' },
  ];

  protected readonly statusOptions = STATUS_OPTIONS;
  protected readonly sourceOptions = SOURCE_OPTIONS;

  protected readonly searchTerm = signal('');
  protected readonly statusFilter = signal<string>('');
  protected readonly sourceFilter = signal<string>('');
  protected readonly sortState = signal<SortState | null>({
    column: 'createdAt',
    direction: 'desc',
  });
  protected readonly page = signal(1);
  protected readonly pageSize = 10;

  protected readonly subjectCell =
    viewChild.required<TemplateRef<{ row: IInquiry }>>('subjectCell');
  protected readonly senderCell = viewChild.required<TemplateRef<{ row: IInquiry }>>('senderCell');
  protected readonly sourceCell = viewChild.required<TemplateRef<{ row: IInquiry }>>('sourceCell');
  protected readonly assigneeCell =
    viewChild.required<TemplateRef<{ row: IInquiry }>>('assigneeCell');
  protected readonly statusCell = viewChild.required<TemplateRef<{ row: IInquiry }>>('statusCell');
  protected readonly dateCell = viewChild.required<TemplateRef<{ row: IInquiry }>>('dateCell');

  protected readonly columns = computed<ColumnDef<IInquiry>[]>(() => [
    { key: 'subject', header: 'Chủ đề', sortable: true, width: '28%', cell: this.subjectCell() },
    {
      key: 'senderName',
      header: 'Người gửi',
      sortable: true,
      width: '22%',
      cell: this.senderCell(),
    },
    { key: 'source', header: 'Nguồn', width: '12%', cell: this.sourceCell() },
    {
      key: 'assigneeName',
      header: 'Phụ trách',
      sortable: true,
      width: '14%',
      cell: this.assigneeCell(),
    },
    { key: 'status', header: 'Trạng thái', sortable: true, width: '12%', cell: this.statusCell() },
    { key: 'createdAt', header: 'Gửi lúc', sortable: true, width: '12%', cell: this.dateCell() },
  ]);

  protected readonly statusSummary = computed(() => {
    const map = this.inquiryStore.countByStatus();
    return [
      { label: 'Mới', count: map.get('new') ?? 0, colorClass: 'text-blue-600' },
      { label: 'Đã trả lời', count: map.get('replied') ?? 0, colorClass: 'text-green-600' },
      { label: 'Đã lưu trữ', count: map.get('archived') ?? 0, colorClass: 'text-slate-600' },
    ];
  });

  protected readonly filtered = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const status = this.statusFilter();
    const source = this.sourceFilter();
    return this.inquiries().filter((i) => {
      if (status && i.status !== status) return false;
      if (source && i.source !== source) return false;
      if (!term) return true;
      return (
        i.subject.toLowerCase().includes(term) ||
        i.senderName.toLowerCase().includes(term) ||
        i.senderEmail.toLowerCase().includes(term) ||
        i.message.toLowerCase().includes(term)
      );
    });
  });

  protected readonly sorted = computed(() => {
    const sort = this.sortState();
    const list = this.filtered();
    if (!sort) return list;
    return [...list].sort((a, b) => {
      const av = a[sort.column as keyof IInquiry];
      const bv = b[sort.column as keyof IInquiry];
      const cmp = String(av ?? '').localeCompare(String(bv ?? ''), 'vi');
      return sort.direction === 'asc' ? cmp : -cmp;
    });
  });

  protected readonly paged = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.sorted().slice(start, start + this.pageSize);
  });

  protected statusLabel(s: InquiryStatus): string {
    return INQUIRY_STATUS_META[s].label;
  }

  protected statusVariant(s: InquiryStatus) {
    return INQUIRY_STATUS_META[s].badgeVariant;
  }

  protected sourceLabel(s: InquirySource): string {
    return INQUIRY_SOURCE_META[s].label;
  }
}
