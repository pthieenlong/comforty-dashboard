import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PlaceholderPageComponent } from '@/shared/ui';

@Component({
  selector: 'app-attendance-placeholder',
  imports: [PlaceholderPageComponent],
  template: `
    <app-placeholder-page
      title="Chấm công"
      description="Lịch chấm công nhân viên theo ngày"
      [breadcrumb]="[
        { label: 'Trang chủ', to: '/dashboard' },
        { label: 'Nhân sự' },
        { label: 'Chấm công' },
      ]"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttendancePlaceholderComponent {}
