import { DatePipe, NgTemplateOutlet } from '@angular/common';
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
  TabPanelDirective,
  TabsComponent,
} from '@/shared/ui';
import { AuthStore } from '@/core/auth/auth.store';
import { MOCK_TENANTS } from '@/core/tenant/tenant.mock';
import { TicketStore } from './ticket.store';
import {
  TICKET_PRIORITY_META,
  TICKET_STATUS_META,
  TICKET_TYPE_META,
  type ITicket,
  type TicketPriority,
  type TicketStatus,
  type TicketType,
} from './ticket.types';

const TYPE_OPTIONS: SelectOption<string>[] = [
  { value: '', label: 'Tất cả loại' },
  ...(
    Object.entries(TICKET_TYPE_META) as [TicketType, (typeof TICKET_TYPE_META)[TicketType]][]
  ).map(([value, meta]) => ({ value, label: meta.label })),
];

const STATUS_OPTIONS: SelectOption<string>[] = [
  { value: '', label: 'Tất cả trạng thái' },
  ...(
    Object.entries(TICKET_STATUS_META) as [
      TicketStatus,
      (typeof TICKET_STATUS_META)[TicketStatus],
    ][]
  ).map(([value, meta]) => ({ value, label: meta.label })),
];

const PRIORITY_OPTIONS: SelectOption<string>[] = [
  { value: '', label: 'Tất cả ưu tiên' },
  ...(
    Object.entries(TICKET_PRIORITY_META) as [
      TicketPriority,
      (typeof TICKET_PRIORITY_META)[TicketPriority],
    ][]
  ).map(([value, meta]) => ({ value, label: meta.label })),
];

