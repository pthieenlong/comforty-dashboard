import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideBuilding2, LucideEdit, LucideStore, LucideWarehouse } from '@lucide/angular';
import {
  BadgeComponent,
  BreadcrumbComponent,
  ButtonComponent,
  CardComponent,
  DescriptionListComponent,
  type DescriptionItem,
  EmptyStateComponent,
  IconComponent,
  TabPanelDirective,
  TabsComponent,
  TagComponent,
} from '@/shared/ui';
import { findTenant } from '@/core/tenant/tenant.mock';
import type { ITenant } from '@/core/tenant/tenant.types';
import { findWarehousesByTenant } from '@/core/warehouse/warehouse.mock';
import { findRole, USERS } from '@/features/iam/iam.mock';

@Component({
  selector: 'app-tenant-detail',
  imports: [
    BadgeComponent,
    BreadcrumbComponent,
    ButtonComponent,
    CardComponent,
    DatePipe,
    DescriptionListComponent,
    EmptyStateComponent,
    IconComponent,
    RouterLink,
    TabPanelDirective,
    TabsComponent,
    TagComponent,
  ],
  template: `
    @if (tenant(); as t) {
      <div class="space-y-6">
        <app-breadcrumb [items]="breadcrumb()" />

        <app-card padding="lg">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div class="flex items-start gap-4">
              <div [class]="iconWrapClass(t)">
                <app-icon [icon]="t.type === 'hq' ? buildingIcon : storeIcon" size="lg" />
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h1 class="text-2xl font-bold text-slate-900">{{ t.name }}</h1>
                  @if (t.type === 'hq') {
                    <app-badge variant="primary" size="sm">HQ</app-badge>
                  }
                </div>
                <p class="mt-1 text-sm text-slate-500 font-mono">{{ t.code }}</p>
                <div class="mt-2 flex items-center gap-2">
                  @if (t.status === 'active') {
                    <app-badge variant="success" [dot]="true">Đang hoạt động</app-badge>
                  } @else {
                    <app-badge variant="neutral" [dot]="true">Tạm ngưng</app-badge>
                  }
                  <span class="text-xs text-slate-500">
                    Khai trương: {{ t.openedAt | date: 'dd/MM/yyyy' }}
                  </span>
                </div>
              </div>
            </div>
            <div class="flex gap-2">
              <a [routerLink]="['/tenants', t.id, 'edit']">
                <app-button variant="primary">
                  <app-icon [icon]="editIcon" size="md" />
                  Chỉnh sửa
                </app-button>
              </a>
            </div>
          </div>
        </app-card>

        <app-tabs [(activeTab)]="activeTab">
          <ng-template appTabPanel="info" appTabPanelLabel="Thông tin">
            <app-card padding="lg">
              <app-description-list [items]="infoItems()" [columns]="2" />
            </app-card>
          </ng-template>

          <ng-template
            appTabPanel="users"
            [appTabPanelLabel]="'Người dùng (' + usersOfTenant().length + ')'"
          >
            @if (usersOfTenant().length === 0) {
              <app-card padding="lg">
                <app-empty-state
                  title="Chưa có người dùng"
                  description="Chi nhánh này chưa có người dùng nào được gán."
                />
              </app-card>
            } @else {
              <div class="space-y-3">
                @for (entry of usersOfTenant(); track entry.user.id) {
                  <app-card padding="md">
                    <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <a
                          [routerLink]="['/iam/users', entry.user.id]"
                          class="font-semibold text-slate-900 hover:text-indigo-600"
                        >
                          {{ entry.user.fullName }}
                        </a>
                        <p class="text-xs text-slate-500">{{ entry.user.email }}</p>
                      </div>
                      <div class="flex flex-wrap gap-1">
                        @for (rid of entry.roleIds; track rid) {
                          <app-tag variant="primary">{{ roleName(rid) }}</app-tag>
                        }
                      </div>
                    </div>
                  </app-card>
                }
              </div>
            }
          </ng-template>

          <ng-template
            appTabPanel="warehouses"
            [appTabPanelLabel]="'Kho (' + warehouses().length + ')'"
          >
            @if (warehouses().length === 0) {
              <app-card padding="lg">
                <app-empty-state
                  title="Chưa có kho"
                  description="Chi nhánh này chưa có kho nào được khai báo."
                />
              </app-card>
            } @else {
              <div class="grid gap-3 sm:grid-cols-2">
                @for (wh of warehouses(); track wh.id) {
                  <app-card padding="md">
                    <div class="flex items-start gap-3">
                      <div class="rounded-md bg-amber-50 p-2 text-amber-600">
                        <app-icon [icon]="warehouseIcon" size="lg" />
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2">
                          <h3 class="font-semibold text-slate-900 truncate">{{ wh.name }}</h3>
                          @if (wh.isPrimary) {
                            <app-badge variant="info" size="sm">Chính</app-badge>
                          }
                        </div>
                        <p class="mt-0.5 text-xs text-slate-500 font-mono">{{ wh.code }}</p>
                        <p class="mt-2 text-xs text-slate-600">{{ wh.address }}</p>
                        <div class="mt-2 text-xs text-slate-500">
                          Phụ trách: <strong class="text-slate-900">{{ wh.managerName }}</strong>
                          · Sức chứa:
                          <strong class="text-slate-900">{{ wh.capacity }}</strong>
                          m³
                        </div>
                      </div>
                    </div>
                  </app-card>
                }
              </div>
            }
          </ng-template>
        </app-tabs>
      </div>
    } @else {
      <div class="rounded-lg border border-slate-200 bg-white p-8 text-center">
        <h2 class="text-lg font-semibold text-slate-900">Không tìm thấy chi nhánh</h2>
        <p class="mt-1 text-sm text-slate-500">Chi nhánh có thể đã bị xóa hoặc ID không hợp lệ.</p>
        <a routerLink="/tenants" class="mt-4 inline-block">
          <app-button variant="primary">Quay lại danh sách</app-button>
        </a>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TenantDetailComponent {
  readonly id = input.required<string>();

  protected readonly activeTab = signal('info');
  protected readonly buildingIcon = LucideBuilding2.icon;
  protected readonly storeIcon = LucideStore.icon;
  protected readonly editIcon = LucideEdit.icon;
  protected readonly warehouseIcon = LucideWarehouse.icon;

  protected readonly tenant = computed(() => findTenant(this.id()));

  protected readonly breadcrumb = computed(() => [
    { label: 'Hệ thống' },
    { label: 'Chi nhánh', to: '/tenants' },
    { label: this.tenant()?.name ?? this.id() },
  ]);

  protected readonly infoItems = computed<DescriptionItem[]>(() => {
    const t = this.tenant();
    if (!t) return [];
    return [
      { label: 'Mã chi nhánh', value: t.code },
      { label: 'Loại', value: t.type === 'hq' ? 'Trụ sở chính' : 'Chi nhánh bán lẻ' },
      { label: 'Thành phố', value: t.city },
      { label: 'Địa chỉ', value: t.address },
      { label: 'Số điện thoại', value: t.phone },
      { label: 'Email', value: t.email },
      { label: 'Quản lý', value: t.managerName },
      { label: 'Mã chi nhánh nội bộ', value: t.id, hint: 'Dùng cho API và audit log' },
    ];
  });

  protected readonly usersOfTenant = computed(() => {
    const tid = this.id();
    return USERS.flatMap((user) => {
      const assignment = user.assignments.find((a) => a.tenantId === tid);
      return assignment ? [{ user, roleIds: assignment.roleIds }] : [];
    });
  });

  protected readonly warehouses = computed(() => findWarehousesByTenant(this.id()));

  protected roleName(roleId: string): string {
    return findRole(roleId)?.name ?? roleId;
  }

  protected iconWrapClass(t: ITenant): string {
    return t.type === 'hq'
      ? 'rounded-md bg-indigo-50 p-3 text-indigo-600'
      : 'rounded-md bg-slate-100 p-3 text-slate-600';
  }
}
