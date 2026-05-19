import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideArrowRight,
  LucideBanknote,
  LucideCreditCard,
  LucideReceipt,
  LucideSmartphone,
  type LucideIconData,
} from '@lucide/angular';
import {
  BadgeComponent,
  BreadcrumbComponent,
  ButtonComponent,
  CardComponent,
  DescriptionListComponent,
  type DescriptionItem,
  IconComponent,
} from '@/shared/ui';
import { MOCK_TENANTS } from '@/core/tenant/tenant.mock';
import { OrderStore } from './order.store';
import { PaymentStore } from './payment.store';
import {
  PAYMENT_METHOD_META,
  PAYMENT_STATUS_META,
  type PaymentMethod,
  type PaymentStatus,
} from './order.types';

const METHOD_ICON: Record<PaymentMethod, LucideIconData> = {
  cash: LucideBanknote.icon,
  card: LucideCreditCard.icon,
  bank_transfer: LucideBanknote.icon,
  momo: LucideSmartphone.icon,
  vnpay: LucideSmartphone.icon,
  cod: LucideReceipt.icon,
};

@Component({
  selector: 'app-payment-detail',
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
  ],
  template: `
    @if (payment(); as p) {
      <div class="space-y-6">
        <app-breadcrumb [items]="breadcrumb()" />

        <app-card padding="lg">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div class="flex items-start gap-4 min-w-0">
              <span
                class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700"
              >
                <app-icon [icon]="methodIcon(p.method)" size="lg" />
              </span>
              <div class="min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <h1 class="text-2xl font-bold text-slate-900 font-mono">{{ p.code }}</h1>
                  <app-badge [variant]="statusVariant(p.status)" [dot]="true">
                    {{ statusLabel(p.status) }}
                  </app-badge>
                </div>
                <p class="mt-1 text-sm text-slate-600">
                  {{ methodLabel(p.method) }} · {{ tenantName(p.tenantId) }}
                </p>
                @if (p.paidAt) {
                  <p class="mt-1 text-xs text-slate-500">
                    Thanh toán lúc {{ p.paidAt | date: 'dd/MM/yyyy HH:mm' }}
                  </p>
                }
              </div>
            </div>

            <div class="text-right">
              <p class="text-xs uppercase text-slate-500">Số tiền</p>
              <p class="text-2xl font-bold text-slate-900">
                {{ p.amount | currency: 'VND' : 'symbol-narrow' : '1.0-0' }}
              </p>
            </div>
          </div>
        </app-card>

        <div class="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <app-card padding="lg">
            <h2 class="text-sm font-semibold text-slate-700 mb-3">Thông tin giao dịch</h2>
            <app-description-list [items]="infoItems()" [columns]="2" />
            @if (p.note) {
              <div class="mt-4 border-t border-slate-100 pt-3">
                <p class="text-xs uppercase text-slate-500">Ghi chú</p>
                <p class="mt-1 text-sm text-slate-700">{{ p.note }}</p>
              </div>
            }
          </app-card>

          <app-card padding="lg">
            <h2 class="text-sm font-semibold text-slate-700 mb-3">Đơn hàng liên quan</h2>
            @if (linkedOrder(); as o) {
              <a
                [routerLink]="['/orders', o.id]"
                class="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 hover:border-indigo-300 hover:bg-indigo-50"
              >
                <div class="min-w-0">
                  <p class="font-mono text-sm font-medium text-slate-900">{{ o.code }}</p>
                  <p class="text-xs text-slate-500">{{ o.customerName }}</p>
                </div>
                <app-icon [icon]="arrowIcon" size="sm" />
              </a>
              <dl class="mt-3 space-y-1.5 text-sm">
                <div class="flex justify-between">
                  <dt class="text-slate-500">Kênh</dt>
                  <dd class="text-slate-900">{{ o.channel === 'pos' ? 'POS' : 'Online' }}</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-slate-500">Tổng đơn</dt>
                  <dd class="text-slate-900">
                    {{ o.total | currency: 'VND' : 'symbol-narrow' : '1.0-0' }}
                  </dd>
                </div>
                @if (o.refundedAmount > 0) {
                  <div class="flex justify-between">
                    <dt class="text-slate-500">Đã hoàn</dt>
                    <dd class="text-amber-700">
                      -{{ o.refundedAmount | currency: 'VND' : 'symbol-narrow' : '1.0-0' }}
                    </dd>
                  </div>
                }
              </dl>
            } @else {
              <p class="text-sm text-slate-500">Không tìm thấy đơn hàng tham chiếu.</p>
            }
          </app-card>
        </div>
      </div>
    } @else {
      <div class="rounded-lg border border-slate-200 bg-white p-8 text-center">
        <h2 class="text-lg font-semibold text-slate-900">Không tìm thấy giao dịch</h2>
        <a routerLink="/payments" class="mt-4 inline-block">
          <app-button variant="primary">Quay lại danh sách</app-button>
        </a>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentDetailComponent {
  private readonly paymentStore = inject(PaymentStore);
  private readonly orderStore = inject(OrderStore);

  readonly id = input.required<string>();

  protected readonly arrowIcon = LucideArrowRight.icon;

  protected readonly payment = computed(() => this.paymentStore.findById(this.id()));

  protected readonly linkedOrder = computed(() => {
    const p = this.payment();
    if (!p) return undefined;
    return this.orderStore.findById(p.orderId);
  });

  protected readonly breadcrumb = computed(() => [
    { label: 'Trang chủ', to: '/dashboard' },
    { label: 'Thanh toán', to: '/payments' },
    { label: this.payment()?.code ?? this.id() },
  ]);

  protected readonly infoItems = computed<DescriptionItem[]>(() => {
    const p = this.payment();
    if (!p) return [];
    return [
      { label: 'Mã giao dịch', value: p.code },
      { label: 'Phương thức', value: PAYMENT_METHOD_META[p.method].label },
      { label: 'Trạng thái', value: PAYMENT_STATUS_META[p.status].label },
      {
        label: 'Thanh toán lúc',
        value: p.paidAt ? new Date(p.paidAt).toLocaleString('vi-VN') : '—',
      },
      { label: 'Tham chiếu', value: p.transactionRef ?? '—' },
      { label: 'Chi nhánh', value: this.tenantName(p.tenantId) },
    ];
  });

  protected methodIcon(m: PaymentMethod): LucideIconData {
    return METHOD_ICON[m];
  }

  protected methodLabel(m: PaymentMethod): string {
    return PAYMENT_METHOD_META[m].label;
  }

  protected statusLabel(s: PaymentStatus): string {
    return PAYMENT_STATUS_META[s].label;
  }

  protected statusVariant(s: PaymentStatus) {
    return PAYMENT_STATUS_META[s].badgeVariant;
  }

  protected tenantName(id: string): string {
    return MOCK_TENANTS.find((t) => t.id === id)?.name ?? id;
  }
}
