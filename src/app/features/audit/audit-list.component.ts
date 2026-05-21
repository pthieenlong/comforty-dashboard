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
import { TenantStore } from '@/core/tenant/tenant.store';
import {
  ButtonComponent,
  CardComponent,
  type ColumnDef,
  DataTableComponent,
  type DateRange,
  DateRangePickerComponent,
  type DescriptionItem,
  DescriptionListComponent,
  DrawerService,
  PageHeaderComponent,
  PaginationComponent,
  SearchInputComponent,
  SelectComponent,
  type SelectOption,
} from '@/shared/ui';
import { AuditStore } from './audit.store';
import {
  ACTION_META,
  ENTITY_LABEL,
  type AuditAction,
  type AuditEntityType,
  type IAuditEntry,
} from './audit.types';

const PAGE_SIZE = 25;

const ACTION_FILTER_OPTIONS: SelectOption<AuditAction | 'all'>[] = [
  { value: 'all', label: 'Tất cả hành động' },
  ...(Object.keys(ACTION_META) as AuditAction[]).map((v) => ({
    value: v,
    label: ACTION_META[v].label,
  })),
];

const ENTITY_FILTER_OPTIONS: SelectOption<AuditEntityType | 'all'>[] = [
  { value: 'all', label: 'Tất cả entity' },
  ...(Object.keys(ENTITY_LABEL) as AuditEntityType[]).map((v) => ({
    value: v,
    label: ENTITY_LABEL[v],
  })),
];

@Component({
  selector: 'app-audit-list',
  imports: [
    ButtonComponent,
    CardComponent,
    DataTableComponent,
    DatePipe,
    DateRangePickerComponent,
    DescriptionListComponent,
    FormsModule,
    PageHeaderComponent,
    PaginationComponent,
    SearchInputComponent,
    SelectComponent,
  ],
  template: `
    <div class="space-y-4">
      <app-page-header
        title="Audit log"
        description="Theo dõi toàn bộ hành động quan trọng trên hệ thống."
        [breadcrumb]="breadcrumbs"
      >
        <div page-actions class="flex items-center gap-2">
          <span class="text-sm text-slate-500">Tổng {{ total() }} entry</span>
          <app-button variant="secondary" size="sm" (click)="reset()">Xoá lọc</app-button>
        </div>
      </app-page-header>

      <app-card padding="lg" class="block">
        <div class="mb-4 grid gap-3 md:grid-cols-[1fr_180px_180px_180px_240px]">
          <app-search-input
            id="aud-search"
            placeholder="Tìm theo mã, actor, entity, request ID..."
            [(ngModel)]="search"
          />
          <app-select id="aud-action" [options]="actionOptions" [(ngModel)]="actionFilter" />
          <app-select id="aud-entity" [options]="entityOptions" [(ngModel)]="entityFilter" />
          <app-select id="aud-tenant" [options]="tenantOptions()" [(ngModel)]="tenantFilter" />
          <app-date-range-picker
            id="aud-date"
            [ngModel]="dateRange()"
            (ngModelChange)="onRangeChange($event)"
          />
        </div>

        <app-data-table
          tableId="audit-log"
          [columns]="columns()"
          [rows]="pageRows()"
          emptyTitle="Không có audit entry nào"
          emptyDescription="Điều chỉnh bộ lọc để xem thêm."
        />

        <div class="mt-3 flex items-center justify-between">
          <span class="text-xs text-slate-500">
            Hiển thị {{ pageRows().length }} / {{ filtered().length }} entries
          </span>
          <app-pagination
            [(page)]="currentPage"
            [pageSize]="pageSize"
            [totalItems]="filtered().length"
          />
        </div>
      </app-card>
    </div>

    <ng-template #timeCell let-row="row">
      <span class="text-xs text-slate-700">{{ row.occurredAt | date: 'dd/MM/yy HH:mm:ss' }}</span>
    </ng-template>

    <ng-template #actorCell let-row="row">
      <div class="text-sm">
        <p class="font-medium text-slate-900">{{ row.actorLabel }}</p>
        <p class="text-xs text-slate-500">{{ row.ipAddress }}</p>
      </div>
    </ng-template>

    <ng-template #actionCell let-row="row">
      <span
        class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium"
        [class]="actionBadge(row)"
      >
        {{ actionLabel(row) }}
      </span>
    </ng-template>

    <ng-template #entityCell let-row="row">
      <div class="text-sm">
        <p class="text-slate-700">{{ entityLabel(row) }}</p>
        <p class="text-xs font-mono text-slate-500 truncate">{{ row.entityLabel }}</p>
      </div>
    </ng-template>

    <ng-template #tenantCell let-row="row">
      <span class="text-xs text-slate-600">{{ tenantName(row.tenantId) }}</span>
    </ng-template>

    <ng-template #codeCell let-row="row">
      <button
        type="button"
        class="font-mono text-xs text-indigo-600 hover:underline"
        (click)="openDetail(row)"
      >
        {{ row.code }}
      </button>
    </ng-template>

    <ng-template #actionsCell let-row="row">
      <div class="flex justify-end">
        <button
          type="button"
          class="text-xs text-indigo-600 hover:underline"
          (click)="openDetail(row)"
        >
          Xem →
        </button>
      </div>
    </ng-template>

    <!-- Detail Drawer template -->
    <ng-template #detailTpl>
      @if (selected(); as e) {
        <div class="space-y-4">
          <div>
            <p class="text-xs font-medium text-slate-500">Mã audit</p>
            <p class="font-mono text-sm text-slate-900">{{ e.code }}</p>
          </div>

          <app-description-list [items]="detailItems()" [columns]="1" />

          @if (e.changes.length > 0) {
            <div>
              <h4 class="mb-2 text-xs font-medium uppercase text-slate-500">Thay đổi</h4>
              <div class="space-y-2">
                @for (c of e.changes; track c.field) {
                  <div class="rounded-md border border-slate-200 p-3">
                    <p class="mb-1 text-xs font-medium text-slate-700">{{ c.field }}</p>
                    <div class="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p class="text-slate-400">Trước</p>
                        <p class="break-words font-mono text-rose-700">
                          {{ formatValue(c.before) }}
                        </p>
                      </div>
                      <div>
                        <p class="text-slate-400">Sau</p>
                        <p class="break-words font-mono text-emerald-700">
                          {{ formatValue(c.after) }}
                        </p>
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>
          }

          @if (metadataKeys().length > 0) {
            <div>
              <h4 class="mb-2 text-xs font-medium uppercase text-slate-500">Metadata</h4>
              <dl class="space-y-1 text-xs">
                @for (k of metadataKeys(); track k) {
                  <div class="flex gap-2">
                    <dt class="text-slate-500">{{ k }}:</dt>
                    <dd class="font-mono text-slate-700">{{ formatValue(e.metadata[k]) }}</dd>
                  </div>
                }
              </dl>
            </div>
          }
        </div>
      }
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuditListComponent {
  private readonly store = inject(AuditStore);
  private readonly tenantStore = inject(TenantStore);
  private readonly drawer = inject(DrawerService);

  protected readonly breadcrumbs = [{ label: 'Hệ thống' }, { label: 'Audit log' }];
  protected readonly pageSize = PAGE_SIZE;
  protected readonly actionOptions = ACTION_FILTER_OPTIONS;
  protected readonly entityOptions = ENTITY_FILTER_OPTIONS;

  protected readonly total = computed(() => this.store.total());

  protected readonly search = signal<string>('');
  protected readonly actionFilter = signal<AuditAction | 'all'>('all');
  protected readonly entityFilter = signal<AuditEntityType | 'all'>('all');
  protected readonly tenantFilter = signal<string | 'all'>('all');
  protected readonly dateRange = signal<DateRange>({ start: null, end: null });
  protected readonly currentPage = signal<number>(1);

  protected readonly selected = signal<IAuditEntry | null>(null);

  private readonly timeTpl = viewChild.required<TemplateRef<{ row: IAuditEntry }>>('timeCell');
  private readonly actorTpl = viewChild.required<TemplateRef<{ row: IAuditEntry }>>('actorCell');
  private readonly actionTpl = viewChild.required<TemplateRef<{ row: IAuditEntry }>>('actionCell');
  private readonly entityTpl = viewChild.required<TemplateRef<{ row: IAuditEntry }>>('entityCell');
  private readonly tenantTpl = viewChild.required<TemplateRef<{ row: IAuditEntry }>>('tenantCell');
  private readonly codeTpl = viewChild.required<TemplateRef<{ row: IAuditEntry }>>('codeCell');
  private readonly actionsTpl =
    viewChild.required<TemplateRef<{ row: IAuditEntry }>>('actionsCell');
  private readonly detailTpl = viewChild.required<TemplateRef<unknown>>('detailTpl');

  protected readonly tenantOptions = computed<SelectOption<string | 'all'>[]>(() => [
    { value: 'all', label: 'Tất cả chi nhánh' },
    ...this.tenantStore.tenants().map((t) => ({ value: t.id, label: t.name })),
  ]);

  protected readonly columns = computed<ColumnDef<IAuditEntry>[]>(() => [
    { key: 'code', header: 'Mã', cell: this.codeTpl(), width: '160px' },
    { key: 'occurredAt', header: 'Thời gian', cell: this.timeTpl(), width: '150px' },
    { key: 'actor', header: 'Actor', cell: this.actorTpl(), width: '180px' },
    { key: 'action', header: 'Hành động', cell: this.actionTpl(), width: '180px' },
    { key: 'entity', header: 'Đối tượng', cell: this.entityTpl() },
    { key: 'tenant', header: 'Chi nhánh', cell: this.tenantTpl(), width: '160px' },
    { key: 'view', header: '', cell: this.actionsTpl(), width: '80px', align: 'right' },
  ]);

  protected readonly filtered = computed<IAuditEntry[]>(() =>
    this.store.filterBy({
      search: this.search(),
      action: this.actionFilter(),
      entityType: this.entityFilter(),
      tenantId: this.tenantFilter(),
      dateFrom: this.dateRange().start,
      dateTo: this.dateRange().end,
    }),
  );

  protected readonly pageRows = computed<IAuditEntry[]>(() => {
    const start = (this.currentPage() - 1) * PAGE_SIZE;
    return this.filtered().slice(start, start + PAGE_SIZE);
  });

  protected readonly detailItems = computed<DescriptionItem[]>(() => {
    const e = this.selected();
    if (!e) return [];
    return [
      { label: 'Thời gian', value: new Date(e.occurredAt).toLocaleString('vi-VN') },
      { label: 'Hành động', value: ACTION_META[e.action].label },
      { label: 'Entity', value: `${ENTITY_LABEL[e.entityType]} · ${e.entityLabel}` },
      { label: 'Actor', value: `${e.actorLabel} (${e.actorRole})` },
      { label: 'Chi nhánh', value: this.tenantName(e.tenantId) },
      { label: 'IP', value: e.ipAddress },
      { label: 'Request ID', value: e.requestId },
      { label: 'User Agent', value: e.userAgent ?? '—' },
    ];
  });

  protected readonly metadataKeys = computed<string[]>(() => {
    const e = this.selected();
    if (!e) return [];
    return Object.keys(e.metadata);
  });

  protected actionBadge(row: IAuditEntry): string {
    return ACTION_META[row.action].badgeClass;
  }
  protected actionLabel(row: IAuditEntry): string {
    return ACTION_META[row.action].label;
  }
  protected entityLabel(row: IAuditEntry): string {
    return ENTITY_LABEL[row.entityType];
  }

  protected tenantName(tenantId: string | null): string {
    if (!tenantId) return 'Toàn hệ thống';
    return (
      this.tenantStore.tenants().find((t) => `tenant-${t.id.replace(/^t-/, '')}` === tenantId)
        ?.name ?? tenantId
    );
  }

  protected formatValue(v: unknown): string {
    if (v === null || v === undefined) return '—';
    if (typeof v === 'string') return v;
    if (typeof v === 'number' || typeof v === 'boolean') return String(v);
    return JSON.stringify(v);
  }

  protected onRangeChange(r: DateRange): void {
    this.dateRange.set(r);
    this.currentPage.set(1);
  }

  protected reset(): void {
    this.search.set('');
    this.actionFilter.set('all');
    this.entityFilter.set('all');
    this.tenantFilter.set('all');
    this.dateRange.set({ start: null, end: null });
    this.currentPage.set(1);
  }

  protected openDetail(row: IAuditEntry): void {
    this.selected.set(row);
    void this.drawer.open(this.detailTpl(), {
      title: row.code,
      description: ACTION_META[row.action].label,
      width: 'md',
    });
  }
}
