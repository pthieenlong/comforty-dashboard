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
import { CampaignStore } from './campaign.store';
import {
  CAMPAIGN_CHANNEL_META,
  CAMPAIGN_STATUS_META,
  type CampaignChannel,
  type CampaignStatus,
  type ICampaign,
} from './marketing.types';

const STATUS_OPTIONS: SelectOption<string>[] = [
  { value: '', label: 'Tất cả trạng thái' },
  ...(
    Object.entries(CAMPAIGN_STATUS_META) as [
      CampaignStatus,
      (typeof CAMPAIGN_STATUS_META)[CampaignStatus],
    ][]
  ).map(([value, meta]) => ({ value, label: meta.label })),
];

const CHANNEL_OPTIONS: SelectOption<string>[] = [
  { value: '', label: 'Tất cả kênh' },
  ...(
    Object.entries(CAMPAIGN_CHANNEL_META) as [
      CampaignChannel,
      (typeof CAMPAIGN_CHANNEL_META)[CampaignChannel],
    ][]
  ).map(([value, meta]) => ({ value, label: meta.label })),
];

@Component({
  selector: 'app-campaigns-list',
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
        title="Chiến dịch Marketing"
        description="Quản lý chiến dịch banner / khuyến mãi. {{ campaigns().length }} chiến dịch."
        [breadcrumb]="breadcrumb"
      >
        <a routerLink="/marketing/campaigns/new" page-actions>
          <app-button variant="primary">
            <app-icon [icon]="plusIcon" size="md" />
            Tạo chiến dịch
          </app-button>
        </a>
      </app-page-header>

      <div class="grid gap-3 sm:grid-cols-3">
        <app-search-input
          id="camp-search"
          placeholder="Tìm mã, tên chiến dịch..."
          [(ngModel)]="searchTerm"
        />
        <app-select
          id="camp-status"
          [options]="statusOptions"
          placeholder="Trạng thái"
          [(ngModel)]="statusFilter"
        />
        <app-select
          id="camp-channel"
          [options]="channelOptions"
          placeholder="Kênh"
          [(ngModel)]="channelFilter"
        />
      </div>

      <app-data-table
        tableId="campaigns-table"
        [columns]="columns()"
        [rows]="paged()"
        trackByKey="id"
        [(sort)]="sortState"
        emptyTitle="Không có chiến dịch nào"
        emptyDescription="Thay đổi bộ lọc hoặc tạo chiến dịch mới."
      />

      <app-pagination [(page)]="page" [pageSize]="pageSize" [totalItems]="filtered().length" />
    </div>

    <ng-template #nameCell let-row="row">
      <a
        [routerLink]="['/marketing/campaigns', row.id]"
        class="flex items-center gap-2 hover:text-indigo-600"
      >
        @if (row.bannerUrl) {
          <img
            [src]="row.bannerUrl"
            [alt]="row.name"
            class="h-10 w-16 rounded object-cover bg-slate-100"
          />
        } @else {
          <div class="h-10 w-16 rounded bg-slate-100 flex items-center justify-center">
            <span class="text-xs text-slate-400">—</span>
          </div>
        }
        <div class="min-w-0">
          <p class="font-medium text-sm text-slate-900 truncate">{{ row.name }}</p>
          <p class="font-mono text-xs text-slate-500">{{ row.code }}</p>
        </div>
      </a>
    </ng-template>

    <ng-template #channelsCell let-row="row">
      <div class="flex flex-wrap gap-1">
        @for (ch of row.channels; track ch) {
          <app-badge variant="neutral">{{ channelLabel(ch) }}</app-badge>
        }
      </div>
    </ng-template>

    <ng-template #statusCell let-row="row">
      <app-badge [variant]="statusVariant(row.status)" [dot]="true">
        {{ statusLabel(row.status) }}
      </app-badge>
    </ng-template>

    <ng-template #rangeCell let-row="row">
      <p class="text-xs text-slate-700">{{ row.startAt | date: 'dd/MM/yyyy' }}</p>
      <p class="text-xs text-slate-500">→ {{ row.endAt | date: 'dd/MM/yyyy' }}</p>
    </ng-template>

    <ng-template #scopeCell let-row="row">
      <span class="text-sm text-slate-700">
        {{ row.tenantIds.length === 0 ? 'Toàn hệ thống' : row.tenantIds.length + ' chi nhánh' }}
      </span>
      <p class="text-xs text-slate-400">
        {{ row.promotionIds.length }} promo · {{ row.voucherBatchIds.length }} voucher
      </p>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampaignsListComponent {
  private readonly campaignStore = inject(CampaignStore);

  protected readonly campaigns = this.campaignStore.campaigns;
  protected readonly breadcrumb = [
    { label: 'Trang chủ', to: '/dashboard' },
    { label: 'Marketing' },
    { label: 'Chiến dịch' },
  ];

  protected readonly plusIcon = LucidePlus.icon;
  protected readonly statusOptions = STATUS_OPTIONS;
  protected readonly channelOptions = CHANNEL_OPTIONS;

  protected readonly searchTerm = signal('');
  protected readonly statusFilter = signal<string>('');
  protected readonly channelFilter = signal<string>('');
  protected readonly sortState = signal<SortState | null>({
    column: 'startAt',
    direction: 'desc',
  });
  protected readonly page = signal(1);
  protected readonly pageSize = 10;

  protected readonly nameCell = viewChild.required<TemplateRef<{ row: ICampaign }>>('nameCell');
  protected readonly channelsCell =
    viewChild.required<TemplateRef<{ row: ICampaign }>>('channelsCell');
  protected readonly statusCell = viewChild.required<TemplateRef<{ row: ICampaign }>>('statusCell');
  protected readonly rangeCell = viewChild.required<TemplateRef<{ row: ICampaign }>>('rangeCell');
  protected readonly scopeCell = viewChild.required<TemplateRef<{ row: ICampaign }>>('scopeCell');

  protected readonly columns = computed<ColumnDef<ICampaign>[]>(() => [
    { key: 'name', header: 'Chiến dịch', sortable: true, width: '28%', cell: this.nameCell() },
    { key: 'channels', header: 'Kênh', width: '18%', cell: this.channelsCell() },
    { key: 'status', header: 'Trạng thái', sortable: true, width: '14%', cell: this.statusCell() },
    { key: 'startAt', header: 'Thời gian', sortable: true, width: '18%', cell: this.rangeCell() },
    { key: 'scope', header: 'Phạm vi', width: '22%', cell: this.scopeCell() },
  ]);

  protected readonly filtered = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const status = this.statusFilter();
    const channel = this.channelFilter() as CampaignChannel | '';
    return this.campaigns().filter((c) => {
      if (status && c.status !== status) return false;
      if (channel && !c.channels.includes(channel)) return false;
      if (!term) return true;
      return c.code.toLowerCase().includes(term) || c.name.toLowerCase().includes(term);
    });
  });

  protected readonly sorted = computed(() => {
    const sort = this.sortState();
    const list = this.filtered();
    if (!sort) return list;
    return [...list].sort((a, b) => {
      const av = a[sort.column as keyof ICampaign];
      const bv = b[sort.column as keyof ICampaign];
      const cmp = String(av ?? '').localeCompare(String(bv ?? ''), 'vi');
      return sort.direction === 'asc' ? cmp : -cmp;
    });
  });

  protected readonly paged = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.sorted().slice(start, start + this.pageSize);
  });

  protected statusLabel(s: CampaignStatus): string {
    return CAMPAIGN_STATUS_META[s].label;
  }

  protected statusVariant(s: CampaignStatus) {
    return CAMPAIGN_STATUS_META[s].badgeVariant;
  }

  protected channelLabel(c: CampaignChannel): string {
    return CAMPAIGN_CHANNEL_META[c].label;
  }
}
