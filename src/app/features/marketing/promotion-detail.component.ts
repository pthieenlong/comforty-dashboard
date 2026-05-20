import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideEdit, LucidePauseCircle, LucidePlayCircle, LucideTag } from '@lucide/angular';
import {
  BadgeComponent,
  BreadcrumbComponent,
  ButtonComponent,
  CardComponent,
  ConfirmDialogService,
  DescriptionListComponent,
  type DescriptionItem,
  IconComponent,
  ToastService,
} from '@/shared/ui';
import { BRANDS } from '@/features/product/brand.mock';
import { CATEGORIES } from '@/features/product/category.mock';
import { MOCK_TENANTS } from '@/core/tenant/tenant.mock';
import { CampaignStore } from './campaign.store';
import { PromotionStore } from './promotion.store';
import {
  PROMOTION_STATUS_META,
  PROMOTION_TYPE_META,
  type PromotionRule,
  type PromotionStatus,
  type PromotionType,
} from './marketing.types';

const PRICE_FORMATTER = new Intl.NumberFormat('vi-VN');

@Component({
  selector: 'app-promotion-detail',
  imports: [
    BadgeComponent,
    BreadcrumbComponent,
    ButtonComponent,
    CardComponent,
    DescriptionListComponent,
    IconComponent,
    RouterLink,
  ],
  template: `
    @if (promotion(); as p) {
      <div class="space-y-6">
        <app-breadcrumb [items]="breadcrumb()" />

        <app-card padding="lg">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div class="flex items-start gap-4 min-w-0">
              <span
                class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700"
              >
                <app-icon [icon]="tagIcon" size="lg" />
              </span>
              <div class="min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <h1 class="text-2xl font-bold text-slate-900">{{ p.name }}</h1>
                  <app-badge [variant]="statusVariant(p.status)" [dot]="true">
                    {{ statusLabel(p.status) }}
                  </app-badge>
                </div>
                <p class="mt-1 font-mono text-xs text-slate-500">{{ p.code }}</p>
                <p class="mt-2 text-sm text-slate-600 max-w-2xl">
                  {{ typeLabel(p.rule.type) }} — {{ typeDesc(p.rule.type) }}
                </p>
              </div>
            </div>

            <div class="flex gap-2 shrink-0 flex-wrap justify-end">
              <a [routerLink]="['/marketing/promotions', p.id, 'edit']">
                <app-button variant="secondary">
                  <app-icon [icon]="editIcon" size="md" />
                  Chỉnh sửa
                </app-button>
              </a>
              @if (p.status === 'active') {
                <app-button variant="secondary" (click)="onPause()">
                  <app-icon [icon]="pauseIcon" size="md" />
                  Tạm dừng
                </app-button>
              } @else if (p.status === 'paused' || p.status === 'draft') {
                <app-button variant="primary" (click)="onActivate()">
                  <app-icon [icon]="playIcon" size="md" />
                  Kích hoạt
                </app-button>
              }
            </div>
          </div>
        </app-card>

        <div class="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <app-card padding="lg">
            <h2 class="text-sm font-semibold text-slate-700 mb-3">Điều kiện áp dụng</h2>
            <app-description-list [items]="ruleItems()" [columns]="1" />
            @if (p.description) {
              <div class="mt-4 border-t border-slate-100 pt-3">
                <p class="text-xs uppercase text-slate-500">Mô tả</p>
                <p class="mt-1 text-sm text-slate-700">{{ p.description }}</p>
              </div>
            }
          </app-card>

          <app-card padding="lg">
            <h2 class="text-sm font-semibold text-slate-700 mb-3">Thông tin</h2>
            <app-description-list [items]="infoItems()" [columns]="1" />
            @if (campaignName(); as cn) {
              <div class="mt-4 border-t border-slate-100 pt-3">
                <p class="text-xs uppercase text-slate-500 mb-1">Chiến dịch</p>
                <a
                  [routerLink]="['/marketing/campaigns', p.campaignId]"
                  class="text-sm font-medium text-slate-900 hover:text-indigo-600"
                >
                  {{ cn }}
                </a>
              </div>
            }
          </app-card>
        </div>
      </div>
    } @else {
      <div class="rounded-lg border border-slate-200 bg-white p-8 text-center">
        <h2 class="text-lg font-semibold text-slate-900">Không tìm thấy khuyến mãi</h2>
        <a routerLink="/marketing/promotions" class="mt-4 inline-block">
          <app-button variant="primary">Quay lại danh sách</app-button>
        </a>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromotionDetailComponent {
  private readonly promotionStore = inject(PromotionStore);
  private readonly campaignStore = inject(CampaignStore);
  private readonly toast = inject(ToastService);
  private readonly confirmDialog = inject(ConfirmDialogService);

  readonly id = input.required<string>();

  protected readonly tagIcon = LucideTag.icon;
  protected readonly editIcon = LucideEdit.icon;
  protected readonly pauseIcon = LucidePauseCircle.icon;
  protected readonly playIcon = LucidePlayCircle.icon;

  protected readonly promotion = computed(() => this.promotionStore.findById(this.id()));

  protected readonly campaignName = computed(() => {
    const cid = this.promotion()?.campaignId;
    if (!cid) return null;
    return this.campaignStore.findById(cid)?.name ?? null;
  });

  protected readonly breadcrumb = computed(() => [
    { label: 'Trang chủ', to: '/dashboard' },
    { label: 'Marketing' },
    { label: 'Khuyến mãi', to: '/marketing/promotions' },
    { label: this.promotion()?.name ?? this.id() },
  ]);

  protected readonly ruleItems = computed<DescriptionItem[]>(() => {
    const p = this.promotion();
    if (!p) return [];
    return this.ruleToItems(p.rule);
  });

  protected readonly infoItems = computed<DescriptionItem[]>(() => {
    const p = this.promotion();
    if (!p) return [];
    const scope =
      p.tenantIds.length === 0
        ? 'Toàn hệ thống'
        : p.tenantIds.map((id) => MOCK_TENANTS.find((t) => t.id === id)?.name ?? id).join(', ');
    return [
      { label: 'Mã', value: p.code },
      { label: 'Trạng thái', value: PROMOTION_STATUS_META[p.status].label },
      { label: 'Bắt đầu', value: new Date(p.startAt).toLocaleDateString('vi-VN') },
      { label: 'Kết thúc', value: new Date(p.endAt).toLocaleDateString('vi-VN') },
      { label: 'Phạm vi', value: scope },
      { label: 'Đã dùng', value: `${p.usageCount} lượt` },
      {
        label: 'Người tạo',
        value: p.createdBy,
        hint: new Date(p.createdAt).toLocaleString('vi-VN'),
      },
    ];
  });

  private ruleToItems(rule: PromotionRule): DescriptionItem[] {
    switch (rule.type) {
      case 'percent_order':
        return [
          { label: 'Loại', value: 'Giảm % toàn đơn' },
          { label: 'Phần trăm giảm', value: `${rule.percent}%` },
          {
            label: 'Đơn tối thiểu',
            value: `${PRICE_FORMATTER.format(rule.minOrderValue)}₫`,
          },
          {
            label: 'Giảm tối đa',
            value: rule.maxDiscount
              ? `${PRICE_FORMATTER.format(rule.maxDiscount)}₫`
              : 'Không giới hạn',
          },
        ];
      case 'fixed_order':
        return [
          { label: 'Loại', value: 'Giảm đồng số cố định' },
          { label: 'Số tiền giảm', value: `${PRICE_FORMATTER.format(rule.amount)}₫` },
          {
            label: 'Đơn tối thiểu',
            value: `${PRICE_FORMATTER.format(rule.minOrderValue)}₫`,
          },
        ];
      case 'percent_category':
        return [
          { label: 'Loại', value: 'Giảm % theo danh mục / thương hiệu' },
          { label: 'Phần trăm giảm', value: `${rule.percent}%` },
          {
            label: 'Danh mục',
            value:
              rule.categoryIds.length === 0
                ? '—'
                : rule.categoryIds
                    .map((id) => CATEGORIES.find((c) => c.id === id)?.name ?? id)
                    .join(', '),
          },
          {
            label: 'Thương hiệu',
            value:
              rule.brandIds.length === 0
                ? '—'
                : rule.brandIds.map((id) => BRANDS.find((b) => b.id === id)?.name ?? id).join(', '),
          },
          {
            label: 'Giảm tối đa',
            value: rule.maxDiscount
              ? `${PRICE_FORMATTER.format(rule.maxDiscount)}₫`
              : 'Không giới hạn',
          },
        ];
      case 'free_shipping':
        return [
          { label: 'Loại', value: 'Miễn phí vận chuyển' },
          {
            label: 'Đơn tối thiểu',
            value:
              rule.minOrderValue === 0
                ? 'Không yêu cầu'
                : `${PRICE_FORMATTER.format(rule.minOrderValue)}₫`,
          },
        ];
      case 'bogo':
        return [
          { label: 'Loại', value: 'Mua X tặng Y' },
          { label: 'Mua', value: `${rule.buyQuantity} sản phẩm` },
          { label: 'Tặng', value: `${rule.getQuantity} sản phẩm` },
          {
            label: 'Áp dụng cho',
            value:
              rule.triggerProductIds.length === 0
                ? 'Mọi sản phẩm'
                : `${rule.triggerProductIds.length} sản phẩm cụ thể`,
          },
        ];
    }
  }

  protected typeLabel(t: PromotionType): string {
    return PROMOTION_TYPE_META[t].label;
  }

  protected typeDesc(t: PromotionType): string {
    return PROMOTION_TYPE_META[t].description;
  }

  protected statusLabel(s: PromotionStatus): string {
    return PROMOTION_STATUS_META[s].label;
  }

  protected statusVariant(s: PromotionStatus) {
    return PROMOTION_STATUS_META[s].badgeVariant;
  }

  protected async onPause(): Promise<void> {
    const ok = await this.confirmDialog.confirm({
      title: 'Tạm dừng khuyến mãi',
      message: 'Khuyến mãi sẽ không áp dụng cho đơn mới. Bạn có chắc?',
      confirmText: 'Tạm dừng',
      variant: 'danger',
    });
    if (!ok) return;
    await this.promotionStore.setStatus(this.id(), 'paused');
    this.toast.success('Đã tạm dừng khuyến mãi');
  }

  protected async onActivate(): Promise<void> {
    await this.promotionStore.setStatus(this.id(), 'active');
    this.toast.success('Đã kích hoạt khuyến mãi');
  }
}
