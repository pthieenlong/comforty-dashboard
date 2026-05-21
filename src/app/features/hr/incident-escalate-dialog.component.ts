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
import type { IncidentEscalationLevel } from './incident.types';

interface EscalateDialogData {
  incidentCode: string;
  currentLevel: IncidentEscalationLevel;
}

export interface IncidentEscalateResult {
  level: IncidentEscalationLevel;
  reason: string;
}

const LEVEL_OPTIONS: SelectOption<IncidentEscalationLevel>[] = [
  { value: 2, label: 'Cấp 2 — Quản lý khu vực' },
  { value: 3, label: 'Cấp 3 — Ban điều hành HQ' },
];

@Component({
  selector: 'app-incident-escalate-dialog',
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
      title="Báo cáo lên cấp trên"
      [description]="'Sự cố ' + data.incidentCode + ' · cấp hiện tại ' + data.currentLevel"
      size="md"
    >
      <div class="space-y-3">
        <app-form-field label="Cấp báo cáo" for="inc-escalate-level" [required]="true">
          <app-select id="inc-escalate-level" [options]="levelOptions" [(ngModel)]="level" />
        </app-form-field>
        <app-form-field label="Lý do" for="inc-escalate-reason" [required]="true">
          <app-textarea
            id="inc-escalate-reason"
            placeholder="Vì sao cần báo cáo lên cấp này?"
            [rows]="3"
            [(ngModel)]="reason"
          />
        </app-form-field>
      </div>

      <div modal-footer class="contents">
        <app-button variant="secondary" (click)="cancel()">Huỷ</app-button>
        <app-button [disabled]="!canSubmit()" (click)="confirm()">Gửi escalate</app-button>
      </div>
    </app-modal>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncidentEscalateDialogComponent {
  protected readonly data = inject<EscalateDialogData>(DIALOG_DATA);
  private readonly dialogRef = inject<DialogRef<IncidentEscalateResult | null>>(DialogRef);

  protected readonly levelOptions = LEVEL_OPTIONS;
  protected readonly level = signal<IncidentEscalationLevel>(this.data.currentLevel >= 2 ? 3 : 2);
  protected readonly reason = signal<string>('');

  protected readonly canSubmit = computed(
    () => this.reason().trim().length > 5 && this.level() > this.data.currentLevel,
  );

  protected cancel(): void {
    this.dialogRef.close(null);
  }

  protected confirm(): void {
    if (!this.canSubmit()) return;
    this.dialogRef.close({ level: this.level(), reason: this.reason().trim() });
  }
}

export async function openIncidentEscalateDialog(
  dialog: Dialog,
  incidentCode: string,
  currentLevel: IncidentEscalationLevel,
): Promise<IncidentEscalateResult | null> {
  if (currentLevel >= 3) return null;
  const ref = dialog.open<IncidentEscalateResult | null, EscalateDialogData>(
    IncidentEscalateDialogComponent,
    {
      data: { incidentCode, currentLevel },
      backdropClass: 'bg-slate-900/40',
      panelClass: ['flex', 'items-center', 'justify-center', 'p-4'],
      disableClose: false,
    },
  );
  return new Promise((resolve) => {
    ref.closed.subscribe((res) => resolve(res ?? null));
  });
}
