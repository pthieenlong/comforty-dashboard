import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideArrowLeft, LucideSave } from '@lucide/angular';
import {
  BreadcrumbComponent,
  ButtonComponent,
  CardComponent,
  DatePickerComponent,
  FormFieldComponent,
  IconComponent,
  InputComponent,
  MultiSelectComponent,
  NumberInputComponent,
  PriceInputComponent,
  SelectComponent,
  type SelectOption,
  TextareaComponent,
  ToastService,
} from '@/shared/ui';
import { BRANDS } from '@/features/product/brand.mock';
import { CATEGORIES } from '@/features/product/category.mock';
import { PRODUCTS } from '@/features/product/product.mock';
import { MOCK_TENANTS } from '@/core/tenant/tenant.mock';
import { CampaignStore } from './campaign.store';
import { PromotionStore } from './promotion.store';
import {
  PROMOTION_TYPE_META,
  type IPromotion,
  type PromotionRule,
  type PromotionType,
} from './marketing.types';

const TYPE_OPTIONS: SelectOption<PromotionType>[] = (
  Object.entries(PROMOTION_TYPE_META) as [
    PromotionType,
    (typeof PROMOTION_TYPE_META)[PromotionType],
  ][]
).map(([value, meta]) => ({ value, label: meta.label }));

const TENANT_OPTIONS: SelectOption<string>[] = MOCK_TENANTS.map((t) => ({
  value: t.id,
  label: t.name,
}));

const CATEGORY_OPTIONS: SelectOption<string>[] = CATEGORIES.map((c) => ({
  value: c.id,
  label: c.name,
}));

const BRAND_OPTIONS: SelectOption<string>[] = BRANDS.map((b) => ({
  value: b.id,
  label: b.name,
}));

const PRODUCT_OPTIONS: SelectOption<string>[] = PRODUCTS.map((p) => ({
  value: p.id,
  label: p.name,
}));

