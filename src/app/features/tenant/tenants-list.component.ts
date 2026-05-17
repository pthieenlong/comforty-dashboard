import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  LucideBuilding2,
  LucideMapPin,
  LucideStore,
  LucideUsers,
  LucideWarehouse,
} from '@lucide/angular';
import {
  BadgeComponent,
  CardComponent,
  IconComponent,
  PageHeaderComponent,
  SearchInputComponent,
  SelectComponent,
  type SelectOption,
} from '@/shared/ui';
import { TenantStore } from '@/core/tenant/tenant.store';
import type { ITenant, TenantStatus, TenantType } from '@/core/tenant/tenant.types';

const TYPE_OPTIONS: SelectOption<string>[] = [
  { value: '', label: 'Tất cả loại' },
  { value: 'hq', label: 'Trụ sở chính' },
  { value: 'store', label: 'Chi nhánh' },
];

const STATUS_OPTIONS: SelectOption<string>[] = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'inactive', label: 'Tạm ngưng' },
];

@Component({
  selector: 'app-tenants-list',
  imports: [
    BadgeComponent,
    CardComponent,
    FormsModule,
    IconComponent,
    PageHeaderComponent,
    RouterLink,
    SearchInputComponent,
    SelectComponent,
  ],
  template: `
    <div class="space-y-6">
      <app-page-header
        title="Chi nhánh"
        description="Quản lý 6 đơn vị: 1 trụ sở chính và 5 chi nhánh bán lẻ."
        [breadcrumb]="breadcrumb"
      />

      <div class="grid gap-3 sm:grid-cols-3">
        <app-search-input
          id="tenant-search"
          placeholder="Tìm theo tên, mã, thành phố..."
          [(ngModel)]="searchTerm"
        />
        <app-select
          id="tenant-type"
          [options]="typeOptions"
          placeholder="Loại"
          [(ngModel)]="typeFilter"
        />
        <app-select
          id="tenant-status"
          [options]="statusOptions"
          placeholder="Trạng thái"
          [(ngModel)]="statusFilter"
        />
      </div>

      @if (filtered().length === 0) {
        <app-card padding="lg">
          <p class="text-center text-sm text-slate-500">Không có chi nhánh nào khớp với bộ lọc.</p>
        </app-card>
      } @else {
        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          @for (tenant of filtered(); track tenant.id) {
            <a [routerLink]="['/tenants', tenant.id]" class="block">
              <app-card padding="md" [elevated]="true">
                <div class="flex items-start gap-3">
                  <div [class]="iconWrapClass(tenant.type)">
                    <app-icon [icon]="tenant.type === 'hq' ? buildingIcon : storeIcon" size="lg" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <h3 class="font-semibold text-slate-900 truncate">{{ tenant.name }}</h3>
                      @if (tenant.type === 'hq') {
                        <app-badge variant="primary" size="sm">HQ</app-badge>
                      }
                    </div>
                    <p class="mt-0.5 text-xs text-slate-500 font-mono">{{ tenant.code }}</p>

                    <div class="mt-3 flex items-center gap-1.5 text-xs text-slate-600">
                      <app-icon [icon]="mapPinIcon" size="xs" />
                      <span class="truncate">{{ tenant.city }}</span>
                    </div>

                    <div class="mt-3 flex items-center gap-4 text-xs text-slate-500">
                      <span class="flex items-center gap-1">
                        <app-icon [icon]="usersIcon" size="xs" />
                        <strong class="text-slate-900">{{ tenant.userCount }}</strong>
                        người dùng
                      </span>
                      <span class="flex items-center gap-1">
                        <app-icon [icon]="warehouseIcon" size="xs" />
                        <strong class="text-slate-900">{{ tenant.warehouseCount }}</strong>
                        kho
                      </span>
                    </div>

                    <div class="mt-3">
                      @if (tenant.status === 'active') {
                        <app-badge variant="success" [dot]="true">Đang hoạt động</app-badge>
                      } @else {
                        <app-badge variant="neutral" [dot]="true">Tạm ngưng</app-badge>
                      }
                    </div>
                  </div>
                </div>
              </app-card>
            </a>
          }
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TenantsListComponent {
  private readonly tenantStore = inject(TenantStore);

  protected readonly breadcrumb = [{ label: 'Hệ thống' }, { label: 'Chi nhánh' }];

  protected readonly buildingIcon = LucideBuilding2.icon;
  protected readonly storeIcon = LucideStore.icon;
  protected readonly mapPinIcon = LucideMapPin.icon;
  protected readonly usersIcon = LucideUsers.icon;
  protected readonly warehouseIcon = LucideWarehouse.icon;

  protected readonly searchTerm = signal('');
  protected readonly typeFilter = signal<string>('');
  protected readonly statusFilter = signal<string>('');

  protected readonly typeOptions = TYPE_OPTIONS;
  protected readonly statusOptions = STATUS_OPTIONS;

  protected readonly filtered = computed<ITenant[]>(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const type = this.typeFilter() as TenantType | '';
    const status = this.statusFilter() as TenantStatus | '';

    return this.tenantStore.tenants().filter((t) => {
      if (type && t.type !== type) return false;
      if (status && t.status !== status) return false;
      if (!term) return true;
      return (
        t.name.toLowerCase().includes(term) ||
        t.code.toLowerCase().includes(term) ||
        t.city.toLowerCase().includes(term)
      );
    });
  });

  protected iconWrapClass(type: TenantType): string {
    return type === 'hq'
      ? 'rounded-md bg-indigo-50 p-2 text-indigo-600'
      : 'rounded-md bg-slate-100 p-2 text-slate-600';
  }
}
