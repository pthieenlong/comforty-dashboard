import { Dialog } from '@angular/cdk/dialog';
import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideBan,
  LucideCheck,
  LucideCheckCircle2,
  LucideCircleDollarSign,
  LucideClock,
  LucidePackage,
  LucideReceipt,
  LucideRotateCcw,
  LucideTruck,
  LucideUser,
  LucideX,
  type LucideIconData,
} from '@lucide/angular';
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
  TimelineComponent,
  type TimelineDotVariant,
  type TimelineEntry,
  ToastService,
} from '@/shared/ui';
import { MOCK_TENANTS } from '@/core/tenant/tenant.mock';
import { OrderStore } from './order.store';
import { PaymentStore } from './payment.store';
import {
  ORDER_STATUS_META,
  PAYMENT_METHOD_META,
  PAYMENT_STATUS_META,
  REFUND_REASON_META,
  type IOrder,
  type IOrderEvent,
  type OrderStatus,
} from './order.types';
import { openRefundDialog } from './refund-dialog.component';

const STATUS_ICON: Record<OrderStatus, LucideIconData> = {
  draft: LucideClock.icon,
  pending_payment: LucideCircleDollarSign.icon,
  confirmed: LucideCheck.icon,
  preparing: LucidePackage.icon,
  shipping: LucideTruck.icon,
  completed: LucideCheckCircle2.icon,
  partial_refunded: LucideRotateCcw.icon,
  refunded: LucideRotateCcw.icon,
  cancelled: LucideBan.icon,
};

const STATUS_TIMELINE_VARIANT: Record<OrderStatus, TimelineDotVariant> = {
  draft: 'neutral',
  pending_payment: 'warning',
  confirmed: 'info',
  preparing: 'info',
  shipping: 'info',
  completed: 'success',
  partial_refunded: 'warning',
  refunded: 'warning',
  cancelled: 'danger',
};

interface ActionDef {
  label: string;
  next: OrderStatus;
  variant: 'primary' | 'secondary' | 'danger';
  icon: LucideIconData;
  note: string;
}

const NEXT_ACTIONS: Partial<Record<OrderStatus, ActionDef[]>> = {
  draft: [
    {
      label: 'Xác nhận thanh toán',
      next: 'confirmed',
      variant: 'primary',
      icon: LucideCheck.icon,
      note: 'Xác nhận đơn',
    },
  ],
  pending_payment: [
    {
      label: 'Đã nhận thanh toán',
      next: 'confirmed',
      variant: 'primary',
      icon: LucideCheck.icon,
      note: 'Đã nhận thanh toán',
    },
  ],
  confirmed: [
    {
      label: 'Bắt đầu chuẩn bị',
      next: 'preparing',
      variant: 'primary',
      icon: LucidePackage.icon,
      note: 'Bắt đầu chuẩn bị hàng',
    },
  ],
  preparing: [
    {
      label: 'Giao vận chuyển',
      next: 'shipping',
      variant: 'primary',
      icon: LucideTruck.icon,
      note: 'Đã giao cho đơn vị vận chuyển',
    },
  ],
  shipping: [
    {
      label: 'Hoàn tất đơn',
      next: 'completed',
      variant: 'primary',
      icon: LucideCheckCircle2.icon,
      note: 'Khách đã nhận hàng',
    },
  ],
};

