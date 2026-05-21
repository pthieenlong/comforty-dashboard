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
import { AuthStore } from '@/core/auth/auth.store';
import { TenantStore } from '@/core/tenant/tenant.store';
import { USERS } from '@/features/iam/iam.mock';
import {
  ButtonComponent,
  CardComponent,
  ConfirmDialogService,
  DataTableComponent,
  type ColumnDef,
  PageHeaderComponent,
  PaginationComponent,
  SearchInputComponent,
  SelectComponent,
  type SelectOption,
  TabPanelDirective,
  TabsComponent,
  ToastService,
} from '@/shared/ui';
import { LeaveRequestStore } from './leave-request.store';
import {
  LEAVE_STATUS_META,
  LEAVE_TYPE_META,
  type ILeaveRequest,
  type LeaveStatus,
  type LeaveType,
} from './hr.types';

interface Row extends ILeaveRequest {
  userLabel: string;
  tenantLabel: string;
  durationDays: number;
}

const PAGE_SIZE = 15;

const TYPE_FILTER_OPTIONS: SelectOption<LeaveType | 'all'>[] = [
  { value: 'all', label: 'Tất cả loại' },
  ...(Object.keys(LEAVE_TYPE_META) as LeaveType[]).map((v) => ({
    value: v,
    label: LEAVE_TYPE_META[v].label,
  })),
];

const STATUS_FILTER_OPTIONS: SelectOption<LeaveStatus | 'all'>[] = [
  { value: 'all', label: 'Tất cả trạng thái' },
  ...(Object.keys(LEAVE_STATUS_META) as LeaveStatus[]).map((v) => ({
    value: v,
    label: LEAVE_STATUS_META[v].label,
  })),
];