@Component({
  selector: 'app-promotion-form',
  imports: [
    BreadcrumbComponent,
    ButtonComponent,
    CardComponent,
    DatePickerComponent,
    FormFieldComponent,
    FormsModule,
    IconComponent,
    InputComponent,
    MultiSelectComponent,
    NumberInputComponent,
    PriceInputComponent,
    RouterLink,
    SelectComponent,
    TextareaComponent,
  ],
  template: `
    <div class="space-y-6">
      <div>
        <app-breadcrumb [items]="breadcrumb()" />
        <h1 class="mt-2 text-2xl font-bold text-slate-900">{{ pageTitle() }}</h1>
        <p class="mt-1 text-sm text-slate-500">
          Khai báo điều kiện áp dụng và phạm vi cho rule khuyến mãi.
        </p>
      </div>

      <app-card padding="lg">
        <h2 class="text-sm font-semibold text-slate-700 mb-3">Thông tin chung</h2>
        <div class="grid gap-4 sm:grid-cols-2">
          <app-form-field for="pf-name" label="Tên khuyến mãi" [required]="true">
            <app-input
              id="pf-name"
              [ngModel]="name()"
              (ngModelChange)="name.set($event)"
              placeholder="VD: Giảm 15% đơn từ 500k"
            />
          </app-form-field>

          <app-form-field for="pf-code" label="Mã khuyến mãi" [required]="true">
            <app-input
              id="pf-code"
              [ngModel]="code()"
              (ngModelChange)="code.set($event.toUpperCase())"
              placeholder="VD: SUMMER-15"
            />
          </app-form-field>

          <app-form-field for="pf-start" label="Bắt đầu" [required]="true">
            <app-date-picker
              id="pf-start"
              [ngModel]="startAt()"
              (ngModelChange)="startAt.set($event)"
            />
          </app-form-field>

          <app-form-field for="pf-end" label="Kết thúc" [required]="true">
            <app-date-picker
              id="pf-end"
              [ngModel]="endAt()"
              (ngModelChange)="endAt.set($event)"
              [min]="startAt()"
            />
          </app-form-field>

          <app-form-field
            for="pf-tenants"
            label="Phạm vi chi nhánh"
            helpText="Để trống nếu áp dụng toàn hệ thống"
          >
            <app-multi-select
              id="pf-tenants"
              [options]="tenantOptions"
              [ngModel]="tenantIds()"
              (ngModelChange)="tenantIds.set($event)"
              [searchable]="true"
              placeholder="Toàn hệ thống"
            />
          </app-form-field>

          <app-form-field for="pf-campaign" label="Gắn vào chiến dịch (tuỳ chọn)">
            <app-select
              id="pf-campaign"
              [options]="campaignOptions()"
              [ngModel]="campaignId()"
              (ngModelChange)="campaignId.set($event)"
              [searchable]="true"
              placeholder="Không gắn chiến dịch"
            />
          </app-form-field>

          <div class="sm:col-span-2">
            <app-form-field for="pf-desc" label="Mô tả">
              <app-textarea
                id="pf-desc"
                [ngModel]="description()"
                (ngModelChange)="description.set($event)"
                [rows]="2"
                placeholder="Mô tả ngắn về khuyến mãi..."
              />
            </app-form-field>
          </div>
        </div>
      </app-card>

      <app-card padding="lg">
        <h2 class="text-sm font-semibold text-slate-700 mb-3">Loại khuyến mãi</h2>

        <app-form-field for="pf-type" label="Chọn loại" [required]="true">
          <app-select
            id="pf-type"
            [options]="typeOptions"
            [ngModel]="ruleType()"
            (ngModelChange)="ruleType.set($event)"
          />
        </app-form-field>

        @if (ruleType(); as t) {
          <p class="mt-2 text-xs text-slate-500">{{ typeDesc(t) }}</p>
        }

        <div class="mt-4 border-t border-slate-100 pt-4">
          @switch (ruleType()) {
            @case ('percent_order') {
              <div class="grid gap-4 sm:grid-cols-3">
                <app-form-field for="pf-percent" label="Phần trăm giảm (%)" [required]="true">
                  <app-number-input
                    id="pf-percent"
                    [min]="0"
                    [max]="100"
                    [ngModel]="percent()"
                    (ngModelChange)="percent.set($event ?? 0)"
                  />
                </app-form-field>
                <app-form-field for="pf-min-order" label="Đơn tối thiểu (₫)" [required]="true">
                  <app-price-input
                    id="pf-min-order"
                    [ngModel]="minOrder()"
                    (ngModelChange)="minOrder.set($event ?? 0)"
                  />
                </app-form-field>
                <app-form-field for="pf-max-discount" label="Giảm tối đa (₫)">
                  <app-price-input
                    id="pf-max-discount"
                    [ngModel]="maxDiscount()"
                    (ngModelChange)="maxDiscount.set($event)"
                    placeholder="Bỏ trống = không giới hạn"
                  />
                </app-form-field>
              </div>
            }

            @case ('fixed_order') {
              <div class="grid gap-4 sm:grid-cols-2">
                <app-form-field for="pf-amount" label="Số tiền giảm (₫)" [required]="true">
                  <app-price-input
                    id="pf-amount"
                    [ngModel]="amount()"
                    (ngModelChange)="amount.set($event ?? 0)"
                  />
                </app-form-field>
                <app-form-field for="pf-min-order2" label="Đơn tối thiểu (₫)" [required]="true">
                  <app-price-input
                    id="pf-min-order2"
                    [ngModel]="minOrder()"
                    (ngModelChange)="minOrder.set($event ?? 0)"
                  />
                </app-form-field>
              </div>
            }

            @case ('percent_category') {
              <div class="space-y-4">
                <div class="grid gap-4 sm:grid-cols-2">
                  <app-form-field for="pf-cat-percent" label="Phần trăm giảm (%)" [required]="true">
                    <app-number-input
                      id="pf-cat-percent"
                      [min]="0"
                      [max]="100"
                      [ngModel]="percent()"
                      (ngModelChange)="percent.set($event ?? 0)"
                    />
                  </app-form-field>
                  <app-form-field for="pf-cat-max" label="Giảm tối đa (₫)">
                    <app-price-input
                      id="pf-cat-max"
                      [ngModel]="maxDiscount()"
                      (ngModelChange)="maxDiscount.set($event)"
                      placeholder="Bỏ trống = không giới hạn"
                    />
                  </app-form-field>
                </div>
                <app-form-field for="pf-categories" label="Danh mục áp dụng">
                  <app-multi-select
                    id="pf-categories"
                    [options]="categoryOptions"
                    [ngModel]="categoryIds()"
                    (ngModelChange)="categoryIds.set($event)"
                    [searchable]="true"
                    placeholder="Chọn danh mục"
                  />
                </app-form-field>
                <app-form-field for="pf-brands" label="Thương hiệu áp dụng">
                  <app-multi-select
                    id="pf-brands"
                    [options]="brandOptions"
                    [ngModel]="brandIds()"
                    (ngModelChange)="brandIds.set($event)"
                    [searchable]="true"
                    placeholder="Chọn thương hiệu"
                  />
                </app-form-field>
                <p class="text-xs text-slate-500">
                  Để cả 2 trống nếu muốn áp dụng cho toàn bộ sản phẩm.
                </p>
              </div>
            }

            @case ('free_shipping') {
              <app-form-field
                for="pf-ship-min"
                label="Đơn tối thiểu (₫)"
                helpText="Đặt 0 nếu áp dụng cho mọi đơn"
              >
                <app-price-input
                  id="pf-ship-min"
                  [ngModel]="minOrder()"
                  (ngModelChange)="minOrder.set($event ?? 0)"
                />
              </app-form-field>
            }

            @case ('bogo') {
              <div class="space-y-4">
                <div class="grid gap-4 sm:grid-cols-2">
                  <app-form-field for="pf-buy" label="Mua (X)" [required]="true">
                    <app-number-input
                      id="pf-buy"
                      [min]="1"
                      [ngModel]="buyQty()"
                      (ngModelChange)="buyQty.set($event ?? 1)"
                    />
                  </app-form-field>
                  <app-form-field for="pf-get" label="Tặng (Y)" [required]="true">
                    <app-number-input
                      id="pf-get"
                      [min]="1"
                      [ngModel]="getQty()"
                      (ngModelChange)="getQty.set($event ?? 1)"
                    />
                  </app-form-field>
                </div>
                <app-form-field
                  for="pf-trigger-products"
                  label="Sản phẩm kích hoạt"
                  helpText="Để trống nếu áp dụng cho mọi sản phẩm"
                >
                  <app-multi-select
                    id="pf-trigger-products"
                    [options]="productOptions"
                    [ngModel]="triggerProductIds()"
                    (ngModelChange)="triggerProductIds.set($event)"
                    [searchable]="true"
                    placeholder="Mọi sản phẩm"
                  />
                </app-form-field>
              </div>
            }
          }
        </div>
      </app-card>

      <div class="flex items-center justify-between">
        <a routerLink="/marketing/promotions">
          <app-button variant="secondary">
            <app-icon [icon]="backIcon" size="md" />
            Huỷ
          </app-button>
        </a>
        <app-button
          variant="primary"
          [disabled]="!canSubmit() || saving()"
          [loading]="saving()"
          (click)="onSave()"
        >
          <app-icon [icon]="saveIcon" size="md" />
          {{ isEditMode() ? 'Lưu thay đổi' : 'Tạo khuyến mãi' }}
        </app-button>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromotionFormComponent {
  private readonly promotionStore = inject(PromotionStore);
  private readonly campaignStore = inject(CampaignStore);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly id = input<string | null>(null);

  protected readonly backIcon = LucideArrowLeft.icon;
  protected readonly saveIcon = LucideSave.icon;

  protected readonly typeOptions = TYPE_OPTIONS;
  protected readonly tenantOptions = TENANT_OPTIONS;
  protected readonly categoryOptions = CATEGORY_OPTIONS;
  protected readonly brandOptions = BRAND_OPTIONS;
  protected readonly productOptions = PRODUCT_OPTIONS;

  protected readonly campaignOptions = computed<SelectOption<string>[]>(() => [
    { value: '', label: 'Không gắn chiến dịch' },
    ...this.campaignStore.campaigns().map((c) => ({ value: c.id, label: c.name })),
  ]);

  // Common fields
  protected readonly name = signal<string>('');
  protected readonly code = signal<string>('');
  protected readonly description = signal<string>('');
  protected readonly startAt = signal<string | null>(null);
  protected readonly endAt = signal<string | null>(null);
  protected readonly tenantIds = signal<string[]>([]);
  protected readonly campaignId = signal<string>('');
  protected readonly ruleType = signal<PromotionType>('percent_order');
  protected readonly saving = signal<boolean>(false);

  // Rule-specific fields (shared across types where reasonable)
  protected readonly percent = signal<number>(10);
  protected readonly amount = signal<number>(50000);
  protected readonly minOrder = signal<number>(300000);
  protected readonly maxDiscount = signal<number | null>(null);
  protected readonly categoryIds = signal<string[]>([]);
  protected readonly brandIds = signal<string[]>([]);
  protected readonly buyQty = signal<number>(2);
  protected readonly getQty = signal<number>(1);
  protected readonly triggerProductIds = signal<string[]>([]);

  protected readonly isEditMode = computed(() => this.id() !== null);

  protected readonly pageTitle = computed(() =>
    this.isEditMode() ? 'Chỉnh sửa khuyến mãi' : 'Tạo khuyến mãi mới',
  );

  protected readonly breadcrumb = computed(() => [
    { label: 'Trang chủ', to: '/dashboard' },
    { label: 'Marketing' },
    { label: 'Khuyến mãi', to: '/marketing/promotions' },
    { label: this.isEditMode() ? this.name() || 'Edit' : 'Tạo mới' },
  ]);

  protected readonly canSubmit = computed(
    () =>
      this.name().trim().length > 0 &&
      this.code().trim().length > 0 &&
      this.startAt() !== null &&
      this.endAt() !== null,
  );

  constructor() {
    effect(() => {
      const id = this.id();
      if (!id) return;
      const p = this.promotionStore.findById(id);
      if (!p) return;
      this.name.set(p.name);
      this.code.set(p.code);
      this.description.set(p.description);
      this.startAt.set(p.startAt.slice(0, 10));
      this.endAt.set(p.endAt.slice(0, 10));
      this.tenantIds.set([...p.tenantIds]);
      this.campaignId.set(p.campaignId ?? '');
      this.ruleType.set(p.rule.type);
      this.loadRule(p.rule);
    });
  }

  private loadRule(rule: PromotionRule): void {
    switch (rule.type) {
      case 'percent_order':
        this.percent.set(rule.percent);
        this.minOrder.set(rule.minOrderValue);
        this.maxDiscount.set(rule.maxDiscount);
        break;
      case 'fixed_order':
        this.amount.set(rule.amount);
        this.minOrder.set(rule.minOrderValue);
        break;
      case 'percent_category':
        this.percent.set(rule.percent);
        this.categoryIds.set([...rule.categoryIds]);
        this.brandIds.set([...rule.brandIds]);
        this.maxDiscount.set(rule.maxDiscount);
        break;
      case 'free_shipping':
        this.minOrder.set(rule.minOrderValue);
        break;
      case 'bogo':
        this.buyQty.set(rule.buyQuantity);
        this.getQty.set(rule.getQuantity);
        this.triggerProductIds.set([...rule.triggerProductIds]);
        break;
    }
  }

  protected typeDesc(t: PromotionType): string {
    return PROMOTION_TYPE_META[t].description;
  }

  private buildRule(): PromotionRule {
    switch (this.ruleType()) {
      case 'percent_order':
        return {
          type: 'percent_order',
          percent: this.percent(),
          minOrderValue: this.minOrder(),
          maxDiscount: this.maxDiscount(),
        };
      case 'fixed_order':
        return {
          type: 'fixed_order',
          amount: this.amount(),
          minOrderValue: this.minOrder(),
        };
      case 'percent_category':
        return {
          type: 'percent_category',
          percent: this.percent(),
          categoryIds: this.categoryIds(),
          brandIds: this.brandIds(),
          maxDiscount: this.maxDiscount(),
        };
      case 'free_shipping':
        return { type: 'free_shipping', minOrderValue: this.minOrder() };
      case 'bogo':
        return {
          type: 'bogo',
          buyQuantity: this.buyQty(),
          getQuantity: this.getQty(),
          triggerProductIds: this.triggerProductIds(),
          freeProductIds: [],
        };
    }
  }

  protected async onSave(): Promise<void> {
    if (!this.canSubmit()) return;
    this.saving.set(true);
    try {
      const existing = this.id() ? this.promotionStore.findById(this.id() as string) : null;
      const id = existing?.id ?? `promo-local-${Date.now().toString(36)}`;
      const next: IPromotion = {
        id,
        code: this.code().trim(),
        name: this.name().trim(),
        description: this.description().trim(),
        status: existing?.status ?? 'draft',
        startAt: new Date(this.startAt() as string).toISOString(),
        endAt: new Date(this.endAt() as string).toISOString(),
        rule: this.buildRule(),
        campaignId: this.campaignId() || null,
        tenantIds: this.tenantIds(),
        usageCount: existing?.usageCount ?? 0,
        createdAt: existing?.createdAt ?? new Date().toISOString(),
        createdBy: existing?.createdBy ?? 'Bạn',
      };
      await this.promotionStore.upsert(next);
      this.toast.success(this.isEditMode() ? 'Đã lưu thay đổi' : 'Đã tạo khuyến mãi');
      await this.router.navigate(['/marketing/promotions', id]);
    } finally {
      this.saving.set(false);
    }
  }
}
