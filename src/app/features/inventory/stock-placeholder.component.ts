import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PlaceholderPageComponent } from '@/shared/ui';

@Component({
  selector: 'app-stock-placeholder',
  imports: [PlaceholderPageComponent],
  template: `
    <app-placeholder-page
      title="Tồn kho"
      description="Xem tồn kho theo warehouse"
      [breadcrumb]="[
        { label: 'Trang chủ', to: '/dashboard' },
        { label: 'Kho' },
        { label: 'Tồn kho' },
      ]"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockPlaceholderComponent {}
