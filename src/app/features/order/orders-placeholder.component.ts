import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PlaceholderPageComponent } from '@/shared/ui';

@Component({
  selector: 'app-orders-placeholder',
  imports: [PlaceholderPageComponent],
  template: `
    <app-placeholder-page
      title="Đơn hàng"
      description="Quản lý đơn hàng POS và online"
      [breadcrumb]="[{ label: 'Trang chủ', to: '/dashboard' }, { label: 'Đơn hàng' }]"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersPlaceholderComponent {}
