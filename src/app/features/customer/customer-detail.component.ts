import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideArrowDownCircle,
  LucideArrowUpCircle,
  LucideAward,
  LucideCheck,
  LucideChevronDown,
  LucideChevronUp,
  LucideClock,
  LucideMessageSquare,
  LucidePackage,
  LucideRotateCcw,
  LucideShoppingBag,
  LucideSparkles,
  LucideStar,
  LucideTruck,
  LucideX,
  type LucideIconData,
} from '@lucide/angular';
import {
  AvatarComponent,
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
  TimelineComponent,
  type TimelineEntry,
  type TimelineDotVariant,
} from '@/shared/ui';
import { TIER_META, findCustomer } from './customer.mock';
import { InquiryStore } from './inquiry.store';
import { ReviewStore } from './review.store';
import { TicketStore } from './ticket.store';
import type {
  CustomerOrderStatus,
  Gender,
  ILoyaltyEvent,
  LoyaltyEventType,
  LoyaltyTier,
} from './customer.types';

const PRICE_FORMATTER = new Intl.NumberFormat('vi-VN');

const STATUS_LABEL: Record<CustomerOrderStatus, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao',
  delivered: 'Hoàn tất',
  cancelled: 'Đã huỷ',
  refunded: 'Đã hoàn tiền',
};

const STATUS_VARIANT: Record<
  CustomerOrderStatus,
  'neutral' | 'info' | 'warning' | 'success' | 'danger'
> = {
  pending: 'warning',
  confirmed: 'info',
  shipping: 'info',
  delivered: 'success',
  cancelled: 'neutral',
  refunded: 'danger',
};

const STATUS_ICON: Record<CustomerOrderStatus, LucideIconData> = {
  pending: LucideClock.icon,
  confirmed: LucideCheck.icon,
  shipping: LucideTruck.icon,
  delivered: LucidePackage.icon,
  cancelled: LucideX.icon,
  refunded: LucideRotateCcw.icon,
};

const LOYALTY_ICON: Record<LoyaltyEventType, LucideIconData> = {
  earn: LucideArrowUpCircle.icon,
  redeem: LucideArrowDownCircle.icon,
  adjust: LucideSparkles.icon,
  expire: LucideClock.icon,
};

const LOYALTY_VARIANT: Record<LoyaltyEventType, TimelineDotVariant> = {
  earn: 'success',
  redeem: 'warning',
  adjust: 'info',
  expire: 'neutral',
};

export type ActivitySource = 'order' | 'review' | 'ticket' | 'inquiry' | 'loyalty';

interface ActivityData {
  source: ActivitySource;
  link: string[];
}

