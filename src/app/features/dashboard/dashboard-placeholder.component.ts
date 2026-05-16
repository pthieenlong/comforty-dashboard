import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideBoxes, LucidePackage, LucideShoppingCart, LucideUsers } from '@lucide/angular';
import { BadgeComponent, CardComponent, CardHeaderComponent, IconComponent } from '@/shared/ui';

@Component({
  selector: 'app-dashboard-placeholder',
  imports: [BadgeComponent, CardComponent, CardHeaderComponent, IconComponent],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Tổng quan</h1>
        <p class="mt-1 text-sm text-slate-500">Số liệu vận hành hôm nay</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        @for (kpi of kpis; track kpi.label) {
          <app-card padding="md" [elevated]="true">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="text-sm text-slate-500">{{ kpi.label }}</p>
                <p class="mt-1 text-2xl font-bold text-slate-900">{{ kpi.value }}</p>
                <app-badge [variant]="kpi.trendVariant" size="sm">{{ kpi.trend }}</app-badge>
              </div>
              <div class="rounded-md bg-indigo-50 p-2 text-indigo-600">
                <app-icon [icon]="kpi.icon" size="xl" />
              </div>
            </div>
          </app-card>
        }
      </div>

      <app-card>
        <app-card-header
          title="Đơn hàng gần đây"
          description="10 đơn hàng mới nhất từ tất cả các kênh"
        />
        <div class="py-12 text-center text-sm text-slate-400">
          (Bảng đơn hàng sẽ được build ở giai đoạn sau)
        </div>
      </app-card>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPlaceholderComponent {
  protected readonly kpis = [
    {
      label: 'Doanh thu hôm nay',
      value: '24.500.000đ',
      trend: '+12% so với hôm qua',
      trendVariant: 'success' as const,
      icon: LucideShoppingCart.icon,
    },
    {
      label: 'Đơn hàng mới',
      value: '47',
      trend: '+5 đơn',
      trendVariant: 'success' as const,
      icon: LucidePackage.icon,
    },
    {
      label: 'Khách hàng mới',
      value: '8',
      trend: 'Bình thường',
      trendVariant: 'neutral' as const,
      icon: LucideUsers.icon,
    },
    {
      label: 'Sản phẩm sắp hết',
      value: '12',
      trend: 'Cần nhập thêm',
      trendVariant: 'warning' as const,
      icon: LucideBoxes.icon,
    },
  ];
}
