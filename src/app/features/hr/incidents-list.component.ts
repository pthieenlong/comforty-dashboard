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
  type ColumnDef,
  DataTableComponent,
  PageHeaderComponent,
  PaginationComponent,
  SearchInputComponent,
  SelectComponent,
  type SelectOption,
  TabPanelDirective,
  TabsComponent,
} from '@/shared/ui';
import { IncidentStore } from './incident.store';
import {
  INCIDENT_SEVERITY_META,
  INCIDENT_STATUS_META,
  INCIDENT_TYPE_META,
  type IIncident,
  type IncidentSeverity,
  type IncidentStatus,
  type IncidentType,
} from './incident.types';

interface Row extends IIncident {
  assigneeLabel: string;
  tenantLabel: string;
}

const PAGE_SIZE = 15;

const TYPE_OPTIONS: SelectOption<IncidentType | 'all'>[] = [
  { value: 'all', label: 'Tất cả loại' },
  ...(Object.keys(INCIDENT_TYPE_META) as IncidentType[]).map((v) => ({
    value: v,
    label: INCIDENT_TYPE_META[v].label,
  })),
];

const SEVERITY_OPTIONS: SelectOption<IncidentSeverity | 'all'>[] = [
  { value: 'all', label: 'Tất cả mức độ' },
  ...(Object.keys(INCIDENT_SEVERITY_META) as IncidentSeverity[]).map((v) => ({
    value: v,
    label: INCIDENT_SEVERITY_META[v].label,
  })),
];

const STATUS_OPTIONS: SelectOption<IncidentStatus | 'all'>[] = [
  { value: 'all', label: 'Tất cả trạng thái' },
  ...(Object.keys(INCIDENT_STATUS_META) as IncidentStatus[]).map((v) => ({
    value: v,
    label: INCIDENT_STATUS_META[v].label,
  })),
];