@Component({
  selector: 'app-customer-detail',
  imports: [
    AvatarComponent,
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
    TimelineComponent,
  ],
  template: `
    @if (customer(); as c) {
      <div class="space-y-6">
        <app-breadcrumb [items]="breadcrumb()" />

        <app-card padding="lg">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div class="flex items-start gap-4 min-w-0">
              <app-avatar [name]="c.fullName" size="xl" />
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <h1 class="text-2xl font-bold text-slate-900">{{ c.fullName }}</h1>
                  <app-tag [variant]="tierBadge(c.tier)">
                    <app-icon [icon]="awardIcon" size="xs" />
                    {{ tierLabel(c.tier) }}
                  </app-tag>
                </div>
                <p class="mt-0.5 text-sm text-slate-500 font-mono">{{ c.code }}</p>
                <div class="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                  <span>{{ c.email }}</span>
                  <span class="text-slate-300">·</span>
                  <span>{{ c.phone }}</span>
                </div>
                <div class="mt-2 flex flex-wrap items-center gap-2">
                  @if (c.status === 'active') {
                    <app-badge variant="success" [dot]="true">Hoạt động</app-badge>
                  } @else {
                    <app-badge variant="neutral" [dot]="true">Ngừng hoạt động</app-badge>
                  }
                  <span class="text-xs text-slate-500">
                    Tham gia: {{ c.createdAt | date: 'dd/MM/yyyy' }}
                  </span>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-3 gap-3 sm:gap-4 shrink-0">
              <div class="rounded-lg bg-slate-50 p-3 text-center">
                <p class="text-xs uppercase text-slate-500">Đơn</p>
                <p class="mt-0.5 text-xl font-bold text-slate-900">{{ c.totalOrders }}</p>
              </div>
              <div class="rounded-lg bg-slate-50 p-3 text-center">
                <p class="text-xs uppercase text-slate-500">Chi tiêu</p>
                <p class="mt-0.5 text-xl font-bold text-slate-900">
                  {{ formatPrice(c.totalSpent) }}
                </p>
                <p class="text-[10px] text-slate-400">VNĐ</p>
              </div>
              <div class="rounded-lg bg-amber-50 p-3 text-center">
                <p class="text-xs uppercase text-amber-700">Điểm</p>
                <p class="mt-0.5 text-xl font-bold text-amber-900">{{ c.availablePoints }}</p>
                <p class="text-[10px] text-amber-600">khả dụng</p>
              </div>
            </div>
          </div>
        </app-card>

        <app-tabs [(activeTab)]="activeTab">
          <ng-template appTabPanel="info" appTabPanelLabel="Thông tin">
            <div class="grid gap-4 lg:grid-cols-3">
              <app-card padding="lg" class="lg:col-span-2">
                <h2 class="text-sm font-semibold text-slate-700 mb-3">Thông tin liên hệ</h2>
                <app-description-list [items]="infoItems()" [columns]="2" />
              </app-card>

              <app-card padding="lg">
                <h2 class="text-sm font-semibold text-slate-700 mb-3">Ghi chú</h2>
                @if (c.notes) {
                  <p class="text-sm text-slate-700 leading-relaxed">{{ c.notes }}</p>
                } @else {
                  <p class="text-sm text-slate-400">Chưa có ghi chú.</p>
                }
              </app-card>
            </div>
          </ng-template>

          <ng-template
            appTabPanel="addresses"
            [appTabPanelLabel]="'Địa chỉ (' + c.addresses.length + ')'"
          >
            @if (c.addresses.length === 0) {
              <app-card padding="lg">
                <app-empty-state
                  title="Chưa có địa chỉ"
                  description="Khách hàng chưa lưu địa chỉ giao hàng nào."
                />
              </app-card>
            } @else {
              <div class="grid gap-3 sm:grid-cols-2">
                @for (addr of c.addresses; track addr.id) {
                  <app-card padding="md">
                    <div class="flex items-start justify-between gap-2">
                      <div class="min-w-0">
                        <div class="flex items-center gap-2">
                          <h3 class="font-semibold text-slate-900">{{ addr.label }}</h3>
                          @if (addr.isDefault) {
                            <app-badge variant="primary" size="sm">Mặc định</app-badge>
                          }
                        </div>
                        <p class="mt-2 text-sm text-slate-700">{{ addr.recipientName }}</p>
                        <p class="text-xs text-slate-500">{{ addr.phone }}</p>
                        <p class="mt-2 text-sm text-slate-600">
                          {{ addr.street }}, {{ addr.ward }}, {{ addr.district }}, {{ addr.city }}
                        </p>
                      </div>
                    </div>
                  </app-card>
                }
              </div>
              <p class="mt-3 text-xs text-slate-400">
                Địa chỉ do khách hàng tự quản lý. Admin chỉ xem.
              </p>
            }
          </ng-template>

          <ng-template
            appTabPanel="orders"
            [appTabPanelLabel]="'Đơn hàng (' + c.orders.length + ')'"
          >
            @if (c.orders.length === 0) {
              <app-card padding="lg">
                <app-empty-state
                  title="Chưa có đơn hàng"
                  description="Khách hàng này chưa từng đặt đơn."
                />
              </app-card>
            } @else {
              <div class="space-y-3">
                @for (order of c.orders; track order.id) {
                  <app-card padding="none">
                    <button
                      type="button"
                      class="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-slate-50"
                      (click)="toggleOrder(order.id)"
                    >
                      <div class="flex items-center gap-3 min-w-0">
                        <span [class]="statusIconWrapClass(order.status)">
                          <app-icon [icon]="statusIcon(order.status)" size="sm" />
                        </span>
                        <div class="min-w-0">
                          <div class="flex items-center gap-2">
                            <p class="font-semibold text-slate-900 font-mono">{{ order.code }}</p>
                            <app-badge [variant]="statusBadge(order.status)" size="sm">
                              {{ statusLabel(order.status) }}
                            </app-badge>
                          </div>
                          <p class="text-xs text-slate-500">
                            {{ order.placedAt | date: 'dd/MM/yyyy HH:mm' }}
                            · {{ order.channel === 'pos' ? 'POS' : 'Online' }} ·
                            {{ order.lines.length }} mặt hàng
                          </p>
                        </div>
                      </div>
                      <div class="flex items-center gap-3 shrink-0">
                        <p class="text-sm font-bold text-slate-900">
                          {{ formatPrice(order.total) }} ₫
                        </p>
                        <app-icon
                          [icon]="isOrderOpen(order.id) ? chevronUpIcon : chevronDownIcon"
                          size="sm"
                        />
                      </div>
                    </button>

                    @if (isOrderOpen(order.id)) {
                      <div class="border-t border-slate-100 bg-slate-50/50 p-4 space-y-3">
                        <div class="overflow-x-auto rounded-md bg-white ring-1 ring-slate-200">
                          <table class="w-full text-sm">
                            <thead class="text-xs uppercase tracking-wide text-slate-500">
                              <tr>
                                <th class="px-3 py-2 text-left font-medium">Sản phẩm</th>
                                <th class="px-3 py-2 text-left font-medium">Variant</th>
                                <th class="px-3 py-2 text-right font-medium">Đơn giá</th>
                                <th class="px-3 py-2 text-right font-medium">SL</th>
                                <th class="px-3 py-2 text-right font-medium">Thành tiền</th>
                              </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100">
                              @for (line of order.lines; track line.sku) {
                                <tr>
                                  <td class="px-3 py-2">
                                    <a
                                      [routerLink]="['/catalog/products', line.productId]"
                                      class="text-slate-900 hover:text-indigo-600"
                                    >
                                      {{ line.productName }}
                                    </a>
                                    <p class="text-xs text-slate-400 font-mono">{{ line.sku }}</p>
                                  </td>
                                  <td class="px-3 py-2 text-slate-600">
                                    {{ line.variantLabel || '—' }}
                                  </td>
                                  <td class="px-3 py-2 text-right text-slate-700">
                                    {{ formatPrice(line.unitPrice) }} ₫
                                  </td>
                                  <td class="px-3 py-2 text-right font-medium text-slate-900">
                                    {{ line.quantity }}
                                  </td>
                                  <td class="px-3 py-2 text-right font-medium text-slate-900">
                                    {{ formatPrice(line.unitPrice * line.quantity) }} ₫
                                  </td>
                                </tr>
                              }
                            </tbody>
                          </table>
                        </div>

                        <div class="grid gap-4 sm:grid-cols-2">
                          <div class="text-sm space-y-1">
                            <p class="text-xs uppercase text-slate-500">Giao tới</p>
                            <p class="text-slate-700">{{ order.shippingAddress }}</p>
                            <p class="mt-2 text-xs uppercase text-slate-500">Phương thức</p>
                            <p class="text-slate-700">{{ order.paymentMethod }}</p>
                          </div>

                          <dl class="space-y-1 text-sm">
                            <div class="flex justify-between">
                              <dt class="text-slate-500">Tạm tính</dt>
                              <dd class="text-slate-700">{{ formatPrice(order.subtotal) }} ₫</dd>
                            </div>
                            @if (order.discount > 0) {
                              <div class="flex justify-between text-green-700">
                                <dt>Giảm giá</dt>
                                <dd>− {{ formatPrice(order.discount) }} ₫</dd>
                              </div>
                            }
                            <div class="flex justify-between">
                              <dt class="text-slate-500">Phí vận chuyển</dt>
                              <dd class="text-slate-700">{{ formatPrice(order.shippingFee) }} ₫</dd>
                            </div>
                            <div
                              class="flex justify-between border-t border-slate-200 pt-1 text-base font-bold"
                            >
                              <dt class="text-slate-700">Tổng cộng</dt>
                              <dd class="text-slate-900">{{ formatPrice(order.total) }} ₫</dd>
                            </div>
                          </dl>
                        </div>
                      </div>
                    }
                  </app-card>
                }
              </div>
            }
          </ng-template>

          <ng-template appTabPanel="loyalty" appTabPanelLabel="Loyalty">
            <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
              <app-card padding="lg">
                <h2 class="text-sm font-semibold text-slate-700 mb-3">Hạng & quyền lợi</h2>
                <div
                  class="rounded-lg bg-linear-to-br from-amber-50 to-orange-50 p-4 ring-1 ring-amber-200"
                >
                  <div class="flex items-center gap-3">
                    <span
                      class="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500 text-white shadow"
                    >
                      <app-icon [icon]="awardIcon" size="lg" />
                    </span>
                    <div>
                      <p class="text-xs uppercase text-amber-700">Hạng hiện tại</p>
                      <p class="text-2xl font-bold text-amber-900">{{ tierLabel(c.tier) }}</p>
                    </div>
                  </div>
                  <ul class="mt-4 space-y-2">
                    @for (benefit of tierBenefits(c.tier); track benefit) {
                      <li class="flex items-start gap-2 text-sm text-amber-900">
                        <app-icon [icon]="checkIcon" size="xs" />
                        <span>{{ benefit }}</span>
                      </li>
                    }
                  </ul>
                </div>

                <dl class="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div class="rounded-md bg-slate-50 p-3">
                    <dt class="text-xs uppercase text-slate-500">Điểm tích luỹ</dt>
                    <dd class="mt-0.5 text-lg font-bold text-slate-900">{{ c.lifetimePoints }}</dd>
                  </div>
                  <div class="rounded-md bg-slate-50 p-3">
                    <dt class="text-xs uppercase text-slate-500">Điểm khả dụng</dt>
                    <dd class="mt-0.5 text-lg font-bold text-slate-900">
                      {{ c.availablePoints }}
                    </dd>
                  </div>
                </dl>
              </app-card>

              <app-card padding="lg">
                <h2 class="text-sm font-semibold text-slate-700 mb-3">Lịch sử điểm</h2>
                @if (loyaltyEntries().length === 0) {
                  <app-empty-state
                    title="Chưa có hoạt động"
                    description="Khách hàng chưa có giao dịch tích/đổi điểm nào."
                  />
                } @else {
                  <app-timeline [entries]="loyaltyEntries()">
                    <ng-template let-entry="entry">
                      <div class="flex items-center gap-3 text-sm">
                        <span [class]="pointsClass(entry.data)">
                          {{ entry.data.points > 0 ? '+' : '' }}{{ entry.data.points }} điểm
                        </span>
                        @if (entry.data.orderCode) {
                          <span class="text-xs text-slate-400 font-mono">{{
                            entry.data.orderCode
                          }}</span>
                        }
                      </div>
                    </ng-template>
                  </app-timeline>
                }
              </app-card>
            </div>
          </ng-template>

          <ng-template
            appTabPanel="activity"
            [appTabPanelLabel]="'Hoạt động (' + activityEntries().length + ')'"
          >
            <app-card padding="lg">
              <div class="mb-4 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  [class]="sourceBtn(activitySource() === '')"
                  (click)="activitySource.set('')"
                >
                  Tất cả
                </button>
                <button
                  type="button"
                  [class]="sourceBtn(activitySource() === 'order')"
                  (click)="activitySource.set('order')"
                >
                  Đơn hàng
                </button>
                <button
                  type="button"
                  [class]="sourceBtn(activitySource() === 'review')"
                  (click)="activitySource.set('review')"
                >
                  Đánh giá
                </button>
                <button
                  type="button"
                  [class]="sourceBtn(activitySource() === 'ticket')"
                  (click)="activitySource.set('ticket')"
                >
                  Yêu cầu hỗ trợ
                </button>
                <button
                  type="button"
                  [class]="sourceBtn(activitySource() === 'inquiry')"
                  (click)="activitySource.set('inquiry')"
                >
                  Liên hệ
                </button>
                <button
                  type="button"
                  [class]="sourceBtn(activitySource() === 'loyalty')"
                  (click)="activitySource.set('loyalty')"
                >
                  Loyalty
                </button>
              </div>

              @if (activityEntries().length === 0) {
                <app-empty-state
                  title="Không có hoạt động"
                  description="Khách hàng chưa có hoạt động khớp bộ lọc."
                />
              } @else {
                <app-timeline [entries]="activityEntries()">
                  <ng-template let-entry="entry">
                    @if (entry.data?.link) {
                      <a
                        [routerLink]="entry.data.link"
                        class="text-xs text-indigo-600 hover:text-indigo-700"
                      >
                        Xem chi tiết →
                      </a>
                    }
                  </ng-template>
                </app-timeline>
              }
            </app-card>
          </ng-template>
        </app-tabs>
      </div>
    } @else {
      <div class="rounded-lg border border-slate-200 bg-white p-8 text-center">
        <h2 class="text-lg font-semibold text-slate-900">Không tìm thấy khách hàng</h2>
        <p class="mt-1 text-sm text-slate-500">Khách hàng có thể đã bị xoá hoặc ID không hợp lệ.</p>
        <a routerLink="/customers" class="mt-4 inline-block">
          <app-button variant="primary">Quay lại danh sách</app-button>
        </a>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerDetailComponent {
  private readonly reviewStore = inject(ReviewStore);
  private readonly ticketStore = inject(TicketStore);
  private readonly inquiryStore = inject(InquiryStore);

  readonly id = input.required<string>();

  protected readonly activeTab = signal('info');
  protected readonly openOrderIds = signal<Set<string>>(new Set<string>());
  protected readonly activitySource = signal<'' | ActivitySource>('');

  protected readonly awardIcon = LucideAward.icon;
  protected readonly checkIcon = LucideCheck.icon;
  protected readonly chevronDownIcon = LucideChevronDown.icon;
  protected readonly chevronUpIcon = LucideChevronUp.icon;
  protected readonly orderIcon = LucideShoppingBag.icon;
  protected readonly reviewIcon = LucideStar.icon;
  protected readonly ticketIcon = LucideMessageSquare.icon;

  protected readonly customer = computed(() => findCustomer(this.id()));

  protected readonly breadcrumb = computed(() => [
    { label: 'Bán hàng' },
    { label: 'Khách hàng', to: '/customers' },
    { label: this.customer()?.fullName ?? this.id() },
  ]);

  protected readonly infoItems = computed<DescriptionItem[]>(() => {
    const c = this.customer();
    if (!c) return [];
    return [
      { label: 'Mã khách hàng', value: c.code },
      { label: 'Email', value: c.email },
      { label: 'Số điện thoại', value: c.phone },
      { label: 'Giới tính', value: this.genderLabel(c.gender) },
      {
        label: 'Ngày sinh',
        value: c.birthDate ? new Date(c.birthDate).toLocaleDateString('vi-VN') : '—',
      },
      {
        label: 'Tham gia',
        value: new Date(c.createdAt).toLocaleDateString('vi-VN'),
      },
      {
        label: 'Đơn cuối',
        value: c.lastOrderAt ? new Date(c.lastOrderAt).toLocaleDateString('vi-VN') : 'Chưa có',
      },
      { label: 'Chi nhánh mặc định', value: c.defaultTenantId },
    ];
  });

  protected readonly loyaltyEntries = computed<TimelineEntry<ILoyaltyEvent>[]>(() => {
    const c = this.customer();
    if (!c) return [];
    return c.loyaltyEvents.map((e) => ({
      id: e.id,
      title: e.description,
      timestamp: e.occurredAt,
      icon: LOYALTY_ICON[e.type],
      variant: LOYALTY_VARIANT[e.type],
      data: e,
    }));
  });

  protected readonly activityEntries = computed<TimelineEntry<ActivityData>[]>(() => {
    const c = this.customer();
    if (!c) return [];
    const entries: TimelineEntry<ActivityData>[] = [];

    // Orders: 1 entry per order placed + status events
    c.orders.forEach((o) => {
      entries.push({
        id: `act-order-${o.id}`,
        title: `Đặt đơn ${o.code}`,
        description: `${o.lines.length} sản phẩm · ${o.total.toLocaleString('vi-VN')}₫ · ${
          o.channel === 'pos' ? 'POS' : 'Online'
        }`,
        timestamp: o.placedAt,
        icon: this.orderIcon,
        variant: 'info',
        data: { source: 'order', link: ['/orders', o.id] },
      });
      if (o.status === 'delivered' || o.status === 'cancelled' || o.status === 'refunded') {
        entries.push({
          id: `act-order-${o.id}-${o.status}`,
          title: `Đơn ${o.code} — ${STATUS_LABEL[o.status]}`,
          timestamp: o.placedAt,
          icon: STATUS_ICON[o.status],
          variant: STATUS_VARIANT[o.status],
          data: { source: 'order', link: ['/orders', o.id] },
        });
      }
    });

    // Reviews
    this.reviewStore.findByCustomer(c.id).forEach((r) => {
      entries.push({
        id: `act-review-${r.id}`,
        title: `Gửi đánh giá ${r.rating}★ — ${r.productName}`,
        description: r.title,
        timestamp: r.submittedAt,
        icon: this.reviewIcon,
        variant: 'warning',
        data: { source: 'review', link: ['/crm/reviews', r.id] },
      });
    });

    // Tickets
    this.ticketStore.findByCustomer(c.id).forEach((t) => {
      entries.push({
        id: `act-ticket-${t.id}`,
        title: `Tạo yêu cầu ${t.code} — ${t.subject}`,
        description: `${t.type} · ${t.status}`,
        timestamp: t.createdAt,
        icon: this.ticketIcon,
        variant: 'danger',
        data: { source: 'ticket', link: ['/crm/tickets', t.id] },
      });
    });

    // Inquiries linked through matchedCustomerId
    this.inquiryStore
      .inquiries()
      .filter((i) => i.matchedCustomerId === c.id)
      .forEach((i) => {
        entries.push({
          id: `act-inquiry-${i.id}`,
          title: `Gửi liên hệ ${i.code} — ${i.subject}`,
          description: i.message.slice(0, 80) + (i.message.length > 80 ? '...' : ''),
          timestamp: i.createdAt,
          icon: this.ticketIcon,
          variant: 'neutral',
          data: { source: 'inquiry', link: ['/crm/inquiries', i.id] },
        });
      });

    // Loyalty
    c.loyaltyEvents.forEach((e) => {
      entries.push({
        id: `act-loyalty-${e.id}`,
        title: e.description,
        timestamp: e.occurredAt,
        icon: LOYALTY_ICON[e.type],
        variant: LOYALTY_VARIANT[e.type],
        data: { source: 'loyalty', link: ['/customers', c.id] },
      });
    });

    // Filter by source if set, then sort descending by timestamp
    const filter = this.activitySource();
    const filtered = filter ? entries.filter((e) => e.data?.source === filter) : entries;
    return filtered.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
  });

  protected toggleOrder(orderId: string): void {
    this.openOrderIds.update((set) => {
      const next = new Set(set);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  }

  protected isOrderOpen(orderId: string): boolean {
    return this.openOrderIds().has(orderId);
  }

  protected statusLabel(s: CustomerOrderStatus): string {
    return STATUS_LABEL[s];
  }

  protected statusBadge(s: CustomerOrderStatus) {
    return STATUS_VARIANT[s];
  }

  protected statusIcon(s: CustomerOrderStatus): LucideIconData {
    return STATUS_ICON[s];
  }

  protected statusIconWrapClass(s: CustomerOrderStatus): string {
    const base = 'flex h-9 w-9 shrink-0 items-center justify-center rounded-full';
    const v = STATUS_VARIANT[s];
    const map: Record<typeof v, string> = {
      neutral: 'bg-slate-100 text-slate-600',
      info: 'bg-sky-50 text-sky-700',
      warning: 'bg-amber-50 text-amber-700',
      success: 'bg-green-50 text-green-700',
      danger: 'bg-red-50 text-red-700',
    };
    return `${base} ${map[v]}`;
  }

  protected tierLabel(t: LoyaltyTier): string {
    return TIER_META[t].label;
  }

  protected tierBadge(t: LoyaltyTier): 'neutral' | 'info' | 'warning' | 'success' {
    return TIER_META[t].badgeVariant;
  }

  protected tierBenefits(t: LoyaltyTier): string[] {
    return TIER_META[t].benefits;
  }

  protected pointsClass(event: ILoyaltyEvent): string {
    const base = 'text-sm font-semibold';
    if (event.points > 0) return `${base} text-green-700`;
    if (event.points < 0) return `${base} text-amber-700`;
    return `${base} text-slate-700`;
  }

  protected formatPrice(n: number): string {
    return PRICE_FORMATTER.format(n);
  }

  private genderLabel(g: Gender): string {
    const map: Record<Gender, string> = {
      male: 'Nam',
      female: 'Nữ',
      other: 'Khác',
    };
    return map[g];
  }

  protected sourceBtn(active: boolean): string {
    const base = 'rounded-full px-3 py-1 text-xs font-medium transition';
    return active
      ? `${base} bg-indigo-600 text-white`
      : `${base} bg-slate-100 text-slate-700 hover:bg-slate-200`;
  }
}
