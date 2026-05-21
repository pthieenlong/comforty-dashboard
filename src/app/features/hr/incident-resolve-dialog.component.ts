import { type Dialog, DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ButtonComponent,
  FormFieldComponent,
  ModalComponent,
  TextareaComponent,
} from '@/shared/ui';

interface ResolveDialogData {
  incidentCode: string;
}

export interface IncidentResolveResult {
  note: string;
}

@Component({
  selector: 'app-incident-resolve-dialog',
  imports: [ButtonComponent, FormFieldComponent, FormsModule, ModalComponent, TextareaComponent],
  template: `
    <app-modal
      title="Đóng kết luận"
      [description]="'Giải quyết sự cố ' + data.incidentCode"
      size="md"
    >
      <div class="space-y-3">
        <app-form-field label="Mô tả cách xử lý" for="inc-resolve-note" [required]="true">
          <app-textarea
            id="inc-resolve-note"
            placeholder="Mô tả ngắn cách đã xử lý và biện pháp phòng ngừa..."
            [rows]="4"
            [(ngModel)]="note"
          />
        </app-form-field>
      </div>

      <div modal-footer class="contents">
        <app-button variant="secondary" (click)="cancel()">Huỷ</app-button>
        <app-button [disabled]="!canSubmit()" (click)="confirm()"
          >Đánh dấu đã giải quyết</app-button
        >
      </div>
    </app-modal>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncidentResolveDialogComponent {
  protected readonly data = inject<ResolveDialogData>(DIALOG_DATA);
  private readonly dialogRef = inject<DialogRef<IncidentResolveResult | null>>(DialogRef);

  protected readonly note = signal<string>('');
  protected readonly canSubmit = computed(() => this.note().trim().length > 5);

  protected cancel(): void {
    this.dialogRef.close(null);
  }

  protected confirm(): void {
    if (!this.canSubmit()) return;
    this.dialogRef.close({ note: this.note().trim() });
  }
}

export async function openIncidentResolveDialog(
  dialog: Dialog,
  incidentCode: string,
): Promise<IncidentResolveResult | null> {
  const ref = dialog.open<IncidentResolveResult | null, ResolveDialogData>(
    IncidentResolveDialogComponent,
    {
      data: { incidentCode },
      backdropClass: 'bg-slate-900/40',
      panelClass: ['flex', 'items-center', 'justify-center', 'p-4'],
      disableClose: false,
    },
  );
  return new Promise((resolve) => {
    ref.closed.subscribe((res) => resolve(res ?? null));
  });
}
