import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideMinus, LucidePlus, LucideTrash2, LucideUserPlus } from '@lucide/angular';
import {
  BadgeComponent,
  BreadcrumbComponent,
  ButtonComponent,
  CardComponent,
  CheckboxComponent,
  ComboboxComponent,
  type ComboboxOption,
  FormFieldComponent,
  IconComponent,
  PriceInputComponent,
  SelectComponent,
  type SelectOption,
  StepperComponent,
  StepperStepDirective,
  TextareaComponent,
  ToastService,
} from '@/shared/ui';
import { AuthStore } from '@/core/auth/auth.store';
import { CUSTOMERS } from '@/features/customer/customer.mock';
import { PRODUCTS } from '@/features/product/product.mock';
import { TenantStore } from '@/core/tenant/tenant.store';
import {
  PAYMENT_METHOD_META,
  type IOrder,
  type IOrderEvent,
  type IOrderItem,
  type IPayment,
  type PaymentMethod,
} from './order.types';
import { OrderStore } from './order.store';
import { PaymentStore } from './payment.store';

interface CartLine {
  productId: string;
  productName: string;
  variantId: string;
  variantSku: string;
  variantLabel: string;
  unitPrice: number;
  quantity: number;
}

const CUSTOMER_OPTIONS: ComboboxOption<string>[] = CUSTOMERS.map((c) => ({
  value: c.id,
  label: c.fullName,
  description: `${c.phone} · ${c.email}`,
}));

const VARIANT_OPTIONS: ComboboxOption<string>[] = PRODUCTS.flatMap((p) =>
  p.variants.map((v) => ({
    value: v.id,
    label: p.name,
    description: `${Object.values(v.attributes).join(' / ') || 'default'} · ${v.sku} · ${new Intl.NumberFormat('vi-VN').format(v.price)}₫`,
  })),
);

const PAYMENT_METHOD_OPTIONS: SelectOption<PaymentMethod>[] = (
  ['cash', 'card', 'bank_transfer', 'momo', 'vnpay'] as PaymentMethod[]
).map((m) => ({ value: m, label: PAYMENT_METHOD_META[m].label }));

