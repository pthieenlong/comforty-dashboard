import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  FormArray,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideArrowRight, LucidePlus, LucideTrash2 } from '@lucide/angular';
import {
  BreadcrumbComponent,
  ButtonComponent,
  CardComponent,
  FormFieldComponent,
  IconComponent,
  NumberInputComponent,
  SelectComponent,
  type SelectOption,
  StepperComponent,
  StepperStepDirective,
  TextareaComponent,
  ToastService,
} from '@/shared/ui';
import { MOCK_WAREHOUSES } from '@/core/warehouse/warehouse.mock';
import { PRODUCTS } from '@/features/product/product.mock';
import { STOCK_ROWS } from './inventory.mock';

interface InfoForm {
  fromWarehouseId: FormControl<string>;
  toWarehouseId: FormControl<string>;
  expectedAt: FormControl<string>;
  note: FormControl<string>;
}

interface LineForm {
  variantId: FormControl<string>;
  quantity: FormControl<number | null>;
}

const WAREHOUSE_OPTIONS: SelectOption<string>[] = MOCK_WAREHOUSES.map((w) => ({
  value: w.id,
  label: w.name,
}));

const VARIANT_OPTIONS: SelectOption<string>[] = PRODUCTS.flatMap((p) =>
  p.variants.map((v) => ({
    value: v.id,
    label: `${p.name} — ${Object.values(v.attributes).join(' / ') || 'default'} (${v.sku})`,
  })),
);

