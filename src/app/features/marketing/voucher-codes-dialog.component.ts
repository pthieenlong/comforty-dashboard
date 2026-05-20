import { type Dialog, DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LucideCheck, LucideCopy, LucideDownload } from '@lucide/angular';
import { ButtonComponent, IconComponent, ModalComponent, ToastService } from '@/shared/ui';
import type { IVoucherCode } from './marketing.types';

interface CodesDialogData {
  batchName: string;
  batchCode: string;
  codes: IVoucherCode[];
}

@Component({
  selector: 'app-voucher-codes-dialog',
  imports: [ButtonComponent, IconComponent, ModalComponent],
  template: `
    <app-modal
      [title]="'Đã tạo ' + data.codes.length + ' mã voucher'"
      [description]="'Batch: ' + data.batchName + ' (' + data.batchCode + ')'"
      size="lg"
    >
      <div class="space-y-3">
        <p class="text-sm text-slate-600">
          Lưu lại danh sách mã trước khi đóng cửa sổ. Mỗi mã chỉ dùng được 1 lần.
        </p>
        <div class="max-h-72 overflow-y-auto rounded-md border border-slate-200 bg-slate-50 p-3">
          <ul class="grid gap-1 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 font-mono text-xs">
            @for (c of data.codes; track c.id) {
              <li class="rounded bg-white border border-slate-200 px-2 py-1 text-slate-700">
                {{ c.code }}
              </li>
            }
          </ul>
        </div>
      </div>

      <div modal-footer class="flex gap-2">
        <app-button variant="secondary" (click)="downloadCsv()">
          <app-icon [icon]="downloadIcon" size="sm" />
          Tải CSV
        </app-button>
        <app-button variant="primary" (click)="copyAll()">
          <app-icon [icon]="copyIcon" size="sm" />
          Copy tất cả
        </app-button>
        <app-button variant="secondary" (click)="close()">
          <app-icon [icon]="checkIcon" size="sm" />
          Đóng
        </app-button>
      </div>
    </app-modal>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class VoucherCodesDialogComponent {
  protected readonly data = inject<CodesDialogData>(DIALOG_DATA);
  private readonly dialogRef = inject<DialogRef<boolean>>(DialogRef);
  private readonly toast = inject(ToastService);

  protected readonly copyIcon = LucideCopy.icon;
  protected readonly downloadIcon = LucideDownload.icon;
  protected readonly checkIcon = LucideCheck.icon;

  protected async copyAll(): Promise<void> {
    const text = this.data.codes.map((c) => c.code).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      this.toast.success(`Đã copy ${this.data.codes.length} mã`);
    } catch {
      this.toast.warning('Không copy được — thử thủ công');
    }
  }

  protected downloadCsv(): void {
    const rows = ['code', ...this.data.codes.map((c) => c.code)];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.data.batchCode}-codes.csv`;
    a.click();
    URL.revokeObjectURL(url);
    this.toast.success('Đã tải CSV');
  }

  protected close(): void {
    this.dialogRef.close(true);
  }
}

export async function openVoucherCodesDialog(dialog: Dialog, data: CodesDialogData): Promise<void> {
  const ref = dialog.open(VoucherCodesDialogComponent, {
    data,
    backdropClass: 'bg-slate-900/40',
    panelClass: ['flex', 'items-center', 'justify-center', 'p-4'],
    disableClose: false,
  });
  await new Promise<void>((resolve) => {
    ref.closed.subscribe(() => resolve());
  });
}
