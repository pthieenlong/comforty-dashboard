import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PlaceholderPageComponent } from '@/shared/ui';

@Component({
  selector: 'app-categories-placeholder',
  imports: [PlaceholderPageComponent],
  template: `
    <app-placeholder-page
      title="Danh mục"
      description="Cây danh mục 3 cấp của catalog"
      [breadcrumb]="[
        { label: 'Trang chủ', to: '/dashboard' },
        { label: 'Sản phẩm' },
        { label: 'Danh mục' },
      ]"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriesPlaceholderComponent {}
