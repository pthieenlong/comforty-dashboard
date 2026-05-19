import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideCalendar, LucideEdit, LucidePauseCircle, LucidePlayCircle } from '@lucide/angular';
import {
  BadgeComponent,
  BreadcrumbComponent,
  ButtonComponent,
  CardComponent,
  ConfirmDialogService,
  DescriptionListComponent,
  type DescriptionItem,
  IconComponent,
  TabPanelDirective,
  TabsComponent,
  ToastService,
} from '@/shared/ui';
import { MOCK_TENANTS } from '@/core/tenant/tenant.mock';
import { CampaignStore } from './campaign.store';
import { PromotionStore } from './promotion.store';
import { VoucherStore } from './voucher.store';
import {
  CAMPAIGN_CHANNEL_META,
  CAMPAIGN_STATUS_META,
  PROMOTION_STATUS_META,
  PROMOTION_TYPE_META,
  VOUCHER_STATUS_META,
  VOUCHER_TYPE_META,
  type CampaignStatus,
  type PromotionStatus,
  type PromotionType,
  type VoucherStatus,
  type VoucherType,
} from './marketing.types';

@Component({
  selector: 'app-campaign-detail',
  imports: [
    BadgeComponent,
    BreadcrumbComponent,
    ButtonComponent,
    CardComponent,
    DescriptionListComponent,
    IconComponent,
    RouterLink,
    TabPanelDirective,
    TabsComponent,
  ],
  template: `
    @if (campaign(); as c) {
      <div class="space-y-6">
        <app-breadcrumb [items]="breadcrumb()" />

        <app-card padding="lg">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div class="flex items-start gap-4 min-w-0">
              <span
                class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700"
              >
                <app-icon [icon]="calendarIcon" size="lg" />
              </span>
              <div class="min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <h1 class="text-2xl font-bold text-slate-900">{{ c.name }}</h1>
                  <app-badge [variant]="statusVariant(c.status)" [dot]="true">
                    {{ statusLabel(c.status) }}
                  </app-badge>
                </div>
                <p class="mt-1 font-mono text-xs text-slate-500">{{ c.code }}</p>
                @if (c.description) {
                  <p class="mt-2 text-sm text-slate-600 max-w-2xl">{{ c.description }}</p>
                }
              </div>
            </div>

            <div class="flex gap-2 shrink-0 flex-wrap justify-end">
              <a [routerLink]="['/marketing/campaigns', c.id, 'edit']">
                <app-button variant="secondary">
                  <app-icon [icon]="editIcon" size="md" />
                  Chỉnh sửa
                </app-button>
              </a>
              @if (c.status === 'active') {
                <app-button variant="secondary" (click)="onPause()">
                  <app-icon [icon]="pauseIcon" size="md" />
                  Tạm dừng
                </app-button>
              } @else if (c.status === 'scheduled' || c.status === 'draft') {
                <app-button variant="primary" (click)="onActivate()">
                  <app-icon [icon]="playIcon" size="md" />
                  Kích hoạt
                </app-button>
              }
            </div>
          </div>
        </app-card>

        <app-card padding="none">
          <div class="px-5 pt-3">
            <app-tabs [(activeTab)]="activeTab">
              <ng-template appTabPanel="info" appTabPanelLabel="Thông tin">
                <div class="px-1 py-2 space-y-4">
                  @if (c.bannerUrl) {
                    <div>
                      <p class="text-xs uppercase text-slate-500 mb-1">Banner</p>
                      <img
                        [src]="c.bannerUrl"
                        [alt]="c.name"
                        class="w-full max-w-2xl rounded-md border border-slate-200"
                      />
                    </div>
                  }
                  <app-description-list [items]="infoItems()" [columns]="2" />
                </div>
              </ng-template>

              <ng-template
                appTabPanel="promotions"
                appTabPanelLabel="Khuyến mãi ({{ promotions().length }})"
              >
                <div class="px-1 py-2">
                  @if (promotions().length === 0) {
                    <p class="py-8 text-center text-sm text-slate-500">
                      Chưa có khuyến mãi nào gắn vào chiến dịch này.
                    </p>
                  } @else {
                    <ul class="divide-y divide-slate-100">
                      @for (p of promotions(); track p.id) {
                        <li class="py-3">
                          <div class="flex items-start justify-between gap-3">
                            <div class="min-w-0">
                              <a
                                [routerLink]="['/marketing/promotions', p.id]"
                                class="font-medium text-sm text-slate-900 hover:text-indigo-600"
                              >
                                {{ p.name }}
                              </a>
                              <p class="font-mono text-xs text-slate-500">{{ p.code }}</p>
                              <p class="mt-1 text-xs text-slate-600">
                                {{ promoTypeLabel(p.rule.type) }} · {{ p.usageCount }} lượt dùng
                              </p>
                            </div>
                            <app-badge [variant]="promoStatusVariant(p.status)" [dot]="true">
                              {{ promoStatusLabel(p.status) }}
                            </app-badge>
                          </div>
                        </li>
                      }
                    </ul>
                  }
                </div>
              </ng-template>

              <ng-template
                appTabPanel="vouchers"
                appTabPanelLabel="Voucher ({{ vouchers().length }})"
              >
                <div class="px-1 py-2">
                  @if (vouchers().length === 0) {
                    <p class="py-8 text-center text-sm text-slate-500">
                      Chưa có voucher batch nào gắn vào chiến dịch này.
                    </p>
                  } @else {
                    <ul class="divide-y divide-slate-100">
                      @for (v of vouchers(); track v.id) {
                        <li class="py-3">
                          <div class="flex items-start justify-between gap-3">
                            <div class="min-w-0">
                              <a
                                [routerLink]="['/marketing/vouchers', v.id]"
                                class="font-medium text-sm text-slate-900 hover:text-indigo-600"
                              >
                                {{ v.name }}
                              </a>
                              <p class="font-mono text-xs text-slate-500">{{ v.code }}</p>
                              <p class="mt-1 text-xs text-slate-600">
                                {{ voucherTypeLabel(v.voucherType) }} ·
                                <strong>{{ v.usedCount }}</strong> / {{ v.totalCodes }} đã dùng
                              </p>
                            </div>
                            <app-badge [variant]="voucherStatusVariant(v.status)" [dot]="true">
                              {{ voucherStatusLabel(v.status) }}
                            </app-badge>
                          </div>
                        </li>
                      }
                    </ul>
                  }
                </div>
              </ng-template>
            </app-tabs>
          </div>
        </app-card>
      </div>
    } @else {
      <div class="rounded-lg border border-slate-200 bg-white p-8 text-center">
        <h2 class="text-lg font-semibold text-slate-900">Không tìm thấy chiến dịch</h2>
        <a routerLink="/marketing/campaigns" class="mt-4 inline-block">
          <app-button variant="primary">Quay lại danh sách</app-button>
        </a>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampaignDetailComponent {
  private readonly campaignStore = inject(CampaignStore);
  private readonly promotionStore = inject(PromotionStore);
  private readonly voucherStore = inject(VoucherStore);
  private readonly toast = inject(ToastService);
  private readonly confirmDialog = inject(ConfirmDialogService);

  readonly id = input.required<string>();

  protected readonly calendarIcon = LucideCalendar.icon;
  protected readonly editIcon = LucideEdit.icon;
  protected readonly pauseIcon = LucidePauseCircle.icon;
  protected readonly playIcon = LucidePlayCircle.icon;

  protected readonly activeTab = signal<string>('info');

  protected readonly campaign = computed(() => this.campaignStore.findById(this.id()));
  protected readonly promotions = computed(() => this.promotionStore.findByCampaign(this.id()));
  protected readonly vouchers = computed(() => this.voucherStore.findByCampaign(this.id()));

  protected readonly breadcrumb = computed(() => [
    { label: 'Trang chủ', to: '/dashboard' },
    { label: 'Marketing' },
    { label: 'Chiến dịch', to: '/marketing/campaigns' },
    { label: this.campaign()?.name ?? this.id() },
  ]);

  protected readonly infoItems = computed<DescriptionItem[]>(() => {
    const c = this.campaign();
    if (!c) return [];
    const channelLabels = c.channels.map((ch) => CAMPAIGN_CHANNEL_META[ch].label).join(', ');
    const scope =
      c.tenantIds.length === 0
        ? 'Toàn hệ thống'
        : c.tenantIds.map((id) => MOCK_TENANTS.find((t) => t.id === id)?.name ?? id).join(', ');
    return [
      { label: 'Mã chiến dịch', value: c.code },
      { label: 'Trạng thái', value: CAMPAIGN_STATUS_META[c.status].label },
      { label: 'Bắt đầu', value: new Date(c.startAt).toLocaleDateString('vi-VN') },
      { label: 'Kết thúc', value: new Date(c.endAt).toLocaleDateString('vi-VN') },
      { label: 'Kênh', value: channelLabels || '—' },
      { label: 'Phạm vi chi nhánh', value: scope },
      {
        label: 'Người tạo',
        value: c.createdBy,
        hint: new Date(c.createdAt).toLocaleString('vi-VN'),
      },
    ];
  });

  protected statusLabel(s: CampaignStatus): string {
    return CAMPAIGN_STATUS_META[s].label;
  }

  protected statusVariant(s: CampaignStatus) {
    return CAMPAIGN_STATUS_META[s].badgeVariant;
  }

  protected promoTypeLabel(t: PromotionType): string {
    return PROMOTION_TYPE_META[t].label;
  }

  protected promoStatusLabel(s: PromotionStatus): string {
    return PROMOTION_STATUS_META[s].label;
  }

  protected promoStatusVariant(s: PromotionStatus) {
    return PROMOTION_STATUS_META[s].badgeVariant;
  }

  protected voucherTypeLabel(t: VoucherType): string {
    return VOUCHER_TYPE_META[t].label;
  }

  protected voucherStatusLabel(s: VoucherStatus): string {
    return VOUCHER_STATUS_META[s].label;
  }

  protected voucherStatusVariant(s: VoucherStatus) {
    return VOUCHER_STATUS_META[s].badgeVariant;
  }

  protected async onPause(): Promise<void> {
    const ok = await this.confirmDialog.confirm({
      title: 'Tạm dừng chiến dịch',
      message: 'Chiến dịch sẽ bị tạm dừng. Bạn có chắc?',
      confirmText: 'Tạm dừng',
      variant: 'danger',
    });
    if (!ok) return;
    await this.campaignStore.setStatus(this.id(), 'ended');
    this.toast.success('Đã tạm dừng chiến dịch');
  }

  protected async onActivate(): Promise<void> {
    await this.campaignStore.setStatus(this.id(), 'active');
    this.toast.success('Đã kích hoạt chiến dịch');
  }
}
