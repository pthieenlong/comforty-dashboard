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
import { ATTENDANCE_STATUS_META, type AttendanceStatus, type IAttendanceRecord } from './hr.types';

interface AttendanceEditDialogData {
  record: IAttendanceRecord;
  userLabel: string;
}

export interface AttendanceEditDialogResult {
  checkInAt: string | null;
  checkOutAt: string | null;
  status: AttendanceStatus;
  note: string | null;
}

const STATUS_OPTIONS: SelectOption<AttendanceStatus>[] = (
  Object.entries(ATTENDANCE_STATUS_META) as [
    AttendanceStatus,
    (typeof ATTENDANCE_STATUS_META)[AttendanceStatus],
  ][]
).map(([value, meta]) => ({ value, label: meta.label }));

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function isoToTime(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function timeToIso(date: string, time: string): string | null {
  if (!time) return null;
  const [hh, mm] = time.split(':').map(Number);
  const [y, m, d] = date.split('-').map(Number);
  if (!y || !m || !d || Number.isNaN(hh) || Number.isNaN(mm)) return null;
  const out = new Date(y, m - 1, d, hh, mm, 0, 0);
  return out.toISOString();
}

@Component({
  selector: 'app-attendance-edit-dialog',
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
      title="Sửa chấm công"
      [description]="data.userLabel + ' · ' + formatDate(data.record.date)"
      size="md"
    >
      <div class="space-y-3">
        <app-form-field label="Trạng thái" for="att-status">
          <app-select id="att-status" [options]="statusOptions" [(ngModel)]="statusValue" />
        </app-form-field>

        <div class="grid grid-cols-2 gap-3">
          <app-form-field label="Giờ vào" for="att-in">
            <input
              id="att-in"
              type="time"
              class="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              [ngModel]="checkInTime()"
              (ngModelChange)="checkInTime.set($event)"
            />
          </app-form-field>
          <app-form-field label="Giờ ra" for="att-out">
            <input
              id="att-out"
              type="time"
              class="block w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2"
              [class.border-red-400]="timeInvalid()"
              [class.focus:border-red-500]="timeInvalid()"
              [class.focus:ring-red-500]="timeInvalid()"
              [class.border-slate-300]="!timeInvalid()"
              [class.focus:border-indigo-500]="!timeInvalid()"
              [class.focus:ring-indigo-500]="!timeInvalid()"
              [ngModel]="checkOutTime()"
              (ngModelChange)="checkOutTime.set($event)"
            />
          </app-form-field>
        </div>
        @if (timeInvalid()) {
          <p class="-mt-2 text-xs text-red-600">Giờ ra phải sau giờ vào.</p>
        }

        <app-form-field label="Ghi chú" for="att-note">
          <app-textarea
            id="att-note"
            placeholder="Lý do điều chỉnh..."
            [rows]="3"
            [(ngModel)]="noteValue"
          />
        </app-form-field>
      </div>

      <div modal-footer class="contents">
        <app-button variant="secondary" (click)="cancel()">Huỷ</app-button>
        <app-button [disabled]="timeInvalid()" (click)="save()">Lưu thay đổi</app-button>
      </div>
    </app-modal>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttendanceEditDialogComponent {
  protected readonly data = inject<AttendanceEditDialogData>(DIALOG_DATA);
  private readonly dialogRef = inject<DialogRef<AttendanceEditDialogResult | null>>(DialogRef);

  protected readonly statusOptions = STATUS_OPTIONS;
  protected readonly statusValue = signal<AttendanceStatus>(this.data.record.status);
  protected readonly checkInTime = signal<string>(isoToTime(this.data.record.checkInAt));
  protected readonly checkOutTime = signal<string>(isoToTime(this.data.record.checkOutAt));
  protected readonly noteValue = signal<string>(this.data.record.note ?? '');

  protected readonly timeInvalid = computed(() => {
    const i = this.checkInTime();
    const o = this.checkOutTime();
    if (!i || !o) return false;
    return o <= i;
  });

  protected formatDate(iso: string): string {
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  }

  protected cancel(): void {
    this.dialogRef.close(null);
  }

  protected save(): void {
    if (this.timeInvalid()) return;
    const checkInAt = timeToIso(this.data.record.date, this.checkInTime());
    const checkOutAt = timeToIso(this.data.record.date, this.checkOutTime());
    const note = this.noteValue().trim();
    this.dialogRef.close({
      checkInAt,
      checkOutAt,
      status: this.statusValue(),
      note: note.length > 0 ? note : null,
    });
  }
}

export async function openAttendanceEditDialog(
  dialog: Dialog,
  record: IAttendanceRecord,
  userLabel: string,
): Promise<AttendanceEditDialogResult | null> {
  const ref = dialog.open<AttendanceEditDialogResult | null, AttendanceEditDialogData>(
    AttendanceEditDialogComponent,
    {
      data: { record, userLabel },
      backdropClass: 'bg-slate-900/40',
      panelClass: ['flex', 'items-center', 'justify-center', 'p-4'],
      disableClose: false,
    },
  );
  return new Promise((resolve) => {
    ref.closed.subscribe((res) => resolve(res ?? null));
  });
}
