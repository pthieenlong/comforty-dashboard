import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PlaceholderPageComponent } from '@/shared/ui';

@Component({
  selector: 'app-audit-placeholder',
  imports: [PlaceholderPageComponent],
  template: `
    <app-placeholder-page
      title="Audit log"
      description="Lịch sử thao tác trên toàn hệ thống"
      [breadcrumb]="[
        { label: 'Trang chủ', to: '/dashboard' },
        { label: 'Hệ thống' },
        { label: 'Audit log' },
      ]"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuditPlaceholderComponent {}