@Component({
  selector: 'app-incidents-list',
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
        title="Sự cố vận hành"
        description="Theo dõi và xử lý các sự cố nội bộ tại cửa hàng."
        [breadcrumb]="breadcrumbs"
      >
        <app-button page-actions routerLink="/hr/incidents/new">Báo cáo sự cố</app-button>
      </app-page-header>

      <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <app-card padding="md">
          <p class="text-xs text-slate-500">Mới báo</p>
          <p class="text-2xl font-bold text-blue-700">{{ counts().reported }}</p>
        </app-card>
        <app-card padding="md">
          <p class="text-xs text-slate-500">Đang xử lý</p>
          <p class="text-2xl font-bold text-amber-700">
            {{ counts().acknowledged + counts().investigating }}
          </p>
        </app-card>
        <app-card padding="md">
          <p class="text-xs text-slate-500">Đã giải quyết</p>
          <p class="text-2xl font-bold text-emerald-700">{{ counts().resolved }}</p>
        </app-card>
        <app-card padding="md">
          <p class="text-xs text-slate-500">Critical đang mở</p>
          <p class="text-2xl font-bold text-red-700">{{ criticalOpen() }}</p>
        </app-card>
      </div>

      <app-tabs [(activeTab)]="activeTab">
        <ng-template appTabPanel="todo" [appTabPanelLabel]="todoLabel()">
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
          <div class="mb-3 grid gap-3 md:grid-cols-[1fr_180px_160px_160px]">
            <app-search-input
              id="inc-search"
              placeholder="Tìm theo mã hoặc tiêu đề..."
              [(ngModel)]="search"
            />
            <app-select id="inc-type" [options]="typeOptions" [(ngModel)]="typeFilter" />
            <app-select
              id="inc-severity"
              [options]="severityOptions"
              [(ngModel)]="severityFilter"
            />
            <app-select id="inc-status" [options]="statusOptions" [(ngModel)]="statusFilter" />
          </div>

          <app-data-table
            tableId="incidents"
            [columns]="columns()"
            [rows]="pageRows()"
            emptyTitle="Không có sự cố nào"
            emptyDescription="Thử thay đổi bộ lọc hoặc báo cáo sự cố mới."
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
        [routerLink]="['/hr/incidents', row.id]"
        class="text-sm font-semibold text-indigo-600 hover:underline"
      >
        {{ row.code }}
      </a>
    </ng-template>

    <ng-template #titleCell let-row="row">
      <div class="text-sm">
        <p class="font-medium text-slate-900 line-clamp-1">{{ row.title }}</p>
        <p class="text-xs text-slate-500">{{ row.location ?? row.tenantLabel }}</p>
      </div>
    </ng-template>

    <ng-template #typeCell let-row="row">
      <span
        class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium"
        [class]="typeBadge(row)"
      >
        {{ typeLabel(row) }}
      </span>
    </ng-template>

    <ng-template #severityCell let-row="row">
      <span class="inline-flex items-center gap-1.5 text-xs">
        <span class="h-2 w-2 rounded-full" [class]="severityDot(row)"></span>
        {{ severityLabel(row) }}
      </span>
    </ng-template>

    <ng-template #statusCell let-row="row">
      <span
        class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium"
        [class]="statusBadge(row)"
      >
        {{ statusLabel(row) }}
      </span>
    </ng-template>

    <ng-template #assigneeCell let-row="row">
      <span class="text-xs text-slate-700">
        {{ row.assigneeLabel || '—' }}
      </span>
    </ng-template>

    <ng-template #occurredCell let-row="row">
      <span class="text-xs text-slate-600">{{ row.occurredAt | date: 'dd/MM/yy HH:mm' }}</span>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncidentsListComponent {
  private readonly store = inject(IncidentStore);
  private readonly authStore = inject(AuthStore);
  private readonly tenantStore = inject(TenantStore);

  protected readonly breadcrumbs = [
    { label: 'Nhân sự', to: '/hr/attendance' },
    { label: 'Sự cố vận hành' },
  ];

  protected readonly typeOptions = TYPE_OPTIONS;
  protected readonly severityOptions = SEVERITY_OPTIONS;
  protected readonly statusOptions = STATUS_OPTIONS;
  protected readonly pageSize = PAGE_SIZE;

  protected readonly activeTab = signal<string>('todo');
  protected readonly search = signal<string>('');
  protected readonly typeFilter = signal<IncidentType | 'all'>('all');
  protected readonly severityFilter = signal<IncidentSeverity | 'all'>('all');
  protected readonly statusFilter = signal<IncidentStatus | 'all'>('all');
  protected readonly currentPage = signal<number>(1);

  protected readonly counts = this.store.countByStatus;

  protected readonly criticalOpen = computed(
    () =>
      this.store
        .items()
        .filter(
          (i) =>
            i.severity === 'critical' &&
            i.status !== 'resolved' &&
            i.status !== 'closed' &&
            i.status !== 'cancelled',
        ).length,
  );

  private readonly codeTpl = viewChild.required<TemplateRef<{ row: Row }>>('codeCell');
  private readonly titleTpl = viewChild.required<TemplateRef<{ row: Row }>>('titleCell');
  private readonly typeTpl = viewChild.required<TemplateRef<{ row: Row }>>('typeCell');
  private readonly severityTpl = viewChild.required<TemplateRef<{ row: Row }>>('severityCell');
  private readonly statusTpl = viewChild.required<TemplateRef<{ row: Row }>>('statusCell');
  private readonly assigneeTpl = viewChild.required<TemplateRef<{ row: Row }>>('assigneeCell');
  private readonly occurredTpl = viewChild.required<TemplateRef<{ row: Row }>>('occurredCell');

  protected readonly columns = computed<ColumnDef<Row>[]>(() => [
    { key: 'code', header: 'Mã', cell: this.codeTpl(), width: '130px' },
    { key: 'title', header: 'Tiêu đề', cell: this.titleTpl() },
    { key: 'type', header: 'Loại', cell: this.typeTpl(), width: '160px' },
    { key: 'severity', header: 'Mức độ', cell: this.severityTpl(), width: '120px' },
    { key: 'status', header: 'Trạng thái', cell: this.statusTpl(), width: '130px' },
    { key: 'assignee', header: 'Phụ trách', cell: this.assigneeTpl(), width: '140px' },
    { key: 'occurred', header: 'Xảy ra lúc', cell: this.occurredTpl(), width: '140px' },
  ]);

  protected readonly allRows = computed<Row[]>(() =>
    this.store.items().map((i) => {
      const tenant = this.tenantStore.tenants().find((t) => t.id === i.tenantId);
      const assignee = i.assigneeId ? USERS.find((u) => u.id === i.assigneeId) : null;
      return {
        ...i,
        tenantLabel: tenant?.name ?? i.tenantId,
        assigneeLabel: assignee?.fullName ?? '',
      };
    }),
  );

  protected readonly todoRows = computed(() => {
    const me = this.authStore.currentUser()?.id;
    return this.allRows().filter(
      (r) =>
        r.assigneeId === me &&
        r.status !== 'resolved' &&
        r.status !== 'closed' &&
        r.status !== 'cancelled',
    );
  });

  protected readonly mineRows = computed(() => {
    const me = this.authStore.currentUser()?.id;
    if (!me) return [];
    return this.allRows().filter((r) => r.reporterId === me);
  });

  protected readonly todoLabel = computed(() => `Cần xử lý (${this.todoRows().length})`);
  protected readonly mineLabel = computed(() => `Tôi báo cáo (${this.mineRows().length})`);

  protected readonly filtered = computed<Row[]>(() => {
    let base: Row[];
    switch (this.activeTab()) {
      case 'todo':
        base = this.todoRows();
        break;
      case 'mine':
        base = this.mineRows();
        break;
      default:
        base = this.allRows();
    }
    const q = this.search().trim().toLowerCase();
    const t = this.typeFilter();
    const sv = this.severityFilter();
    const st = this.statusFilter();
    return base.filter((r) => {
      if (q && !`${r.code} ${r.title}`.toLowerCase().includes(q)) return false;
      if (t !== 'all' && r.type !== t) return false;
      if (sv !== 'all' && r.severity !== sv) return false;
      if (st !== 'all' && r.status !== st) return false;
      return true;
    });
  });

  protected readonly pageRows = computed(() => {
    const start = (this.currentPage() - 1) * PAGE_SIZE;
    return this.filtered().slice(start, start + PAGE_SIZE);
  });

  protected typeBadge(row: Row): string {
    return INCIDENT_TYPE_META[row.type].badgeClass;
  }
  protected typeLabel(row: Row): string {
    return INCIDENT_TYPE_META[row.type].label;
  }
  protected severityDot(row: Row): string {
    return INCIDENT_SEVERITY_META[row.severity].dotClass;
  }
  protected severityLabel(row: Row): string {
    return INCIDENT_SEVERITY_META[row.severity].label;
  }
  protected statusBadge(row: Row): string {
    return INCIDENT_STATUS_META[row.status].badgeClass;
  }
  protected statusLabel(row: Row): string {
    return INCIDENT_STATUS_META[row.status].label;
  }
}