@Component({
  selector: 'app-order-pos-form',
  imports: [
    BadgeComponent,
    BreadcrumbComponent,
    ButtonComponent,
    CardComponent,
    CheckboxComponent,
    ComboboxComponent,
    CurrencyPipe,
    FormFieldComponent,
    FormsModule,
    IconComponent,
    PriceInputComponent,
    SelectComponent,
    StepperComponent,
    StepperStepDirective,
    TextareaComponent,
  ],
  template: `
    <div class="space-y-6">
      <div>
        <app-breadcrumb [items]="breadcrumb" />
        <h1 class="mt-2 text-2xl font-bold text-slate-900">Tạo đơn POS</h1>
        <p class="mt-1 text-sm text-slate-500">
          Bán tại quầy: chọn khách hàng (hoặc khách lẻ), thêm sản phẩm, thanh toán và xuất đơn.
          {{ tenantName() }}.
        </p>
      </div>

      <app-card padding="lg">
        <app-stepper [(activeKey)]="activeStep" mode="strict">
          <!-- STEP 1: CUSTOMER -->
          <ng-template
            appStepperStep="customer"
            appStepperStepLabel="Khách hàng"
            appStepperStepDescription="Chọn hoặc bỏ qua"
            [appStepperStepValid]="customerStepValid()"
          >
            <div class="space-y-4">
              <app-checkbox
                id="pos-walkin"
                [ngModel]="isWalkIn()"
                (ngModelChange)="onWalkInChange($event)"
              >
                Khách lẻ (walk-in)
              </app-checkbox>

              @if (!isWalkIn()) {
                <app-form-field for="pos-customer" label="Tìm khách hàng" [required]="true">
                  <app-combobox
                    id="pos-customer"
                    [options]="customerOptions"
                    [ngModel]="customerId()"
                    (ngModelChange)="onCustomerChange($event)"
                    placeholder="Tìm theo tên / SĐT / email..."
                  />
                </app-form-field>

                @if (selectedCustomer(); as c) {
                  <div class="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm">
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="font-medium text-slate-900">{{ c.fullName }}</p>
                        <p class="text-xs text-slate-500">{{ c.phone }} · {{ c.email }}</p>
                      </div>
                      <app-badge variant="info">{{ c.tier }}</app-badge>
                    </div>
                    @if (c.availablePoints > 0) {
                      <p class="mt-2 text-xs text-slate-500">
                        Điểm khả dụng: <strong>{{ c.availablePoints }}</strong>
                      </p>
                    }
                  </div>
                }
              }

              <div class="flex justify-end pt-2">
                <app-button [disabled]="!customerStepValid()" (click)="goTo('cart')">
                  Tiếp tục
                  <app-icon [icon]="nextIcon" size="sm" />
                </app-button>
              </div>
            </div>
          </ng-template>

          <!-- STEP 2: CART -->
          <ng-template
            appStepperStep="cart"
            appStepperStepLabel="Giỏ hàng"
            appStepperStepDescription="Thêm sản phẩm"
            [appStepperStepValid]="cartStepValid()"
          >
            <div class="space-y-4">
              <app-form-field for="pos-product" label="Thêm sản phẩm">
                <app-combobox
                  id="pos-product"
                  [options]="variantOptions"
                  [ngModel]="null"
                  (ngModelChange)="onAddVariant($event)"
                  placeholder="Tìm theo tên / SKU..."
                />
              </app-form-field>

              @if (cart().length === 0) {
                <div
                  class="rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500"
                >
                  Chưa có sản phẩm — chọn từ combobox ở trên.
                </div>
              } @else {
                <div class="overflow-hidden rounded-md border border-slate-200">
                  <table class="w-full text-sm">
                    <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th class="px-3 py-2 text-left font-medium">Sản phẩm</th>
                        <th class="px-3 py-2 text-right font-medium w-28">Đơn giá</th>
                        <th class="px-3 py-2 text-center font-medium w-40">SL</th>
                        <th class="px-3 py-2 text-right font-medium w-32">Thành tiền</th>
                        <th class="px-3 py-2 w-10"></th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                      @for (line of cart(); track line.variantId) {
                        <tr>
                          <td class="px-3 py-2">
                            <p class="text-slate-900">{{ line.productName }}</p>
                            <p class="text-xs text-slate-500">
                              {{ line.variantLabel }} · {{ line.variantSku }}
                            </p>
                          </td>
                          <td class="px-3 py-2 text-right text-slate-700">
                            {{ line.unitPrice | currency: 'VND' : 'symbol-narrow' : '1.0-0' }}
                          </td>
                          <td class="px-3 py-2">
                            <div class="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                class="rounded p-1 hover:bg-slate-100"
                                [attr.aria-label]="'Giảm số lượng ' + line.productName"
                                (click)="changeQty(line.variantId, -1)"
                              >
                                <app-icon [icon]="minusIcon" size="sm" />
                              </button>
                              <span class="w-8 text-center font-medium text-slate-900">
                                {{ line.quantity }}
                              </span>
                              <button
                                type="button"
                                class="rounded p-1 hover:bg-slate-100"
                                [attr.aria-label]="'Tăng số lượng ' + line.productName"
                                (click)="changeQty(line.variantId, 1)"
                              >
                                <app-icon [icon]="plusIcon" size="sm" />
                              </button>
                            </div>
                          </td>
                          <td class="px-3 py-2 text-right font-medium text-slate-900">
                            {{
                              line.unitPrice * line.quantity
                                | currency: 'VND' : 'symbol-narrow' : '1.0-0'
                            }}
                          </td>
                          <td class="px-3 py-2 text-right">
                            <button
                              type="button"
                              class="rounded p-1 text-red-500 hover:bg-red-50"
                              [attr.aria-label]="'Xoá ' + line.productName"
                              (click)="removeLine(line.variantId)"
                            >
                              <app-icon [icon]="trashIcon" size="sm" />
                            </button>
                          </td>
                        </tr>
                      }
                    </tbody>
                    <tfoot class="bg-slate-50 text-sm">
                      <tr>
                        <td colspan="3" class="px-3 py-2 text-right text-slate-600">Tạm tính</td>
                        <td class="px-3 py-2 text-right font-medium text-slate-900">
                          {{ subtotal() | currency: 'VND' : 'symbol-narrow' : '1.0-0' }}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              }

              <div class="flex justify-between pt-2">
                <app-button variant="secondary" (click)="goTo('customer')">Quay lại</app-button>
                <app-button [disabled]="!cartStepValid()" (click)="goTo('payment')">
                  Tiếp tục
                  <app-icon [icon]="nextIcon" size="sm" />
                </app-button>
              </div>
            </div>
          </ng-template>

          <!-- STEP 3: PAYMENT -->
          <ng-template
            appStepperStep="payment"
            appStepperStepLabel="Thanh toán"
            appStepperStepDescription="Phương thức và xác nhận"
            [appStepperStepValid]="paymentStepValid()"
          >
            <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div class="space-y-4">
                <app-form-field for="pos-method" label="Phương thức thanh toán" [required]="true">
                  <app-select
                    id="pos-method"
                    [options]="methodOptions"
                    [ngModel]="paymentMethod()"
                    (ngModelChange)="paymentMethod.set($event)"
                    placeholder="Chọn phương thức"
                  />
                </app-form-field>

                <app-form-field for="pos-discount" label="Giảm giá (₫)">
                  <app-price-input
                    id="pos-discount"
                    [ngModel]="discount()"
                    (ngModelChange)="discount.set($event ?? 0)"
                  />
                </app-form-field>

                <app-form-field for="pos-note" label="Ghi chú (tuỳ chọn)">
                  <app-textarea
                    id="pos-note"
                    [ngModel]="note()"
                    (ngModelChange)="note.set($event)"
                    [rows]="3"
                    placeholder="Ghi chú nội bộ về đơn hàng..."
                  />
                </app-form-field>
              </div>

              <app-card padding="lg" class="self-start">
                <h3 class="mb-3 text-sm font-semibold text-slate-700">Tóm tắt đơn</h3>
                <dl class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <dt class="text-slate-500">Khách hàng</dt>
                    <dd class="text-slate-900">
                      {{ isWalkIn() ? 'Khách lẻ' : selectedCustomer()?.fullName }}
                    </dd>
                  </div>
                  <div class="flex justify-between">
                    <dt class="text-slate-500">Số sản phẩm</dt>
                    <dd class="text-slate-900">{{ cart().length }} dòng · {{ totalItems() }} sp</dd>
                  </div>
                  <div class="flex justify-between">
                    <dt class="text-slate-500">Tạm tính</dt>
                    <dd class="text-slate-900">
                      {{ subtotal() | currency: 'VND' : 'symbol-narrow' : '1.0-0' }}
                    </dd>
                  </div>
                  @if (discount() > 0) {
                    <div class="flex justify-between">
                      <dt class="text-slate-500">Giảm giá</dt>
                      <dd class="text-red-600">
                        -{{ discount() | currency: 'VND' : 'symbol-narrow' : '1.0-0' }}
                      </dd>
                    </div>
                  }
                  <div class="border-t border-slate-200 pt-2"></div>
                  <div class="flex items-center justify-between">
                    <dt class="text-sm font-semibold text-slate-700">Tổng</dt>
                    <dd class="text-xl font-bold text-slate-900">
                      {{ total() | currency: 'VND' : 'symbol-narrow' : '1.0-0' }}
                    </dd>
                  </div>
                </dl>
              </app-card>
            </div>

            <div class="flex justify-between pt-4 border-t border-slate-100 mt-4">
              <app-button variant="secondary" (click)="goTo('cart')">Quay lại</app-button>
              <app-button
                [disabled]="!paymentStepValid() || submitting()"
                [loading]="submitting()"
                (click)="onSubmit()"
              >
                <app-icon [icon]="checkoutIcon" size="md" />
                Hoàn tất bán
              </app-button>
            </div>
          </ng-template>
        </app-stepper>
      </app-card>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderPosFormComponent {
  private readonly orderStore = inject(OrderStore);
  private readonly paymentStore = inject(PaymentStore);
  private readonly tenantStore = inject(TenantStore);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly breadcrumb = [
    { label: 'Trang chủ', to: '/dashboard' },
    { label: 'Đơn hàng', to: '/orders' },
    { label: 'Tạo đơn POS' },
  ];

  protected readonly nextIcon = LucidePlus.icon;
  protected readonly plusIcon = LucidePlus.icon;
  protected readonly minusIcon = LucideMinus.icon;
  protected readonly trashIcon = LucideTrash2.icon;
  protected readonly checkoutIcon = LucideUserPlus.icon;

  protected readonly customerOptions = CUSTOMER_OPTIONS;
  protected readonly variantOptions = VARIANT_OPTIONS;
  protected readonly methodOptions = PAYMENT_METHOD_OPTIONS;

  protected readonly activeStep = signal<string>('customer');
  protected readonly isWalkIn = signal<boolean>(false);
  protected readonly customerId = signal<string | null>(null);
  protected readonly cart = signal<CartLine[]>([]);
  protected readonly paymentMethod = signal<PaymentMethod | null>(null);
  protected readonly discount = signal<number>(0);
  protected readonly note = signal<string>('');
  protected readonly submitting = signal<boolean>(false);

  protected readonly selectedCustomer = computed(() => {
    const id = this.customerId();
    if (!id) return null;
    return CUSTOMERS.find((c) => c.id === id) ?? null;
  });

  protected readonly subtotal = computed(() =>
    this.cart().reduce((sum, l) => sum + l.unitPrice * l.quantity, 0),
  );

  protected readonly totalItems = computed(() =>
    this.cart().reduce((sum, l) => sum + l.quantity, 0),
  );

  protected readonly total = computed(() => Math.max(0, this.subtotal() - this.discount()));

  protected readonly tenantName = computed(() => this.tenantStore.currentTenant().name);

  protected readonly customerStepValid = computed(
    () => this.isWalkIn() || this.customerId() !== null,
  );

  protected readonly cartStepValid = computed(() => this.cart().length > 0);

  protected readonly paymentStepValid = computed(
    () => this.cartStepValid() && this.paymentMethod() !== null && this.total() > 0,
  );

  protected onWalkInChange(checked: boolean): void {
    this.isWalkIn.set(checked);
    if (checked) {
      this.customerId.set(null);
    }
  }

  protected onCustomerChange(id: string | null): void {
    this.customerId.set(id);
    if (id) this.isWalkIn.set(false);
  }

  protected goTo(step: string): void {
    this.activeStep.set(step);
  }

  protected onAddVariant(variantId: string | null): void {
    if (!variantId) return;
    const product = PRODUCTS.find((p) => p.variants.some((v) => v.id === variantId));
    const variant = product?.variants.find((v) => v.id === variantId);
    if (!product || !variant) return;

    const existing = this.cart().find((l) => l.variantId === variantId);
    if (existing) {
      this.changeQty(variantId, 1);
      return;
    }

    const variantLabel = Object.values(variant.attributes).join(' / ') || 'default';
    this.cart.update((list) => [
      ...list,
      {
        productId: product.id,
        productName: product.name,
        variantId: variant.id,
        variantSku: variant.sku,
        variantLabel,
        unitPrice: variant.price,
        quantity: 1,
      },
    ]);
  }

  protected changeQty(variantId: string, delta: number): void {
    this.cart.update((list) =>
      list
        .map((l) => (l.variantId === variantId ? { ...l, quantity: l.quantity + delta } : l))
        .filter((l) => l.quantity > 0),
    );
  }

  protected removeLine(variantId: string): void {
    this.cart.update((list) => list.filter((l) => l.variantId !== variantId));
  }

  protected async onSubmit(): Promise<void> {
    if (!this.paymentStepValid()) return;
    this.submitting.set(true);
    try {
      const tenant = this.tenantStore.currentTenant();
      const customer = this.selectedCustomer();
      const method = this.paymentMethod();
      if (!method) return;
      const now = new Date().toISOString();
      const code = this.orderStore.nextOrderCode();
      const orderId = `ord-${code.toLowerCase()}-${Date.now().toString(36)}`;
      const actor = this.authStore.currentUser()?.fullName ?? 'Staff POS';
      const total = this.total();

      const items: IOrderItem[] = this.cart().map((l, i) => ({
        id: `${orderId}-item-${i + 1}`,
        productId: l.productId,
        productName: l.productName,
        variantId: l.variantId,
        variantSku: l.variantSku,
        variantLabel: l.variantLabel,
        unitPrice: l.unitPrice,
        quantity: l.quantity,
        discount: 0,
        refundedQuantity: 0,
      }));

      const events: IOrderEvent[] = [
        {
          id: `${code}-evt-1`,
          occurredAt: now,
          status: 'draft',
          actor,
          note: 'Tạo đơn tại quầy',
        },
        {
          id: `${code}-evt-2`,
          occurredAt: now,
          status: 'completed',
          actor,
          note: `Thanh toán ${PAYMENT_METHOD_META[method].label}`,
        },
      ];

      const order: IOrder = {
        id: orderId,
        code,
        channel: 'pos',
        status: 'completed',
        tenantId: tenant.id,
        customerId: customer?.id ?? null,
        customerName: customer?.fullName ?? 'Khách lẻ',
        customerPhone: customer?.phone ?? '',
        placedAt: now,
        confirmedAt: now,
        completedAt: now,
        cancelledAt: null,
        staffName: actor,
        items,
        shipping: null,
        subtotal: this.subtotal(),
        discount: this.discount(),
        shippingFee: 0,
        tax: 0,
        total,
        paidAmount: total,
        refundedAmount: 0,
        note: this.note(),
        events,
        refundIds: [],
      };

      await this.orderStore.createOrder(order);

      const payment: IPayment = {
        id: `pay-${orderId}`,
        code: this.paymentStore.nextPaymentCode(),
        orderId,
        orderCode: code,
        tenantId: tenant.id,
        method,
        status: 'paid',
        amount: total,
        paidAt: now,
        transactionRef: method === 'cash' ? null : `TXN${Date.now().toString(36).toUpperCase()}`,
        note: '',
      };
      await this.paymentStore.addPayment(payment);

      this.toast.success(`Đã tạo đơn ${code}`);
      await this.router.navigate(['/orders', orderId]);
    } finally {
      this.submitting.set(false);
    }
  }
}
