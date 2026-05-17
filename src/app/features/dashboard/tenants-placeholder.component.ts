import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PlaceholderPageComponent } from '@/shared/ui';

@Component({
  selector: 'app-tenants-placeholder',
  imports: [PlaceholderPageComponent],
  template: `
    <app-placeholder-page
      title="Chi nhánh"
      description="Quản lý các chi nhánh trong hệ thống"
      [breadcrumb]="[
        { label: 'Trang chủ', to: '/dashboard' },
        { label: 'Hệ thống' },
        { label: 'Chi nhánh' },
      ]"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TenantsPlaceholderComponent {}
