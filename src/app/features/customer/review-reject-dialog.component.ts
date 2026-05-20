import { type Dialog, DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ButtonComponent,
  FormFieldComponent,
  ModalComponent,
  SelectComponent,
  type SelectOption,
  TextareaComponent,
} from '@/shared/ui';
import { REJECT_REASON_OPTIONS } from './review.types';

interface RejectDialogData {
  reviewTitle: string;
}

export interface RejectDialogResult {
  reason: string;
  note: string;
}

const REASON_OPTIONS: SelectOption<string>[] = REJECT_REASON_OPTIONS.map((r) => ({
  value: r,
  label: r,
}));

@Component({
  selector: 'app-review-reject-dialog',
  imports: [
    ButtonComponent,
    FormFieldComponent,
    FormsModule,
    ModalComponent,
    SelectComponent,
    TextareaComponent,
  ],
  template: `
    <app-modal title="Từ chối đánh giá" [description]="data.reviewTitle" size="md">
      <div class="space-y-3">
        <app-form-field
          for="rj-reason"
          label="Lý do từ chối"
          [required]="true"
          [errorText]="reason() ? '' : 'Vui lòng chọn lý do'"
        >
          <app-select
            id="rj-reason"
            [options]="reasonOptions"
            [ngModel]="reason()"
            (ngModelChange)="reason.set($event)"
            placeholder="Chọn lý do"
          />
        </app-form-field>

        <app-form-field for="rj-note" label="Ghi chú (tuỳ chọn)">
          <app-textarea
            id="rj-note"
            [ngModel]="note()"
            (ngModelChange)="note.set($event)"
            [rows]="3"
            placeholder="Giải thích thêm cho khách hàng..."
          />
        </app-form-field>
      </div>

      <div modal-footer class="flex gap-2">
        <app-button variant="secondary" (click)="cancel()">Huỷ</app-button>
        <app-button variant="danger" [disabled]="!canSubmit()" (click)="submit()">
          Từ chối
        </app-button>
      </div>
    </app-modal>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class ReviewRejectDialogComponent {
  protected readonly data = inject<RejectDialogData>(DIALOG_DATA);
  private readonly dialogRef = inject<DialogRef<RejectDialogResult | null>>(DialogRef);

  protected readonly reasonOptions = REASON_OPTIONS;
  protected readonly reason = signal<string>('');
  protected readonly note = signal<string>('');

  protected readonly canSubmit = computed(() => this.reason().length > 0);

  protected cancel(): void {
    this.dialogRef.close(null);
  }

  protected submit(): void {
    if (!this.canSubmit()) return;
    this.dialogRef.close({ reason: this.reason(), note: this.note() });
  }
}

export async function openReviewRejectDialog(
  dialog: Dialog,
  data: RejectDialogData,
): Promise<RejectDialogResult | null> {
  const ref = dialog.open<RejectDialogResult | null, RejectDialogData>(
    ReviewRejectDialogComponent,
    {
      data,
      backdropClass: 'bg-slate-900/40',
      panelClass: ['flex', 'items-center', 'justify-center', 'p-4'],
      disableClose: false,
    },
  );
  return new Promise((resolve) => {
    ref.closed.subscribe((res) => resolve(res ?? null));
  });
}