@Component({
  selector: 'app-leave-requests-list',
  imports: [
    ButtonComponent,
    CardComponent,
    DataTableComponent,
    DatePipe,
    FormsModule,
    NgTemplateOutlet,
    PageHeaderComponent,
    PaginationComponent,
    RouterLink,
    SearchInputComponent,
    SelectComponent,
    TabPanelDirective,
    TabsComponent,
  ],
  template: `
    <div class="space-y-4">
      <app-page-header
        title="Đơn nghỉ phép"
        description="Theo dõi và xử lý đơn xin nghỉ phép của nhân viên."
        [breadcrumb]="breadcrumbs"
      >
        <app-button page-actions routerLink="/hr/leave-requests/new">Tạo đơn mới</app-button>
      </app-page-header>

      <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <app-card padding="md">
          <p class="text-xs text-slate-500">Chờ duyệt</p>
          <p class="text-2xl font-bold text-amber-700">{{ counts().pending }}</p>
        </app-card>
        <app-card padding="md">
          <p class="text-xs text-slate-500">Đã duyệt</p>
          <p class="text-2xl font-bold text-emerald-700">{{ counts().approved }}</p>
        </app-card>
        <app-card padding="md">
          <p class="text-xs text-slate-500">Từ chối</p>
          <p class="text-2xl font-bold text-red-700">{{ counts().rejected }}</p>
        </app-card>
        <app-card padding="md">
          <p class="text-xs text-slate-500">Đã huỷ</p>
          <p class="text-2xl font-bold text-slate-600">{{ counts().cancelled }}</p>
        </app-card>
      </div>

      <app-tabs [(activeTab)]="activeTab">
        <ng-template appTabPanel="inbox" [appTabPanelLabel]="inboxLabel()">
          <ng-container *ngTemplateOutlet="tableBlock" />
        </ng-template>
        <ng-template appTabPanel="mine" [appTabPanelLabel]="mineLabel()">
          <ng-container *ngTemplateOutlet="tableBlock" />
        </ng-template>
        <ng-template appTabPanel="all" appTabPanelLabel="Tất cả">
          <ng-container *ngTemplateOutlet="tableBlock" />
        </ng-template>
      </app-tabs>

      <ng-template #tableBlock>
        <app-card padding="lg" class="block">
          <div class="mb-3 grid gap-3 md:grid-cols-[1fr_180px_180px]">
            <app-search-input
              id="lr-search"
              placeholder="Tìm theo mã đơn hoặc tên nhân viên..."
              [(ngModel)]="search"
            />
            <app-select id="lr-type" [options]="typeOptions" [(ngModel)]="typeFilter" />
            <app-select id="lr-status" [options]="statusOptions" [(ngModel)]="statusFilter" />
          </div>

          <app-data-table
            tableId="leave-requests"
            [columns]="columns()"
            [rows]="pageRows()"
            emptyTitle="Không có đơn nào"
            emptyDescription="Thử thay đổi bộ lọc hoặc tạo đơn mới."
          />

          <div class="mt-3 flex justify-end">
            <app-pagination
              [(page)]="currentPage"
              [pageSize]="pageSize"
              [totalItems]="filtered().length"
            />
          </div>
        </app-card>
      </ng-template>
    </div>

    <ng-template #codeCell let-row="row">
      <a
        [routerLink]="['/hr/leave-requests', row.id]"
        class="text-sm font-semibold text-indigo-600 hover:underline"
      >
        {{ row.code }}
      </a>
    </ng-template>

    <ng-template #userCell let-row="row">
      <div class="text-sm">
        <p class="font-medium text-slate-900">{{ row.userLabel }}</p>
        <p class="text-xs text-slate-500">{{ row.tenantLabel }}</p>
      </div>
    </ng-template>

    <ng-template #typeCell let-row="row">
      <span
        class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium"
        [class]="typeBadgeClass(row)"
      >
        {{ typeLabel(row) }}
      </span>
    </ng-template>

    <ng-template #periodCell let-row="row">
      <div class="text-xs">
        <p class="text-slate-700">
          {{ row.fromDate | date: 'dd/MM/yy' }} → {{ row.toDate | date: 'dd/MM/yy' }}
        </p>
        <p class="text-slate-500">
          {{ row.durationDays }} ngày
          @if (row.halfDay) {
            <span>· {{ row.halfDay === 'morning' ? 'Sáng' : 'Chiều' }}</span>
          }
        </p>
      </div>
    </ng-template>

    <ng-template #statusCell let-row="row">
      <span
        class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium"
        [class]="statusBadgeClass(row)"
      >
        {{ statusLabel(row) }}
      </span>
    </ng-template>

    <ng-template #requestedCell let-row="row">
      <span class="text-xs text-slate-600">{{ row.requestedAt | date: 'dd/MM/yy HH:mm' }}</span>
    </ng-template>

    <ng-template #actionCell let-row="row">
      <div class="flex justify-end gap-1">
        @if (row.status === 'pending') {
          <app-button size="sm" (click)="approve(row, $event)">Duyệt</app-button>
          <app-button size="sm" variant="secondary" (click)="reject(row, $event)">
            Từ chối
          </app-button>
        } @else {
          <a
            [routerLink]="['/hr/leave-requests', row.id]"
            class="text-xs text-indigo-600 hover:underline"
          >
            Chi tiết →
          </a>
        }
      </div>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeaveRequestsListComponent {
  private readonly store = inject(LeaveRequestStore);
  private readonly authStore = inject(AuthStore);
  private readonly tenantStore = inject(TenantStore);
  private readonly toast = inject(ToastService);
  private readonly confirmSvc = inject(ConfirmDialogService);

  protected readonly breadcrumbs = [
    { label: 'Nhân sự', to: '/hr/attendance' },
    { label: 'Đơn nghỉ phép' },
  ];

  protected readonly typeMeta = LEAVE_TYPE_META;
  protected readonly statusMeta = LEAVE_STATUS_META;
  protected readonly typeOptions = TYPE_FILTER_OPTIONS;
  protected readonly statusOptions = STATUS_FILTER_OPTIONS;
  protected readonly pageSize = PAGE_SIZE;

  protected readonly activeTab = signal<string>('inbox');
  protected readonly search = signal<string>('');
  protected readonly typeFilter = signal<LeaveType | 'all'>('all');
  protected readonly statusFilter = signal<LeaveStatus | 'all'>('all');
  protected readonly currentPage = signal<number>(1);

  protected readonly counts = this.store.countByStatus;

  private readonly codeTpl = viewChild.required<TemplateRef<{ row: Row }>>('codeCell');
  private readonly userTpl = viewChild.required<TemplateRef<{ row: Row }>>('userCell');
  private readonly typeTpl = viewChild.required<TemplateRef<{ row: Row }>>('typeCell');
  private readonly periodTpl = viewChild.required<TemplateRef<{ row: Row }>>('periodCell');
  private readonly statusTpl = viewChild.required<TemplateRef<{ row: Row }>>('statusCell');
  private readonly requestedTpl = viewChild.required<TemplateRef<{ row: Row }>>('requestedCell');
  private readonly actionTpl = viewChild.required<TemplateRef<{ row: Row }>>('actionCell');

  protected readonly columns = computed<ColumnDef<Row>[]>(() => [
    { key: 'code', header: 'Mã đơn', cell: this.codeTpl(), width: '110px' },
    { key: 'user', header: 'Nhân viên', cell: this.userTpl() },
    { key: 'type', header: 'Loại', cell: this.typeTpl(), width: '140px' },
    { key: 'period', header: 'Thời gian', cell: this.periodTpl(), width: '180px' },
    { key: 'requested', header: 'Tạo lúc', cell: this.requestedTpl(), width: '140px' },
    { key: 'status', header: 'Trạng thái', cell: this.statusTpl(), width: '120px' },
    { key: 'action', header: '', cell: this.actionTpl(), width: '170px', align: 'right' },
  ]);

  protected readonly allRows = computed<Row[]>(() =>
    this.store.items().map((r) => {
      const user = USERS.find((u) => u.id === r.userId);
      const tenant = this.tenantStore.tenants().find((t) => t.id === r.tenantId);
      const from = new Date(r.fromDate);
      const to = new Date(r.toDate);
      const durationDays = Math.max(1, Math.round((to.getTime() - from.getTime()) / 86400000) + 1);
      return {
        ...r,
        userLabel: user?.fullName ?? 'Không rõ',
        tenantLabel: tenant?.name ?? r.tenantId,
        durationDays: r.halfDay ? 0.5 : durationDays,
      };
    }),
  );

  protected readonly inboxRows = computed(() => {
    const tenantId = this.tenantStore.currentTenant()?.id;
    if (!tenantId) return this.allRows();
    return this.allRows().filter((r) => r.tenantId === tenantId && r.status === 'pending');
  });

  protected readonly mineRows = computed(() => {
    const me = this.authStore.currentUser()?.id;
    if (!me) return [];
    return this.allRows().filter((r) => r.userId === me);
  });

  protected readonly inboxLabel = computed(() => `Cần duyệt (${this.inboxRows().length})`);
  protected readonly mineLabel = computed(() => `Của tôi (${this.mineRows().length})`);

  protected readonly filtered = computed<Row[]>(() => {
    let base: Row[];
    switch (this.activeTab()) {
      case 'inbox':
        base = this.inboxRows();
        break;
      case 'mine':
        base = this.mineRows();
        break;
      default:
        base = this.allRows();
    }
    const q = this.search().trim().toLowerCase();
    const t = this.typeFilter();
    const s = this.statusFilter();
    return base.filter((r) => {
      if (q && !`${r.code} ${r.userLabel}`.toLowerCase().includes(q)) return false;
      if (t !== 'all' && r.type !== t) return false;
      if (s !== 'all' && r.status !== s) return false;
      return true;
    });
  });

  protected readonly pageRows = computed(() => {
    const start = (this.currentPage() - 1) * PAGE_SIZE;
    return this.filtered().slice(start, start + PAGE_SIZE);
  });

  protected async approve(row: Row, event: MouseEvent): Promise<void> {
    event.stopPropagation();
    const editor = this.authStore.currentUser()?.fullName ?? 'system';
    const editorId = this.authStore.currentUser()?.id ?? 'system';
    const updated = await this.store.decide(row.id, true, editorId, null);
    if (updated) this.toast.success(`Đã duyệt đơn ${row.code}`, `Bởi ${editor}`);
  }

  protected typeBadgeClass(row: Row): string {
    return LEAVE_TYPE_META[row.type].badgeClass;
  }

  protected typeLabel(row: Row): string {
    return LEAVE_TYPE_META[row.type].label;
  }

  protected statusBadgeClass(row: Row): string {
    return LEAVE_STATUS_META[row.status].badgeClass;
  }

  protected statusLabel(row: Row): string {
    return LEAVE_STATUS_META[row.status].label;
  }

  protected async reject(row: Row, event: MouseEvent): Promise<void> {
    event.stopPropagation();
    const ok = await this.confirmSvc.confirm({
      title: 'Từ chối đơn nghỉ phép',
      message: `Bạn có chắc muốn từ chối đơn ${row.code}?`,
      confirmText: 'Từ chối',
      cancelText: 'Huỷ',
      variant: 'danger',
    });
    if (!ok) return;
    const editorId = this.authStore.currentUser()?.id ?? 'system';
    const updated = await this.store.decide(row.id, false, editorId, 'Từ chối nhanh từ list');
    if (updated) this.toast.warning(`Đã từ chối đơn ${row.code}`);
  }
}
