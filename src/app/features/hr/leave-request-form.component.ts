import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '@/core/auth/auth.store';
import { TenantStore } from '@/core/tenant/tenant.store';
import {
  ButtonComponent,
  CardComponent,
  DateRangePickerComponent,
  type DateRange,
  FileUploadComponent,
  FormFieldComponent,
  PageHeaderComponent,
  SelectComponent,
  type SelectOption,
  TextareaComponent,
  ToastService,
  type UploadedFile,
} from '@/shared/ui';
import { LeaveRequestStore } from './leave-request.store';
import { LEAVE_TYPE_META, type ILeaveRequest, type LeaveHalfDay, type LeaveType } from './hr.types';

const TYPE_OPTIONS: SelectOption<LeaveType>[] = (Object.keys(LEAVE_TYPE_META) as LeaveType[]).map(
  (v) => ({ value: v, label: LEAVE_TYPE_META[v].label }),
);

@Component({
  selector: 'app-leave-request-form',
  imports: [
    ButtonComponent,
    CardComponent,
    DateRangePickerComponent,
    FileUploadComponent,
    FormFieldComponent,
    FormsModule,
    PageHeaderComponent,
    RouterLink,
    SelectComponent,
    TextareaComponent,
  ],
  template: `
    <div class="space-y-4">
      <app-page-header
        title="Tạo đơn nghỉ phép"
        description="Điền thông tin để gửi đơn xin nghỉ phép."
        [breadcrumb]="breadcrumbs"
      />

      <app-card padding="lg" class="block max-w-2xl">
        <form class="space-y-4" (ngSubmit)="submit()">
          <app-form-field label="Loại nghỉ phép" for="lr-type" [required]="true">
            <app-select id="lr-type" [options]="typeOptions" [(ngModel)]="type" name="type" />
          </app-form-field>

          <app-form-field label="Khoảng thời gian" for="lr-range" [required]="true">
            <app-date-range-picker
              id="lr-range"
              [ngModel]="range()"
              (ngModelChange)="range.set($event)"
              name="range"
            />
          </app-form-field>

          @if (sameDay()) {
            <app-form-field label="Nửa ngày (tuỳ chọn)" for="lr-half">
              <div class="flex gap-2">
                <button
                  type="button"
                  class="rounded-md border px-3 py-1.5 text-sm"
                  [class.border-indigo-500]="halfDay() === null"
                  [class.bg-indigo-50]="halfDay() === null"
                  [class.text-indigo-700]="halfDay() === null"
                  [class.border-slate-300]="halfDay() !== null"
                  [class.text-slate-700]="halfDay() !== null"
                  (click)="halfDay.set(null)"
                >
                  Cả ngày
                </button>
                <button
                  type="button"
                  class="rounded-md border px-3 py-1.5 text-sm"
                  [class.border-indigo-500]="halfDay() === 'morning'"
                  [class.bg-indigo-50]="halfDay() === 'morning'"
                  [class.text-indigo-700]="halfDay() === 'morning'"
                  [class.border-slate-300]="halfDay() !== 'morning'"
                  [class.text-slate-700]="halfDay() !== 'morning'"
                  (click)="halfDay.set('morning')"
                >
                  Sáng
                </button>
                <button
                  type="button"
                  class="rounded-md border px-3 py-1.5 text-sm"
                  [class.border-indigo-500]="halfDay() === 'afternoon'"
                  [class.bg-indigo-50]="halfDay() === 'afternoon'"
                  [class.text-indigo-700]="halfDay() === 'afternoon'"
                  [class.border-slate-300]="halfDay() !== 'afternoon'"
                  [class.text-slate-700]="halfDay() !== 'afternoon'"
                  (click)="halfDay.set('afternoon')"
                >
                  Chiều
                </button>
              </div>
            </app-form-field>
          }

          <app-form-field label="Lý do" for="lr-reason" [required]="true">
            <app-textarea
              id="lr-reason"
              placeholder="Mô tả lý do xin nghỉ..."
              [rows]="3"
              [(ngModel)]="reason"
              name="reason"
            />
          </app-form-field>

          <app-form-field label="Đính kèm (tuỳ chọn)" for="lr-attach">
            <app-file-upload
              id="lr-attach"
              accept="image/*,application/pdf"
              hint="Giấy khám, đơn xin nghỉ... (tối đa 5MB)"
              [ngModel]="attachment()"
              (ngModelChange)="attachment.set($event)"
              name="attachment"
            />
          </app-form-field>

          <div class="flex justify-end gap-2 border-t border-slate-200 pt-4">
            <a routerLink="/hr/leave-requests" class="text-sm text-slate-600 hover:underline">
              Huỷ
            </a>
            <app-button type="submit" [disabled]="!canSubmit()">Gửi đơn</app-button>
          </div>
        </form>
      </app-card>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeaveRequestFormComponent {
  private readonly store = inject(LeaveRequestStore);
  private readonly authStore = inject(AuthStore);
  private readonly tenantStore = inject(TenantStore);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly breadcrumbs = [
    { label: 'Nhân sự', to: '/hr/attendance' },
    { label: 'Đơn nghỉ phép', to: '/hr/leave-requests' },
    { label: 'Tạo mới' },
  ];

  protected readonly typeOptions = TYPE_OPTIONS;

  protected readonly type = signal<LeaveType>('annual');
  protected readonly range = signal<DateRange>({ start: null, end: null });
  protected readonly halfDay = signal<LeaveHalfDay | null>(null);
  protected readonly reason = signal<string>('');
  protected readonly attachment = signal<UploadedFile | null>(null);

  protected readonly sameDay = computed(() => {
    const r = this.range();
    return r.start !== null && r.start === r.end;
  });

  protected readonly canSubmit = computed(() => {
    const r = this.range();
    return r.start !== null && r.end !== null && this.reason().trim().length > 0;
  });

  protected async submit(): Promise<void> {
    if (!this.canSubmit()) return;
    const user = this.authStore.currentUser();
    if (!user) return;
    const tenant = this.tenantStore.currentTenant();
    const r = this.range();
    if (r.start === null || r.end === null) return;
    const req: ILeaveRequest = {
      id: `lr-new-${Date.now()}`,
      code: this.store.nextCode(),
      userId: user.id,
      tenantId: tenant?.id ?? 'tenant-hq',
      type: this.type(),
      fromDate: r.start,
      toDate: r.end,
      halfDay: this.sameDay() ? this.halfDay() : null,
      reason: this.reason().trim(),
      attachmentUrl: this.attachment()?.previewUrl ?? null,
      status: 'pending',
      requestedAt: new Date().toISOString(),
      decidedBy: null,
      decidedAt: null,
      decisionNote: null,
    };
    await this.store.submit(req);
    this.toast.success(`Đã gửi đơn ${req.code}`, 'Chờ duyệt từ cấp quản lý.');
    void this.router.navigate(['/hr/leave-requests', req.id]);
  }
}
