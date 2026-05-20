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
import { ESCALATION_LEVEL_META, type EscalationLevel } from './ticket.types';

interface EscalateDialogData {
  ticketCode: string;
  currentLevel: EscalationLevel;
}

export interface EscalateDialogResult {
  level: EscalationLevel;
  reason: string;
}

@Component({
  selector: 'app-ticket-escalate-dialog',
  imports: [
    ButtonComponent,
    FormFieldComponent,
    FormsModule,
    ModalComponent,
    SelectComponent,
    TextareaComponent,
  ],
  template: `
    <app-modal
      [title]="'Escalate ticket ' + data.ticketCode"
      description="Chuyển ticket lên cấp xử lý cao hơn"
      size="md"
    >
      <div class="space-y-3">
        <p class="rounded-md bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-600">
          Cấp hiện tại: <strong>{{ currentLabel() }}</strong>
        </p>

        <app-form-field
          for="esc-level"
          label="Chuyển lên cấp"
          [required]="true"
          [errorText]="level() ? '' : 'Vui lòng chọn cấp'"
        >
          <app-select
            id="esc-level"
            [options]="levelOptions()"
            [ngModel]="level()"
            (ngModelChange)="level.set($event)"
            placeholder="Chọn cấp escalation"
          />
        </app-form-field>

        <app-form-field
          for="esc-reason"
          label="Lý do escalation"
          [required]="true"
          [errorText]="reason().length > 5 ? '' : 'Ghi rõ lý do (tối thiểu 6 ký tự)'"
        >
          <app-textarea
            id="esc-reason"
            [ngModel]="reason()"
            (ngModelChange)="reason.set($event)"
            [rows]="3"
            placeholder="VD: Vấn đề ngoài thẩm quyền của staff store..."
          />
        </app-form-field>
      </div>

      <div modal-footer class="flex gap-2">
        <app-button variant="secondary" (click)="cancel()">Huỷ</app-button>
        <app-button variant="primary" [disabled]="!canSubmit()" (click)="submit()">
          Escalate
        </app-button>
      </div>
    </app-modal>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class TicketEscalateDialogComponent {
  protected readonly data = inject<EscalateDialogData>(DIALOG_DATA);
  private readonly dialogRef = inject<DialogRef<EscalateDialogResult | null>>(DialogRef);

  protected readonly level = signal<EscalationLevel | null>(null);
  protected readonly reason = signal<string>('');

  protected readonly currentLabel = computed(
    () => ESCALATION_LEVEL_META[this.data.currentLevel].label,
  );

  protected readonly levelOptions = computed<SelectOption<EscalationLevel>[]>(() => {
    const current = this.data.currentLevel;
    return ([2, 3] as EscalationLevel[])
      .filter((l) => l > current)
      .map((l) => ({ value: l, label: ESCALATION_LEVEL_META[l].label }));
  });

  protected readonly canSubmit = computed(
    () => this.level() !== null && this.reason().trim().length > 5,
  );

  protected cancel(): void {
    this.dialogRef.close(null);
  }

  protected submit(): void {
    const level = this.level();
    if (!level || !this.canSubmit()) return;
    this.dialogRef.close({ level, reason: this.reason().trim() });
  }
}

export async function openTicketEscalateDialog(
  dialog: Dialog,
  data: EscalateDialogData,
): Promise<EscalateDialogResult | null> {
  const ref = dialog.open<EscalateDialogResult | null, EscalateDialogData>(
    TicketEscalateDialogComponent,
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