@Component({
  selector: 'app-transfer-form',
  imports: [
    BreadcrumbComponent,
    ButtonComponent,
    CardComponent,
    FormFieldComponent,
    FormsModule,
    IconComponent,
    NumberInputComponent,
    ReactiveFormsModule,
    RouterLink,
    SelectComponent,
    StepperComponent,
    StepperStepDirective,
    TextareaComponent,
  ],
  template: `
    <div class="space-y-6">
      <div>
        <app-breadcrumb [items]="breadcrumb" />
        <h1 class="mt-2 text-2xl font-bold text-slate-900">Tạo phiếu chuyển kho</h1>
        <p class="mt-1 text-sm text-slate-500">
          Khai báo tuyến, chọn hàng, kiểm tra rồi gửi yêu cầu.
        </p>
      </div>

      <app-card padding="lg">
        <app-stepper [(activeKey)]="activeStep" mode="strict">
          <ng-template
            appStepperStep="info"
            appStepperStepLabel="Tuyến chuyển"
            appStepperStepDescription="Từ → đến + ngày dự kiến"
            [appStepperStepValid]="infoValid()"
          >
            <form [formGroup]="infoForm" class="grid gap-4 sm:grid-cols-2">
              <app-form-field
                for="from-wh"
                label="Kho nguồn"
                [required]="true"
                [errorText]="fromError()"
              >
                <app-select
                  id="from-wh"
                  [options]="warehouseOptions"
                  placeholder="Chọn kho nguồn"
                  formControlName="fromWarehouseId"
                  [invalid]="!!fromError()"
                />
              </app-form-field>

              <app-form-field
                for="to-wh"
                label="Kho đích"
                [required]="true"
                [errorText]="toError()"
              >
                <app-select
                  id="to-wh"
                  [options]="warehouseOptions"
                  placeholder="Chọn kho đích"
                  formControlName="toWarehouseId"
                  [invalid]="!!toError()"
                />
              </app-form-field>

              <app-form-field for="expected-at" label="Ngày dự kiến nhận">
                <input
                  id="expected-at"
                  type="date"
                  class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  [value]="infoForm.controls.expectedAt.value"
                  (input)="onExpectedDate($event)"
                />
              </app-form-field>

              <app-form-field for="note" label="Ghi chú" class="sm:col-span-2">
                <app-textarea
                  id="note"
                  placeholder="Lý do chuyển, người liên hệ..."
                  [rows]="3"
                  formControlName="note"
                />
              </app-form-field>
            </form>
          </ng-template>

          <ng-template
            appStepperStep="items"
            appStepperStepLabel="Mặt hàng"
            appStepperStepDescription="Chọn SKU và số lượng"
            [appStepperStepValid]="itemsValid()"
          >
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <p class="text-sm text-slate-600">
                  Tổng số <strong>{{ totalLines() }}</strong> dòng,
                  <strong>{{ totalQuantity() }}</strong> sản phẩm.
                </p>
                <app-button variant="secondary" size="sm" (click)="addLine()">
                  <app-icon [icon]="plusIcon" size="sm" />
                  Thêm dòng
                </app-button>
              </div>

              @if (lines.length === 0) {
                <div
                  class="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500"
                >
                  Chưa có dòng hàng. Bấm "Thêm dòng" để bắt đầu.
                </div>
              } @else {
                <div class="space-y-2">
                  @for (line of lines.controls; track $index; let i = $index) {
                    <div
                      class="grid gap-2 rounded-lg border border-slate-200 p-3 sm:grid-cols-[1fr_140px_140px_auto] items-end"
                      [formGroup]="$any(line)"
                    >
                      <app-form-field [for]="'line-variant-' + i" label="SKU">
                        <app-select
                          [id]="'line-variant-' + i"
                          [options]="variantOptions"
                          placeholder="Chọn variant"
                          [searchable]="true"
                          formControlName="variantId"
                        />
                      </app-form-field>

                      <app-form-field [for]="'line-qty-' + i" label="Số lượng">
                        <app-number-input
                          [id]="'line-qty-' + i"
                          [min]="1"
                          formControlName="quantity"
                        />
                      </app-form-field>

                      <app-form-field [for]="'line-stock-' + i" label="Tồn nguồn">
                        <div
                          [id]="'line-stock-' + i"
                          class="flex h-[38px] items-center rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600"
                        >
                          {{ availableLabel(i) }}
                        </div>
                      </app-form-field>

                      <button
                        type="button"
                        class="rounded p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        [attr.aria-label]="'Xoá dòng'"
                        (click)="removeLine(i)"
                      >
                        <app-icon [icon]="trashIcon" size="sm" />
                      </button>
                    </div>
                    @if (lineWarning(i); as msg) {
                      <p class="text-xs text-amber-600 -mt-1 ml-1">{{ msg }}</p>
                    }
                  }
                </div>
              }
            </div>
          </ng-template>

          <ng-template
            appStepperStep="review"
            appStepperStepLabel="Review"
            appStepperStepDescription="Kiểm tra trước khi gửi"
            [appStepperStepValid]="reviewValid()"
          >
            <div class="space-y-4">
              <div class="grid gap-4 sm:grid-cols-2">
                <div class="rounded-lg border border-slate-200 p-3">
                  <p class="text-xs uppercase text-slate-500">Từ</p>
                  <p class="mt-1 font-semibold text-slate-900">{{ fromName() }}</p>
                </div>
                <div class="rounded-lg border border-slate-200 p-3">
                  <p class="text-xs uppercase text-slate-500">Đến</p>
                  <p class="mt-1 font-semibold text-slate-900">{{ toName() }}</p>
                </div>
              </div>

              <div class="rounded-lg border border-slate-200">
                <div class="flex items-center justify-between border-b border-slate-100 px-3 py-2">
                  <p class="text-sm font-medium text-slate-700">Danh sách hàng</p>
                  <p class="text-xs text-slate-500">
                    {{ totalLines() }} dòng · {{ totalQuantity() }} sản phẩm
                  </p>
                </div>
                <table class="w-full text-sm">
                  <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th class="px-3 py-2 text-left font-medium">Sản phẩm</th>
                      <th class="px-3 py-2 text-left font-medium">SKU</th>
                      <th class="px-3 py-2 text-right font-medium">SL</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    @for (entry of reviewLines(); track entry.variantId) {
                      <tr>
                        <td class="px-3 py-2 text-slate-700">
                          {{ entry.productName }}
                          @if (entry.variantLabel) {
                            <span class="text-xs text-slate-400">— {{ entry.variantLabel }}</span>
                          }
                        </td>
                        <td class="px-3 py-2 font-mono text-xs text-slate-600">
                          {{ entry.sku }}
                        </td>
                        <td class="px-3 py-2 text-right font-medium text-slate-900">
                          {{ entry.quantity }}
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

              @if (infoForm.controls.note.value) {
                <div class="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                  <p class="text-xs uppercase text-slate-500 mb-1">Ghi chú</p>
                  {{ infoForm.controls.note.value }}
                </div>
              }
            </div>
          </ng-template>

          <ng-template
            appStepperStep="submit"
            appStepperStepLabel="Hoàn tất"
            appStepperStepDescription="Xác nhận và gửi"
            [appStepperStepValid]="true"
          >
            <div class="rounded-lg border border-indigo-200 bg-indigo-50 p-6 text-center">
              <p class="text-lg font-semibold text-indigo-900">Sẵn sàng tạo phiếu chuyển</p>
              <p class="mt-2 text-sm text-indigo-700">
                Bấm "Tạo phiếu" để khởi tạo phiếu ở trạng thái <strong>Nháp</strong>. Bạn có thể
                duyệt và chuyển trạng thái ở bước sau tại trang chi tiết.
              </p>
            </div>
          </ng-template>
        </app-stepper>

        <div class="mt-6 flex items-center justify-between gap-2 border-t border-slate-100 pt-4">
          <a routerLink="/inventory/transfers">
            <app-button variant="secondary" type="button">Hủy</app-button>
          </a>
          <div class="flex gap-2">
            @if (!stepper()?.isFirst()) {
              <app-button variant="secondary" type="button" (click)="stepper()?.prev()">
                Quay lại
              </app-button>
            }
            @if (!stepper()?.isLast()) {
              <app-button
                type="button"
                [disabled]="!stepper()?.isCurrentValid()"
                (click)="stepper()?.next()"
              >
                Tiếp tục
                <app-icon [icon]="arrowIcon" size="sm" />
              </app-button>
            } @else {
              <app-button type="button" [loading]="submitting()" (click)="onSubmit()">
                Tạo phiếu
              </app-button>
            }
          </div>
        </div>
      </app-card>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransferFormComponent {
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly breadcrumb = [
    { label: 'Kho' },
    { label: 'Điều chuyển', to: '/inventory/transfers' },
    { label: 'Tạo mới' },
  ];

  protected readonly plusIcon = LucidePlus.icon;
  protected readonly trashIcon = LucideTrash2.icon;
  protected readonly arrowIcon = LucideArrowRight.icon;

  protected readonly warehouseOptions = WAREHOUSE_OPTIONS;
  protected readonly variantOptions = VARIANT_OPTIONS;

  protected readonly stepper = viewChild(StepperComponent);

  protected readonly activeStep = signal<string>('info');
  protected readonly submitting = signal(false);

  protected readonly infoForm = new FormGroup<InfoForm>({
    fromWarehouseId: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    toWarehouseId: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    expectedAt: new FormControl<string>('', { nonNullable: true }),
    note: new FormControl<string>('', { nonNullable: true }),
  });

  protected readonly lines = new FormArray<FormGroup<LineForm>>([]);

  private readonly infoStatus = toSignal(this.infoForm.statusChanges, {
    initialValue: this.infoForm.status,
  });
  private readonly infoValue = toSignal(this.infoForm.valueChanges, {
    initialValue: this.infoForm.value,
  });
  private readonly linesValue = toSignal(this.lines.valueChanges, {
    initialValue: this.lines.value,
  });

  protected readonly infoValid = computed(() => {
    this.infoStatus();
    this.infoValue();
    if (!this.infoForm.valid) return false;
    const from = this.infoForm.controls.fromWarehouseId.value;
    const to = this.infoForm.controls.toWarehouseId.value;
    return from !== to;
  });

  protected readonly fromError = computed(() => {
    const ctrl = this.infoForm.controls.fromWarehouseId;
    if (!ctrl.touched && !ctrl.dirty) return '';
    if (ctrl.hasError('required')) return 'Vui lòng chọn kho nguồn.';
    if (ctrl.value && ctrl.value === this.infoForm.controls.toWarehouseId.value) {
      return 'Kho nguồn phải khác kho đích.';
    }
    return '';
  });

  protected readonly toError = computed(() => {
    const ctrl = this.infoForm.controls.toWarehouseId;
    if (!ctrl.touched && !ctrl.dirty) return '';
    if (ctrl.hasError('required')) return 'Vui lòng chọn kho đích.';
    if (ctrl.value && ctrl.value === this.infoForm.controls.fromWarehouseId.value) {
      return 'Kho đích phải khác kho nguồn.';
    }
    return '';
  });

  protected readonly totalLines = computed(() => {
    this.linesValue();
    return this.lines.controls.filter((c) => c.controls.variantId.value).length;
  });

  protected readonly totalQuantity = computed(() => {
    this.linesValue();
    return this.lines.controls.reduce((sum, c) => sum + (c.controls.quantity.value ?? 0), 0);
  });

  protected readonly itemsValid = computed(() => {
    this.linesValue();
    if (this.lines.length === 0) return false;
    return this.lines.controls.every((c) => {
      const variantId = c.controls.variantId.value;
      const qty = c.controls.quantity.value;
      if (!variantId || qty === null || qty <= 0) return false;
      const available = this.availableQty(variantId);
      return qty <= available;
    });
  });

  protected readonly reviewValid = computed(() => this.itemsValid() && this.infoValid());

  protected readonly fromName = computed(
    () =>
      MOCK_WAREHOUSES.find((w) => w.id === this.infoForm.controls.fromWarehouseId.value)?.name ??
      '—',
  );
  protected readonly toName = computed(
    () =>
      MOCK_WAREHOUSES.find((w) => w.id === this.infoForm.controls.toWarehouseId.value)?.name ?? '—',
  );

  protected readonly reviewLines = computed(() => {
    this.linesValue();
    return this.lines.controls
      .filter((c) => c.controls.variantId.value && (c.controls.quantity.value ?? 0) > 0)
      .map((c) => {
        const variantId = c.controls.variantId.value;
        const variant = this.findVariant(variantId);
        return {
          variantId,
          sku: variant?.sku ?? variantId,
          productName: variant?.productName ?? '',
          variantLabel: variant?.variantLabel ?? '',
          quantity: c.controls.quantity.value ?? 0,
        };
      });
  });

  constructor() {
    // Start with one empty line.
    this.addLine();
  }

  protected addLine(): void {
    this.lines.push(
      new FormGroup<LineForm>({
        variantId: new FormControl<string>('', { nonNullable: true }),
        quantity: new FormControl<number | null>(1),
      }),
    );
  }

  protected removeLine(index: number): void {
    this.lines.removeAt(index);
  }

  protected onExpectedDate(event: Event): void {
    this.infoForm.controls.expectedAt.setValue((event.target as HTMLInputElement).value);
  }

  protected availableLabel(index: number): string {
    const variantId = this.lines.at(index).controls.variantId.value;
    if (!variantId) return '—';
    return String(this.availableQty(variantId));
  }

  protected lineWarning(index: number): string | null {
    const line = this.lines.at(index);
    const variantId = line.controls.variantId.value;
    const qty = line.controls.quantity.value;
    if (!variantId || qty === null) return null;
    const available = this.availableQty(variantId);
    if (qty > available) {
      return `Tồn nguồn chỉ còn ${available}, không đủ để chuyển ${qty}.`;
    }
    return null;
  }

  protected onSubmit(): void {
    if (!this.reviewValid()) return;
    this.submitting.set(true);
    setTimeout(() => {
      this.submitting.set(false);
      this.toast.success(
        'Đã tạo phiếu chuyển',
        `${this.totalLines()} dòng, ${this.totalQuantity()} sản phẩm.`,
      );
      this.router.navigate(['/inventory/transfers']);
    }, 500);
  }

  private availableQty(variantId: string): number {
    const fromWh = this.infoForm.controls.fromWarehouseId.value;
    if (!fromWh || !variantId) return 0;
    const row = STOCK_ROWS.find((r) => r.warehouseId === fromWh && r.variantId === variantId);
    if (!row) return 0;
    return row.quantity - row.reservedQuantity;
  }

  private findVariant(
    variantId: string,
  ): { sku: string; productName: string; variantLabel: string } | undefined {
    for (const p of PRODUCTS) {
      const v = p.variants.find((vv) => vv.id === variantId);
      if (v) {
        return {
          sku: v.sku,
          productName: p.name,
          variantLabel: Object.values(v.attributes).join(' / '),
        };
      }
    }
    return undefined;
  }
}
