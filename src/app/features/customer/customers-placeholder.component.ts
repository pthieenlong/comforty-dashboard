import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PlaceholderPageComponent } from '@/shared/ui';

@Component({
  selector: 'app-customers-placeholder',
  imports: [PlaceholderPageComponent],
  template: `
    <app-placeholder-page
      title="Khách hàng"
      description="Danh sách khách hàng, lịch sử mua, loyalty"
      [breadcrumb]="[{ label: 'Trang chủ', to: '/dashboard' }, { label: 'Khách hàng' }]"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomersPlaceholderComponent {}
