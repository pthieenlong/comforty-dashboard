import { type Dialog, DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ButtonComponent,
  CheckboxComponent,
  FormFieldComponent,
  ModalComponent,
  NumberInputComponent,
  SelectComponent,
  type SelectOption,
  TextareaComponent,
} from '@/shared/ui';
import { REFUND_REASON_META, type IOrder, type IOrderItem, type RefundReason } from './order.types';

interface RefundDialogData {
  order: IOrder;
}

export interface RefundDialogResult {
  reason: RefundReason;
  note: string;
  lines: { orderItemId: string; quantity: number; amount: number }[];
}

interface RefundLineForm {
  itemId: string;
  productName: string;
  variantLabel: string;
  unitPrice: number;
  maxQty: number;
  selected: boolean;
  quantity: number;
}

const REASON_OPTIONS: SelectOption<RefundReason>[] = (
  Object.entries(REFUND_REASON_META) as [RefundReason, (typeof REFUND_REASON_META)[RefundReason]][]
).map(([value, meta]) => ({ value, label: meta.label }));

@Component({
  selector: 'app-refund-dialog',
  imports: [
    ButtonComponent,
    CheckboxComponent,
    CurrencyPipe,
    FormFieldComponent,
    FormsModule,
    ModalComponent,
    NumberInputComponent,
    SelectComponent,
    TextareaComponent,
  ],
  template: `
    <app-modal title="Hoàn hàng / Refund" description="Chọn dòng hàng cần hoàn và lý do" size="xl">
      <div class="space-y-4">
        <div class="rounded-md border border-slate-200">
          <div class="bg-slate-50 px-3 py-2 text-xs font-medium uppercase text-slate-500">
            Dòng hàng
          </div>
          <ul class="divide-y divide-slate-100">
            @for (line of lines(); track line.itemId) {
              <li class="flex items-start gap-3 px-3 py-2.5">
                <div class="pt-1">
                  <app-checkbox
                    [id]="'rf-' + line.itemId"
                    [ngModel]="line.selected"
                    (ngModelChange)="toggleLine(line.itemId, $event)"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="truncate text-sm text-slate-900">{{ line.productName }}</p>
                  @if (line.variantLabel) {
                    <p class="truncate text-xs text-slate-500">{{ line.variantLabel }}</p>
                  }
                  <p class="text-xs text-slate-400">
                    Đơn giá: {{ line.unitPrice | currency: 'VND' : 'symbol-narrow' : '1.0-0' }} ·
                    Còn có thể hoàn: <strong>{{ line.maxQty }}</strong>
                  </p>
                </div>
                <div class="w-28">
                  <app-number-input
                    [id]="'rf-qty-' + line.itemId"
                    [min]="1"
                    [max]="line.maxQty"
                    [ngModel]="line.quantity"
                    [readonly]="!line.selected"
                    (ngModelChange)="updateQty(line.itemId, $event)"
                  />
                </div>
                <div class="w-32 text-right text-sm font-medium text-slate-900">
                  {{ lineAmount(line) | currency: 'VND' : 'symbol-narrow' : '1.0-0' }}
                </div>
              </li>
            }
          </ul>
        </div>

        <div class="grid gap-3 sm:grid-cols-2">
          <app-form-field
            for="rf-reason"
            label="Lý do hoàn"
            [required]="true"
            [errorText]="!reason() ? 'Vui lòng chọn lý do' : ''"
          >
            <app-select
              id="rf-reason"
              [options]="reasonOptions"
              [ngModel]="reason()"
              (ngModelChange)="reason.set($event)"
              placeholder="Chọn lý do"
            />
          </app-form-field>

          <div class="flex items-end justify-end">
            <div class="text-right">
              <p class="text-xs text-slate-500">Tổng tiền hoàn</p>
              <p class="text-xl font-bold text-slate-900">
                {{ totalAmount() | currency: 'VND' : 'symbol-narrow' : '1.0-0' }}
              </p>
            </div>
          </div>
        </div>

        <app-form-field for="rf-note" label="Ghi chú (tuỳ chọn)">
          <app-textarea
            id="rf-note"
            [ngModel]="note()"
            (ngModelChange)="note.set($event)"
            [rows]="3"
            placeholder="Mô tả thêm về việc hoàn hàng..."
          />
        </app-form-field>
      </div>

      <div modal-footer class="flex gap-2">
        <app-button variant="secondary" (click)="cancel()">Huỷ</app-button>
        <app-button variant="primary" [disabled]="!canSubmit()" (click)="submit()">
          Xác nhận hoàn {{ totalAmount() | currency: 'VND' : 'symbol-narrow' : '1.0-0' }}
        </app-button>
      </div>
    </app-modal>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class RefundDialogComponent {
  private readonly data = inject<RefundDialogData>(DIALOG_DATA);
  private readonly dialogRef = inject<DialogRef<RefundDialogResult | null>>(DialogRef);

  protected readonly reasonOptions = REASON_OPTIONS;

  protected readonly lines = signal<RefundLineForm[]>(
    this.data.order.items.map((it: IOrderItem) => ({
      itemId: it.id,
      productName: it.productName,
      variantLabel: it.variantLabel,
      unitPrice: it.unitPrice,
      maxQty: Math.max(0, it.quantity - it.refundedQuantity),
      selected: false,
      quantity: 1,
    })),
  );
  protected readonly reason = signal<RefundReason | null>(null);
  protected readonly note = signal<string>('');

  protected readonly totalAmount = computed(() =>
    this.lines()
      .filter((l) => l.selected)
      .reduce((sum, l) => sum + l.unitPrice * l.quantity, 0),
  );

  protected readonly canSubmit = computed(() => {
    if (!this.reason()) return false;
    return this.lines().some((l) => l.selected && l.quantity > 0);
  });

  protected toggleLine(id: string, checked: boolean): void {
    this.lines.update((list) =>
      list.map((l) => (l.itemId === id ? { ...l, selected: checked && l.maxQty > 0 } : l)),
    );
  }

  protected updateQty(id: string, qty: number | null): void {
    this.lines.update((list) =>
      list.map((l) => {
        if (l.itemId !== id) return l;
        const clamped = Math.max(1, Math.min(l.maxQty, qty ?? 1));
        return { ...l, quantity: clamped };
      }),
    );
  }

  protected lineAmount(line: RefundLineForm): number {
    return line.selected ? line.unitPrice * line.quantity : 0;
  }

  protected cancel(): void {
    this.dialogRef.close(null);
  }

  protected submit(): void {
    const reason = this.reason();
    if (!reason || !this.canSubmit()) return;
    const result: RefundDialogResult = {
      reason,
      note: this.note(),
      lines: this.lines()
        .filter((l) => l.selected)
        .map((l) => ({
          orderItemId: l.itemId,
          quantity: l.quantity,
          amount: l.unitPrice * l.quantity,
        })),
    };
    this.dialogRef.close(result);
  }
}

export async function openRefundDialog(
  dialog: Dialog,
  order: IOrder,
): Promise<RefundDialogResult | null> {
  const ref = dialog.open<RefundDialogResult | null, RefundDialogData>(RefundDialogComponent, {
    data: { order },
    backdropClass: 'bg-slate-900/40',
    panelClass: ['flex', 'items-center', 'justify-center', 'p-4'],
    disableClose: false,
  });
  return new Promise((resolve) => {
    ref.closed.subscribe((res) => resolve(res ?? null));
  });
}
