import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideEdit, LucidePackage } from '@lucide/angular';
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
          <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div class="flex items-start gap-4 min-w-0">
              <div
                class="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400"
              >
                <app-icon [icon]="packageIcon" size="lg" />
              </div>
              <div class="min-w-0">
                <h1 class="text-2xl font-bold text-slate-900 truncate">{{ p.name }}</h1>
                <p class="mt-1 text-sm text-slate-500 font-mono">{{ p.sku }}</p>
                <div class="mt-2 flex flex-wrap items-center gap-2">
                  <app-badge [variant]="statusVariant(p.status)" [dot]="true">
                    {{ statusLabel(p.status) }}
                  </app-badge>
                  <span class="text-xs text-slate-500">
                    Cập nhật: {{ p.updatedAt | date: 'dd/MM/yyyy HH:mm' }}
                  </span>
                </div>
              </div>
            </div>
            <div class="flex gap-2 shrink-0">
              <a [routerLink]="['/catalog/products', p.id, 'edit']">
                <app-button variant="primary">
                  <app-icon [icon]="editIcon" size="md" />
                  Chỉnh sửa
                </app-button>
              </a>
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
                <h2 class="text-sm font-semibold text-slate-700 mb-3">Tóm tắt</h2>
                <dl class="space-y-3">
                  <div>
                    <dt class="text-xs uppercase tracking-wide text-slate-500">Giá cơ bản</dt>
                    <dd class="mt-0.5 text-2xl font-bold text-slate-900">
                      {{ formatPrice(p.basePrice) }} ₫
                    </dd>
                  </div>
                  <div class="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                    <div>
                      <dt class="text-xs uppercase tracking-wide text-slate-500">Variant</dt>
                      <dd class="mt-0.5 text-lg font-semibold text-slate-900">
                        {{ p.variants.length }}
                      </dd>
                    </div>
                    <div>
                      <dt class="text-xs uppercase tracking-wide text-slate-500">Tổng kho</dt>
                      <dd class="mt-0.5 text-lg font-semibold text-slate-900">
                        {{ totalStock() }}
                      </dd>
                    </div>
                  </div>
                  @if (p.attributes.length > 0) {
                    <div class="pt-3 border-t border-slate-100">
                      <dt class="text-xs uppercase tracking-wide text-slate-500 mb-1">
                        Thuộc tính
                      </dt>
                      <dd class="flex flex-wrap gap-1">
                        @for (attr of p.attributes; track attr.key) {
                          <app-tag variant="neutral">
                            {{ attr.label }} · {{ attr.values.length }}
                          </app-tag>
                        }
                      </dd>
                    </div>
                  }
                </dl>
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
  protected readonly packageIcon = LucidePackage.icon;
  protected readonly editIcon = LucideEdit.icon;

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
