import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideEdit, LucideImageOff, LucidePackage } from '@lucide/angular';
import {
  BadgeComponent,
  BreadcrumbComponent,
  ButtonComponent,
  CardComponent,
  DescriptionListComponent,
  type DescriptionItem,
  EmptyStateComponent,
  IconComponent,
  TabPanelDirective,
  TabsComponent,
  TagComponent,
} from '@/shared/ui';
import { findBrand } from '../brand.mock';
import { getCategoryPath } from '../category.mock';
import { findProduct } from '../product.mock';
import type { IProduct, IProductVariant, ProductStatus } from '../product.types';

const PRICE_FORMATTER = new Intl.NumberFormat('vi-VN');

const STATUS_LABEL: Record<ProductStatus, string> = {
  active: 'Đang bán',
  draft: 'Nháp',
  archived: 'Ngừng bán',
};

const STATUS_VARIANT: Record<ProductStatus, 'success' | 'warning' | 'neutral'> = {
  active: 'success',
  draft: 'warning',
  archived: 'neutral',
};

@Component({
  selector: 'app-product-detail',
  imports: [
    BadgeComponent,
    BreadcrumbComponent,
    ButtonComponent,
    CardComponent,
    DatePipe,
    DescriptionListComponent,
    EmptyStateComponent,
    IconComponent,
    RouterLink,
    TabPanelDirective,
    TabsComponent,
    TagComponent,
  ],
  template: `
    @if (product(); as p) {
      <div class="space-y-6">
        <app-breadcrumb [items]="breadcrumb()" />

        <app-card padding="lg">
          <div class="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
            <div class="space-y-3">
              <div
                class="relative aspect-3/4 w-full overflow-hidden rounded-lg bg-slate-100 ring-1 ring-slate-200"
              >
                @if (p.images.length > 0) {
                  <img
                    [src]="p.images[activeImageIndex()]"
                    [alt]="p.name + ' — ảnh ' + (activeImageIndex() + 1)"
                    class="h-full w-full object-cover"
                  />
                } @else {
                  <div class="flex h-full w-full items-center justify-center text-slate-400">
                    <app-icon [icon]="imageOffIcon" size="xl" />
                  </div>
                }
              </div>

              @if (p.images.length > 1) {
                <div class="grid grid-cols-5 gap-2">
                  @for (img of p.images; track img; let i = $index) {
                    <button
                      type="button"
                      [class]="thumbClasses(i)"
                      [attr.aria-label]="'Xem ảnh ' + (i + 1)"
                      [attr.aria-current]="i === activeImageIndex() ? 'true' : null"
                      (click)="activeImageIndex.set(i)"
                    >
                      <img
                        [src]="img"
                        [alt]="'Thumbnail ' + (i + 1)"
                        class="h-full w-full object-cover"
                      />
                    </button>
                  }
                </div>
              }
            </div>

            <div class="flex flex-col gap-4">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <h1 class="text-2xl font-bold text-slate-900">{{ p.name }}</h1>
                  <p class="mt-1 text-sm text-slate-500 font-mono">{{ p.sku }}</p>
                </div>
                <a [routerLink]="['/catalog/products', p.id, 'edit']" class="shrink-0">
                  <app-button variant="primary">
                    <app-icon [icon]="editIcon" size="md" />
                    Chỉnh sửa
                  </app-button>
                </a>
              </div>

              <div class="flex flex-wrap items-center gap-2">
                <app-badge [variant]="statusVariant(p.status)" [dot]="true">
                  {{ statusLabel(p.status) }}
                </app-badge>
                <span class="text-xs text-slate-500">
                  Cập nhật: {{ p.updatedAt | date: 'dd/MM/yyyy HH:mm' }}
                </span>
              </div>

              <div class="rounded-lg bg-slate-50 p-4">
                <p class="text-xs uppercase tracking-wide text-slate-500">Giá cơ bản</p>
                <p class="mt-1 text-3xl font-bold text-slate-900">
                  {{ formatPrice(p.basePrice) }} ₫
                </p>
                <div class="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p class="text-xs uppercase tracking-wide text-slate-500">Variant</p>
                    <p class="font-semibold text-slate-900">{{ p.variants.length }}</p>
                  </div>
                  <div>
                    <p class="text-xs uppercase tracking-wide text-slate-500">Tổng tồn</p>
                    <p class="font-semibold text-slate-900">{{ totalStock() }}</p>
                  </div>
                </div>
              </div>

              @if (p.description) {
                <p class="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                  {{ p.description }}
                </p>
              }
            </div>
          </div>
        </app-card>

        <app-tabs [(activeTab)]="activeTab">
          <ng-template appTabPanel="overview" appTabPanelLabel="Tổng quan">
            <div class="grid gap-4 lg:grid-cols-3">
              <app-card padding="lg" class="lg:col-span-2">
                <h2 class="text-sm font-semibold text-slate-700 mb-3">Thông tin sản phẩm</h2>
                <app-description-list [items]="infoItems()" [columns]="2" />
              </app-card>

              <app-card padding="lg">
                <h2 class="text-sm font-semibold text-slate-700 mb-3">Thuộc tính</h2>
                @if (p.attributes.length === 0) {
                  <p class="text-sm text-slate-400">Chưa có thuộc tính nào.</p>
                } @else {
                  <dl class="space-y-3">
                    @for (attr of p.attributes; track attr.key) {
                      <div>
                        <dt class="text-xs uppercase tracking-wide text-slate-500 mb-1">
                          {{ attr.label }}
                        </dt>
                        <dd class="flex flex-wrap gap-1">
                          @for (v of attr.values; track v) {
                            <app-tag variant="neutral">{{ v }}</app-tag>
                          }
                        </dd>
                      </div>
                    }
                  </dl>
                }
              </app-card>
            </div>
          </ng-template>

          <ng-template
            appTabPanel="variants"
            [appTabPanelLabel]="'Variants (' + p.variants.length + ')'"
          >
            <app-card padding="none">
              @if (p.variants.length === 0) {
                <div class="p-8">
                  <app-empty-state
                    title="Chưa có variant"
                    description="Sản phẩm chưa được khai báo thuộc tính nào."
                  />
                </div>
              } @else {
                <div class="overflow-x-auto">
                  <table class="w-full text-sm">
                    <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th class="px-4 py-3 text-left font-medium">SKU</th>
                        @for (attr of p.attributes; track attr.key) {
                          <th class="px-4 py-3 text-left font-medium">{{ attr.label }}</th>
                        }
                        <th class="px-4 py-3 text-right font-medium">Giá</th>
                        <th class="px-4 py-3 text-right font-medium">So sánh</th>
                        <th class="px-4 py-3 text-right font-medium">Tồn kho</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                      @for (variant of p.variants; track variant.id) {
                        <tr class="hover:bg-slate-50">
                          <td class="px-4 py-3 font-mono text-xs text-slate-700">
                            {{ variant.sku }}
                          </td>
                          @for (attr of p.attributes; track attr.key) {
                            <td class="px-4 py-3 text-slate-700">
                              {{ variant.attributes[attr.key] || '—' }}
                            </td>
                          }
                          <td class="px-4 py-3 text-right font-medium text-slate-900">
                            {{ formatPrice(variant.price) }} ₫
                          </td>
                          <td class="px-4 py-3 text-right text-xs text-slate-400 line-through">
                            @if (variant.compareAtPrice) {
                              {{ formatPrice(variant.compareAtPrice) }} ₫
                            } @else {
                              —
                            }
                          </td>
                          <td class="px-4 py-3 text-right">
                            <span [class]="stockClass(variant)">{{ variant.stock }}</span>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              }
            </app-card>
          </ng-template>

          <ng-template appTabPanel="description" appTabPanelLabel="Mô tả">
            <app-card padding="lg">
              @if (p.description) {
                <p class="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                  {{ p.description }}
                </p>
              } @else {
                <app-empty-state
                  title="Chưa có mô tả"
                  description="Mô tả sản phẩm sẽ hiển thị tại đây."
                />
              }
            </app-card>
          </ng-template>
        </app-tabs>
      </div>
    } @else {
      <div class="rounded-lg border border-slate-200 bg-white p-8 text-center">
        <h2 class="text-lg font-semibold text-slate-900">Không tìm thấy sản phẩm</h2>
        <p class="mt-1 text-sm text-slate-500">Sản phẩm có thể đã bị xóa hoặc ID không hợp lệ.</p>
        <a routerLink="/catalog/products" class="mt-4 inline-block">
          <app-button variant="primary">Quay lại danh sách</app-button>
        </a>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailComponent {
  readonly id = input.required<string>();

  protected readonly activeTab = signal('overview');
  protected readonly activeImageIndex = signal(0);
  protected readonly packageIcon = LucidePackage.icon;
  protected readonly editIcon = LucideEdit.icon;
  protected readonly imageOffIcon = LucideImageOff.icon;

  protected thumbClasses(index: number): string {
    const base =
      'aspect-square overflow-hidden rounded-md ring-1 transition focus-visible:outline-2 focus-visible:outline-indigo-500 focus-visible:outline-offset-2';
    return index === this.activeImageIndex()
      ? `${base} ring-2 ring-indigo-500`
      : `${base} ring-slate-200 hover:ring-slate-300`;
  }

  protected readonly product = computed<IProduct | undefined>(() => findProduct(this.id()));

  protected readonly breadcrumb = computed(() => [
    { label: 'Sản phẩm' },
    { label: 'Danh sách', to: '/catalog/products' },
    { label: this.product()?.name ?? this.id() },
  ]);

  protected readonly infoItems = computed<DescriptionItem[]>(() => {
    const p = this.product();
    if (!p) return [];
    const brand = findBrand(p.brandId);
    const path = getCategoryPath(p.categoryId)
      .map((c) => c.name)
      .join(' › ');
    return [
      { label: 'Mã sản phẩm', value: p.sku },
      { label: 'Slug', value: p.slug },
      { label: 'Thương hiệu', value: brand?.name ?? p.brandId },
      { label: 'Danh mục', value: path },
      { label: 'Ngày tạo', value: this.formatDate(p.createdAt) },
      { label: 'Cập nhật cuối', value: this.formatDate(p.updatedAt) },
    ];
  });

  protected readonly totalStock = computed(() => {
    const p = this.product();
    return p ? p.variants.reduce((sum, v) => sum + v.stock, 0) : 0;
  });

  protected formatPrice(n: number): string {
    return PRICE_FORMATTER.format(n);
  }

  protected statusLabel(s: ProductStatus): string {
    return STATUS_LABEL[s];
  }

  protected statusVariant(s: ProductStatus): 'success' | 'warning' | 'neutral' {
    return STATUS_VARIANT[s];
  }

  protected stockClass(v: IProductVariant): string {
    if (v.stock === 0) return 'text-red-600 font-semibold';
    if (v.stock < 10) return 'text-amber-600 font-medium';
    return 'text-slate-900 font-medium';
  }

  private formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
}