@Component({
  selector: 'app-order-detail',
  imports: [
    BadgeComponent,
    BreadcrumbComponent,
    ButtonComponent,
    CardComponent,
    CurrencyPipe,
    DatePipe,
    DescriptionListComponent,
    IconComponent,
    RouterLink,
    TabPanelDirective,
    TabsComponent,
    TimelineComponent,
  ],
  template: `
    @if (order(); as o) {
      <div class="space-y-6">
        <app-breadcrumb [items]="breadcrumb()" />

        <app-card padding="lg">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div class="flex items-start gap-4 min-w-0">
              <span [class]="statusIconWrap(o.status)">
                <app-icon [icon]="statusIcon(o.status)" size="lg" />
              </span>
              <div class="min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <h1 class="text-2xl font-bold text-slate-900 font-mono">{{ o.code }}</h1>
                  <app-badge [variant]="statusVariant(o.status)" [dot]="true">
                    {{ statusLabel(o.status) }}
                  </app-badge>
                  <app-badge variant="neutral">{{
                    o.channel === 'pos' ? 'POS' : 'Online'
                  }}</app-badge>
                </div>
                <p class="mt-1 text-sm text-slate-600">
                  {{ statusDescription(o.status) }}
                </p>
                <p class="mt-1 text-xs text-slate-500">
                  Đặt {{ o.placedAt | date: 'dd/MM/yyyy HH:mm' }} bởi {{ o.staffName }} ·
                  {{ tenantName(o.tenantId) }}
                </p>
              </div>
            </div>

            <div class="flex gap-2 shrink-0 flex-wrap justify-end">
              @for (action of nextActions(); track action.next) {
                <app-button [variant]="action.variant" (click)="onTransition(action)">
                  <app-icon [icon]="action.icon" size="md" />
                  {{ action.label }}
                </app-button>
              }
              @if (canRefund(o)) {
                <app-button variant="secondary" (click)="onRefund()">
                  <app-icon [icon]="refundIcon" size="md" />
                  Hoàn hàng
                </app-button>
              }
              @if (canCancel(o)) {
                <app-button variant="danger" (click)="onCancel()">
                  <app-icon [icon]="banIcon" size="md" />
                  Huỷ đơn
                </app-button>
              }
            </div>
          </div>
        </app-card>

        <div class="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <div class="space-y-4">
            <app-card padding="none">
              <div class="border-b border-slate-100 px-5 pt-3">
                <app-tabs [(activeTab)]="activeTab">
                  <ng-template appTabPanel="items" appTabPanelLabel="Sản phẩm">
                    <div class="overflow-x-auto">
                      <table class="w-full text-sm">
                        <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                          <tr>
                            <th class="px-4 py-2 text-left font-medium">Sản phẩm</th>
                            <th class="px-4 py-2 text-left font-medium">SKU</th>
                            <th class="px-4 py-2 text-right font-medium">Đơn giá</th>
                            <th class="px-4 py-2 text-right font-medium">SL</th>
                            <th class="px-4 py-2 text-right font-medium">Hoàn</th>
                            <th class="px-4 py-2 text-right font-medium">Thành tiền</th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                          @for (item of o.items; track item.id) {
                            <tr>
                              <td class="px-4 py-2 text-slate-700">
                                <a
                                  [routerLink]="['/catalog/products', item.productId]"
                                  class="hover:text-indigo-600"
                                >
                                  {{ item.productName }}
                                </a>
                                @if (item.variantLabel) {
                                  <p class="text-xs text-slate-400">{{ item.variantLabel }}</p>
                                }
                              </td>
                              <td class="px-4 py-2 font-mono text-xs text-slate-600">
                                {{ item.variantSku }}
                              </td>
                              <td class="px-4 py-2 text-right text-slate-700">
                                {{ item.unitPrice | currency: 'VND' : 'symbol-narrow' : '1.0-0' }}
                              </td>
                              <td class="px-4 py-2 text-right text-slate-700">
                                {{ item.quantity }}
                              </td>
                              <td class="px-4 py-2 text-right">
                                @if (item.refundedQuantity > 0) {
                                  <span class="text-xs text-amber-600">
                                    -{{ item.refundedQuantity }}
                                  </span>
                                } @else {
                                  <span class="text-xs text-slate-400">—</span>
                                }
                              </td>
                              <td class="px-4 py-2 text-right font-medium text-slate-900">
                                {{
                                  item.unitPrice * item.quantity - item.discount
                                    | currency: 'VND' : 'symbol-narrow' : '1.0-0'
                                }}
                              </td>
                            </tr>
                          }
                        </tbody>
                        <tfoot class="bg-slate-50 text-sm">
                          <tr>
                            <td colspan="5" class="px-4 py-2 text-right text-slate-600">
                              Tạm tính
                            </td>
                            <td class="px-4 py-2 text-right text-slate-900">
                              {{ o.subtotal | currency: 'VND' : 'symbol-narrow' : '1.0-0' }}
                            </td>
                          </tr>
                          @if (o.discount > 0) {
                            <tr>
                              <td colspan="5" class="px-4 py-1.5 text-right text-slate-600">
                                Giảm giá
                              </td>
                              <td class="px-4 py-1.5 text-right text-red-600">
                                -{{ o.discount | currency: 'VND' : 'symbol-narrow' : '1.0-0' }}
                              </td>
                            </tr>
                          }
                          @if (o.shippingFee > 0) {
                            <tr>
                              <td colspan="5" class="px-4 py-1.5 text-right text-slate-600">
                                Phí vận chuyển
                              </td>
                              <td class="px-4 py-1.5 text-right text-slate-900">
                                {{ o.shippingFee | currency: 'VND' : 'symbol-narrow' : '1.0-0' }}
                              </td>
                            </tr>
                          }
                          <tr class="border-t border-slate-200">
                            <td
                              colspan="5"
                              class="px-4 py-2 text-right font-semibold text-slate-700"
                            >
                              Tổng
                            </td>
                            <td class="px-4 py-2 text-right text-base font-bold text-slate-900">
                              {{ o.total | currency: 'VND' : 'symbol-narrow' : '1.0-0' }}
                            </td>
                          </tr>
                          @if (o.refundedAmount > 0) {
                            <tr>
                              <td colspan="5" class="px-4 py-1.5 text-right text-amber-700">
                                Đã hoàn
                              </td>
                              <td class="px-4 py-1.5 text-right text-amber-700">
                                -{{
                                  o.refundedAmount | currency: 'VND' : 'symbol-narrow' : '1.0-0'
                                }}
                              </td>
                            </tr>
                          }
                        </tfoot>
                      </table>
                    </div>
                  </ng-template>

                  <ng-template appTabPanel="timeline" appTabPanelLabel="Tiến trình">
                    <div class="px-5 py-3">
                      <app-timeline [entries]="timelineEntries()">
                        <ng-template let-entry="entry">
                          <p class="text-xs text-slate-500">{{ entry.data.actor }}</p>
                        </ng-template>
                      </app-timeline>
                    </div>
                  </ng-template>

                  <ng-template appTabPanel="refunds" appTabPanelLabel="Hoàn hàng">
                    @if (refunds().length === 0) {
                      <div class="px-5 py-8 text-center text-sm text-slate-500">
                        Chưa có yêu cầu hoàn hàng nào.
                      </div>
                    } @else {
                      <ul class="divide-y divide-slate-100">
                        @for (rf of refunds(); track rf.id) {
                          <li class="px-5 py-3">
                            <div class="flex items-center justify-between gap-2">
                              <div>
                                <p class="font-mono text-sm font-medium text-slate-900">
                                  {{ rf.code }}
                                </p>
                                <p class="text-xs text-slate-500">
                                  {{ rf.processedAt | date: 'dd/MM/yyyy HH:mm' }} ·
                                  {{ rf.processedBy }} · {{ reasonLabel(rf.reason) }}
                                </p>
                              </div>
                              <p class="text-sm font-semibold text-amber-700">
                                {{ rf.amount | currency: 'VND' : 'symbol-narrow' : '1.0-0' }}
                              </p>
                            </div>
                            <ul class="mt-2 space-y-1 text-xs text-slate-600">
                              @for (line of rf.lines; track line.orderItemId) {
                                <li>
                                  · {{ itemName(o, line.orderItemId) }} ×
                                  <strong>{{ line.quantity }}</strong>
                                </li>
                              }
                            </ul>
                          </li>
                        }
                      </ul>
                    }
                  </ng-template>
                </app-tabs>
              </div>
            </app-card>
          </div>

          <div class="space-y-4">
            <app-card padding="lg">
              <div class="flex items-center gap-2 mb-3">
                <app-icon [icon]="userIcon" size="sm" />
                <h2 class="text-sm font-semibold text-slate-700">Khách hàng</h2>
              </div>
              @if (o.customerId) {
                <a
                  [routerLink]="['/customers', o.customerId]"
                  class="text-sm font-medium text-slate-900 hover:text-indigo-600"
                >
                  {{ o.customerName }}
                </a>
                <p class="text-xs text-slate-500">{{ o.customerPhone }}</p>
              } @else {
                <p class="text-sm text-slate-500">Khách lẻ (walk-in)</p>
              }

              @if (o.shipping; as ship) {
                <div class="mt-4 border-t border-slate-100 pt-3">
                  <h3 class="text-xs uppercase text-slate-500 mb-1">Giao đến</h3>
                  <p class="text-sm text-slate-700">{{ ship.recipientName }}</p>
                  <p class="text-xs text-slate-500">{{ ship.phone }}</p>
                  <p class="mt-1 text-sm text-slate-700">
                    {{ ship.address }}
                    @if (ship.ward) {
                      , {{ ship.ward }}
                    }
                    @if (ship.district) {
                      , {{ ship.district }}
                    }
                    @if (ship.city) {
                      , {{ ship.city }}
                    }
                  </p>
                  @if (ship.carrier) {
                    <p class="mt-1 text-xs text-slate-500">
                      Vận chuyển: <strong>{{ ship.carrier }}</strong>
                      @if (ship.trackingNumber) {
                        · {{ ship.trackingNumber }}
                      }
                    </p>
                  }
                </div>
              }
            </app-card>

            <app-card padding="lg">
              <div class="flex items-center gap-2 mb-3">
                <app-icon [icon]="receiptIcon" size="sm" />
                <h2 class="text-sm font-semibold text-slate-700">Thanh toán</h2>
              </div>
              <app-description-list [items]="paymentItems()" [columns]="1" />
            </app-card>
          </div>
        </div>
      </div>
    } @else {
      <div class="rounded-lg border border-slate-200 bg-white p-8 text-center">
        <h2 class="text-lg font-semibold text-slate-900">Không tìm thấy đơn hàng</h2>
        <a routerLink="/orders" class="mt-4 inline-block">
          <app-button variant="primary">Quay lại danh sách</app-button>
        </a>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderDetailComponent {
  private readonly orderStore = inject(OrderStore);
  private readonly paymentStore = inject(PaymentStore);
  private readonly toast = inject(ToastService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly dialog = inject(Dialog);

  readonly id = input.required<string>();
  readonly action = input<string | undefined>(undefined);

  constructor() {
    effect(() => {
      const o = this.order();
      if (this.action() === 'refund' && o && this.canRefund(o)) {
        // Defer one tick to avoid running during the initial CD pass.
        queueMicrotask(() => this.onRefund());
      }
    });
  }

  protected readonly userIcon = LucideUser.icon;
  protected readonly receiptIcon = LucideReceipt.icon;
  protected readonly refundIcon = LucideRotateCcw.icon;
  protected readonly banIcon = LucideX.icon;

  protected readonly activeTab = signal<string>('items');

  protected readonly order = computed(() => this.orderStore.findById(this.id()));

  protected readonly refunds = computed(() => this.orderStore.findRefundsByOrder(this.id()));

  protected readonly payments = computed(() => this.paymentStore.findByOrder(this.id()));

  protected readonly breadcrumb = computed(() => [
    { label: 'Trang chủ', to: '/dashboard' },
    { label: 'Đơn hàng', to: '/orders' },
    { label: this.order()?.code ?? this.id() },
  ]);

  protected readonly nextActions = computed<ActionDef[]>(() => {
    const o = this.order();
    if (!o) return [];
    return NEXT_ACTIONS[o.status] ?? [];
  });

  protected readonly timelineEntries = computed<TimelineEntry<IOrderEvent>[]>(() => {
    const o = this.order();
    if (!o) return [];
    return [...o.events]
      .sort((a, b) => (a.occurredAt < b.occurredAt ? -1 : 1))
      .map((e) => ({
        id: e.id,
        title: e.note || ORDER_STATUS_META[e.status].label,
        timestamp: e.occurredAt,
        icon: STATUS_ICON[e.status],
        variant: STATUS_TIMELINE_VARIANT[e.status],
        data: e,
      }));
  });

  protected readonly paymentItems = computed<DescriptionItem[]>(() => {
    const list = this.payments();
    if (list.length === 0) return [{ label: 'Trạng thái', value: 'Chưa có giao dịch' }];
    return list.flatMap<DescriptionItem>((p) => [
      { label: 'Mã giao dịch', value: p.code },
      { label: 'Phương thức', value: PAYMENT_METHOD_META[p.method].label },
      { label: 'Trạng thái', value: PAYMENT_STATUS_META[p.status].label },
      {
        label: 'Thanh toán lúc',
        value: p.paidAt ? new Date(p.paidAt).toLocaleString('vi-VN') : '—',
      },
      { label: 'Tham chiếu', value: p.transactionRef ?? '—' },
    ]);
  });

  protected statusLabel(s: OrderStatus): string {
    return ORDER_STATUS_META[s].label;
  }

  protected statusVariant(s: OrderStatus) {
    return ORDER_STATUS_META[s].badgeVariant;
  }

  protected statusDescription(s: OrderStatus): string {
    return ORDER_STATUS_META[s].description;
  }

  protected statusIcon(s: OrderStatus): LucideIconData {
    return STATUS_ICON[s];
  }

  protected statusIconWrap(s: OrderStatus): string {
    const base = 'flex h-12 w-12 shrink-0 items-center justify-center rounded-lg';
    const map: Record<OrderStatus, string> = {
      draft: 'bg-slate-100 text-slate-600',
      pending_payment: 'bg-amber-50 text-amber-700',
      confirmed: 'bg-sky-50 text-sky-700',
      preparing: 'bg-sky-50 text-sky-700',
      shipping: 'bg-sky-50 text-sky-700',
      completed: 'bg-green-50 text-green-700',
      partial_refunded: 'bg-amber-50 text-amber-700',
      refunded: 'bg-amber-50 text-amber-700',
      cancelled: 'bg-red-50 text-red-700',
    };
    return `${base} ${map[s]}`;
  }

  protected tenantName(id: string): string {
    return MOCK_TENANTS.find((t) => t.id === id)?.name ?? id;
  }

  protected reasonLabel(r: keyof typeof REFUND_REASON_META): string {
    return REFUND_REASON_META[r].label;
  }

  protected itemName(o: IOrder, itemId: string): string {
    const item = o.items.find((it) => it.id === itemId);
    if (!item) return itemId;
    return item.variantLabel ? `${item.productName} (${item.variantLabel})` : item.productName;
  }

  protected canRefund(o: IOrder): boolean {
    if (o.status !== 'completed' && o.status !== 'partial_refunded') return false;
    return o.items.some((it) => it.quantity - it.refundedQuantity > 0);
  }

  protected canCancel(o: IOrder): boolean {
    return ['draft', 'pending_payment', 'confirmed', 'preparing'].includes(o.status);
  }

  protected async onTransition(action: ActionDef): Promise<void> {
    const id = this.id();
    const result = await this.orderStore.transition(id, action.next, 'Bạn', action.note);
    if (result) {
      this.toast.success(`Đã chuyển sang "${ORDER_STATUS_META[action.next].label}"`);
    }
  }

  protected async onCancel(): Promise<void> {
    const ok = await this.confirmDialog.confirm({
      title: 'Huỷ đơn hàng',
      message: 'Đơn sẽ bị huỷ và không thể tiếp tục. Bạn có chắc chắn?',
      confirmText: 'Huỷ đơn',
      variant: 'danger',
    });
    if (!ok) return;
    await this.orderStore.transition(this.id(), 'cancelled', 'Bạn', 'Huỷ đơn');
    this.toast.success('Đã huỷ đơn hàng');
  }

  protected async onRefund(): Promise<void> {
    const o = this.order();
    if (!o) return;
    const result = await openRefundDialog(this.dialog, o);
    if (!result) return;

    const totalAmount = result.lines.reduce((sum, l) => sum + l.amount, 0);
    const refundId = `rf-local-${Date.now()}`;
    const refundCode = `RF${Date.now().toString(36).toUpperCase().slice(-6)}`;

    await this.orderStore.addRefund({
      id: refundId,
      code: refundCode,
      orderId: o.id,
      orderCode: o.code,
      processedAt: new Date().toISOString(),
      processedBy: 'Bạn',
      amount: totalAmount,
      method: 'bank_transfer',
      status: 'completed',
      reason: result.reason,
      note: result.note,
      lines: result.lines.map((l) => ({
        orderItemId: l.orderItemId,
        quantity: l.quantity,
        amount: l.amount,
        reason: result.reason,
        note: result.note,
      })),
    });

    this.toast.success('Đã ghi nhận yêu cầu hoàn hàng');
    this.activeTab.set('refunds');
  }
}
