import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ButtonComponent, type ButtonVariant } from '@/shared/ui/button/button.component';
import { ModalComponent } from '@/shared/ui/modal/modal.component';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'primary' | 'danger';
}

@Component({
  selector: 'app-confirm-dialog',
  imports: [ButtonComponent, ModalComponent],
  template: `
    <app-modal [title]="data.title" size="sm" [dismissible]="false">
      <p class="text-sm text-slate-600">{{ data.message }}</p>

      <ng-container modal-footer>
        <app-button variant="secondary" (click)="cancel()">{{ cancelText }}</app-button>
        <app-button [variant]="confirmVariant" (click)="confirm()">{{ confirmText }}</app-button>
      </ng-container>
    </app-modal>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialogComponent {
  protected readonly data = inject<ConfirmDialogData>(DIALOG_DATA);
  private readonly dialogRef = inject<DialogRef<boolean>>(DialogRef);

  protected get confirmText(): string {
    return this.data.confirmText ?? 'Xác nhận';
  }
  protected get cancelText(): string {
    return this.data.cancelText ?? 'Hủy';
  }
  protected get confirmVariant(): ButtonVariant {
    return this.data.variant === 'danger' ? 'danger' : 'primary';
  }

  protected confirm(): void {
    this.dialogRef.close(true);
  }

  protected cancel(): void {
    this.dialogRef.close(false);
  }
}
