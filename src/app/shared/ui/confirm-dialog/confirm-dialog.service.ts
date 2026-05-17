import { Dialog } from '@angular/cdk/dialog';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ConfirmDialogComponent, type ConfirmDialogData } from './confirm-dialog.component';

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private readonly dialog = inject(Dialog);

  async confirm(data: ConfirmDialogData): Promise<boolean> {
    const ref = this.dialog.open<boolean, ConfirmDialogData>(ConfirmDialogComponent, {
      data,
      backdropClass: 'bg-slate-900/40',
      panelClass: ['flex', 'items-center', 'justify-center', 'p-4'],
      disableClose: true,
    });
    const result = await firstValueFrom(ref.closed);
    return result ?? false;
  }
}