@Component({
  selector: 'app-tickets-list',
  imports: [
    BadgeComponent,
    ButtonComponent,
    CardComponent,
    DataTableComponent,
    DatePipe,
    FormsModule,
    NgTemplateOutlet,
    IconComponent,
    PageHeaderComponent,
    PaginationComponent,
    RouterLink,
    SearchInputComponent,
    SelectComponent,
    TabPanelDirective,
    TabsComponent,
  ],
  template: `
    <div class="space-y-6">
      <app-page-header
        title="Yêu cầu hỗ trợ"
        description="Quản lý yêu cầu của khách hàng (đổi/trả/khiếu nại/tư vấn). {{
          tickets().length
        }} ticket."
        [breadcrumb]="breadcrumb"
      >
        <a routerLink="/crm/tickets/new" page-actions>
          <app-button variant="primary">
            <app-icon [icon]="plusIcon" size="md" />
            Tạo ticket
          </app-button>
        </a>
      </app-page-header>

      <div class="grid gap-4 sm:grid-cols-4">
        @for (s of statusSummary(); track s.label) {
          <app-card padding="md">
            <p class="text-xs uppercase text-slate-500">{{ s.label }}</p>
            <p class="mt-1 text-2xl font-bold" [class]="s.colorClass">{{ s.count }}</p>
          </app-card>
        }
      </div>

      <app-tabs [(activeTab)]="activeTab">
        <ng-template appTabPanel="inbox" [appTabPanelLabel]="'Inbox (' + inboxCount() + ')'">
          <ng-container *ngTemplateOutlet="tableTpl" />
        </ng-template>
        <ng-template appTabPanel="mine" [appTabPanelLabel]="'Của tôi (' + mineCount() + ')'">
          <ng-container *ngTemplateOutlet="tableTpl" />
        </ng-template>
        <ng-template appTabPanel="all" [appTabPanelLabel]="'Tất cả (' + tickets().length + ')'">
          <ng-container *ngTemplateOutlet="tableTpl" />
        </ng-template>
      </app-tabs>
    </div>

    <ng-template #tableTpl>
      <div class="space-y-4">
        <div class="grid gap-3 sm:grid-cols-4">
          <app-search-input
            id="tk-search"
            placeholder="Tìm mã, chủ đề, khách hàng..."
            [(ngModel)]="searchTerm"
          />
          <app-select
            id="tk-type"
            [options]="typeOptions"
            placeholder="Loại"
            [(ngModel)]="typeFilter"
          />
          <app-select
            id="tk-status"
            [options]="statusOptions"
            placeholder="Trạng thái"
            [(ngModel)]="statusFilter"
          />
          <app-select
            id="tk-priority"
            [options]="priorityOptions"
            placeholder="Ưu tiên"
            [(ngModel)]="priorityFilter"
          />
        </div>

        <app-data-table
          tableId="tickets-table"
          [columns]="columns()"
          [rows]="paged()"
          trackByKey="id"
          [(sort)]="sortState"
          [emptyTitle]="emptyTitleForTab()"
          emptyDescription="Thay đổi bộ lọc hoặc kiểm tra tab khác."
        />

        <app-pagination [(page)]="page" [pageSize]="pageSize" [totalItems]="filtered().length" />
      </div>
    </ng-template>

    <ng-template #codeCell let-row="row">
      <a [routerLink]="['/crm/tickets', row.id]" class="block hover:text-indigo-600 min-w-0">
        <p class="font-mono text-xs font-medium text-slate-900">{{ row.code }}</p>
        <p class="text-sm text-slate-700 truncate">{{ row.subject }}</p>
      </a>
    </ng-template>

    <ng-template #typeCell let-row="row">
      <app-badge variant="neutral">{{ typeLabel(row.type) }}</app-badge>
    </ng-template>

    <ng-template #customerCell let-row="row">
      <a
        [routerLink]="['/customers', row.customerId]"
        class="text-sm text-slate-700 hover:text-indigo-600 truncate block"
      >
        {{ row.customerName }}
      </a>
      <p class="text-xs text-slate-500">{{ tenantName(row.tenantId) }}</p>
    </ng-template>

    <ng-template #assigneeCell let-row="row">
      @if (row.assigneeName) {
        <span class="text-sm text-slate-700">{{ row.assigneeName }}</span>
        @if (row.escalationLevel > 1) {
          <p class="text-xs text-amber-600">Cấp {{ row.escalationLevel }}</p>
        }
      } @else {
        <span class="text-xs text-slate-400 italic">Chưa giao</span>
      }
    </ng-template>

    <ng-template #priorityCell let-row="row">
      <app-badge [variant]="priorityVariant(row.priority)">
        {{ priorityLabel(row.priority) }}
      </app-badge>
    </ng-template>

    <ng-template #statusCell let-row="row">
      <app-badge [variant]="statusVariant(row.status)" [dot]="true">
        {{ statusLabel(row.status) }}
      </app-badge>
    </ng-template>

    <ng-template #dateCell let-row="row">
      <p class="text-xs text-slate-700">{{ row.updatedAt | date: 'dd/MM/yyyy HH:mm' }}</p>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketsListComponent {
  private readonly ticketStore = inject(TicketStore);
  private readonly authStore = inject(AuthStore);

  protected readonly tickets = this.ticketStore.tickets;
  protected readonly breadcrumb = [
    { label: 'Trang chủ', to: '/dashboard' },
    { label: 'CRM' },
    { label: 'Yêu cầu hỗ trợ' },
  ];

  protected readonly plusIcon = LucidePlus.icon;
  protected readonly typeOptions = TYPE_OPTIONS;
  protected readonly statusOptions = STATUS_OPTIONS;
  protected readonly priorityOptions = PRIORITY_OPTIONS;

  protected readonly activeTab = signal<string>('inbox');
  protected readonly searchTerm = signal('');
  protected readonly typeFilter = signal<string>('');
  protected readonly statusFilter = signal<string>('');
  protected readonly priorityFilter = signal<string>('');
  protected readonly sortState = signal<SortState | null>({
    column: 'updatedAt',
    direction: 'desc',
  });
  protected readonly page = signal(1);
  protected readonly pageSize = 10;

  protected readonly codeCell = viewChild.required<TemplateRef<{ row: ITicket }>>('codeCell');
  protected readonly typeCell = viewChild.required<TemplateRef<{ row: ITicket }>>('typeCell');
  protected readonly customerCell =
    viewChild.required<TemplateRef<{ row: ITicket }>>('customerCell');
  protected readonly assigneeCell =
    viewChild.required<TemplateRef<{ row: ITicket }>>('assigneeCell');
  protected readonly priorityCell =
    viewChild.required<TemplateRef<{ row: ITicket }>>('priorityCell');
  protected readonly statusCell = viewChild.required<TemplateRef<{ row: ITicket }>>('statusCell');
  protected readonly dateCell = viewChild.required<TemplateRef<{ row: ITicket }>>('dateCell');

  protected readonly columns = computed<ColumnDef<ITicket>[]>(() => [
    { key: 'code', header: 'Mã / Chủ đề', sortable: true, width: '24%', cell: this.codeCell() },
    { key: 'type', header: 'Loại', width: '12%', cell: this.typeCell() },
    {
      key: 'customerName',
      header: 'Khách hàng',
      sortable: true,
      width: '18%',
      cell: this.customerCell(),
    },
    {
      key: 'assigneeName',
      header: 'Phụ trách',
      sortable: true,
      width: '14%',
      cell: this.assigneeCell(),
    },
    { key: 'priority', header: 'Ưu tiên', sortable: true, width: '10%', cell: this.priorityCell() },
    { key: 'status', header: 'Trạng thái', sortable: true, width: '12%', cell: this.statusCell() },
    { key: 'updatedAt', header: 'Cập nhật', sortable: true, width: '14%', cell: this.dateCell() },
  ]);

  protected readonly statusSummary = computed(() => {
    const map = this.ticketStore.countByStatus();
    return [
      {
        label: 'Mới',
        count: map.get('open') ?? 0,
        colorClass: 'text-blue-600',
      },
      {
        label: 'Đang xử lý',
        count: (map.get('in_progress') ?? 0) + (map.get('pending_customer') ?? 0),
        colorClass: 'text-amber-600',
      },
      {
        label: 'Đã xử lý',
        count: (map.get('resolved') ?? 0) + (map.get('closed') ?? 0),
        colorClass: 'text-green-600',
      },
      {
        label: 'Đã huỷ',
        count: map.get('cancelled') ?? 0,
        colorClass: 'text-slate-600',
      },
    ];
  });

  protected readonly tabFiltered = computed<ITicket[]>(() => {
    const tab = this.activeTab();
    const userId = this.authStore.currentUser()?.id;
    if (tab === 'inbox') {
      // Inbox: open + in_progress (unassigned or active queue)
      return this.tickets().filter(
        (t) => t.status === 'open' || (t.status === 'in_progress' && t.assigneeId === null),
      );
    }
    if (tab === 'mine') {
      if (!userId) return [];
      return this.tickets().filter((t) => t.assigneeId === userId);
    }
    return this.tickets();
  });

  protected readonly inboxCount = computed(
    () =>
      this.tickets().filter(
        (t) => t.status === 'open' || (t.status === 'in_progress' && t.assigneeId === null),
      ).length,
  );

  protected readonly mineCount = computed(() => {
    const userId = this.authStore.currentUser()?.id;
    if (!userId) return 0;
    return this.tickets().filter((t) => t.assigneeId === userId).length;
  });

  protected readonly filtered = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const type = this.typeFilter();
    const status = this.statusFilter();
    const priority = this.priorityFilter();
    return this.tabFiltered().filter((t) => {
      if (type && t.type !== type) return false;
      if (status && t.status !== status) return false;
      if (priority && t.priority !== priority) return false;
      if (!term) return true;
      return (
        t.code.toLowerCase().includes(term) ||
        t.subject.toLowerCase().includes(term) ||
        t.customerName.toLowerCase().includes(term)
      );
    });
  });

  protected readonly sorted = computed(() => {
    const sort = this.sortState();
    const list = this.filtered();
    if (!sort) return list;
    return [...list].sort((a, b) => {
      const av = a[sort.column as keyof ITicket];
      const bv = b[sort.column as keyof ITicket];
      const cmp = String(av ?? '').localeCompare(String(bv ?? ''), 'vi');
      return sort.direction === 'asc' ? cmp : -cmp;
    });
  });

  protected readonly paged = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.sorted().slice(start, start + this.pageSize);
  });

  protected emptyTitleForTab(): string {
    const tab = this.activeTab();
    if (tab === 'inbox') return 'Không có yêu cầu mới';
    if (tab === 'mine') return 'Bạn chưa được giao ticket nào';
    return 'Không có ticket nào';
  }

  protected typeLabel(t: TicketType): string {
    return TICKET_TYPE_META[t].label;
  }

  protected statusLabel(s: TicketStatus): string {
    return TICKET_STATUS_META[s].label;
  }

  protected statusVariant(s: TicketStatus) {
    return TICKET_STATUS_META[s].badgeVariant;
  }

  protected priorityLabel(p: TicketPriority): string {
    return TICKET_PRIORITY_META[p].label;
  }

  protected priorityVariant(p: TicketPriority) {
    return TICKET_PRIORITY_META[p].badgeVariant;
  }

  protected tenantName(id: string): string {
    return MOCK_TENANTS.find((t) => t.id === id)?.name ?? id;
  }
}
