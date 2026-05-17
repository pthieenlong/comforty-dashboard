import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { BreadcrumbComponent, CardComponent, CardHeaderComponent, TagComponent } from '@/shared/ui';
import { PERMISSIONS, RESOURCE_LIST, getResourceLabel } from '../iam.mock';
import { type IPermission, type PermissionAction } from '../iam.types';

const ACTION_VARIANT: Record<PermissionAction, 'success' | 'info' | 'warning' | 'danger'> = {
  create: 'success',
  read: 'info',
  update: 'warning',
  delete: 'danger',
};

@Component({
  selector: 'app-permissions-list',
  imports: [BreadcrumbComponent, CardComponent, CardHeaderComponent, TagComponent],
  template: `
    <div class="space-y-6">
      <div>
        <app-breadcrumb [items]="breadcrumb" />
        <h1 class="mt-2 text-2xl font-bold text-slate-900">Quyền hạn</h1>
        <p class="mt-1 text-sm text-slate-500">
          {{ totalCount }} quyền, tổ chức theo {{ resources.length }} tài nguyên. Đây là danh sách
          tĩnh do hệ thống định nghĩa, chỉ có thể xem.
        </p>
      </div>

      <div class="space-y-4">
        @for (group of grouped(); track group.key) {
          <app-card padding="md">
            <app-card-header [title]="group.label" />
            <div class="flex flex-wrap gap-2">
              @for (perm of group.items; track perm.id) {
                <app-tag [variant]="variantOf(perm.action)" [title]="perm.description">
                  {{ perm.id }}
                </app-tag>
              }
            </div>
          </app-card>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PermissionsListComponent {
  protected readonly breadcrumb = [{ label: 'Hệ thống' }, { label: 'Quyền hạn' }];
  protected readonly resources = RESOURCE_LIST;
  protected readonly totalCount = PERMISSIONS.length;

  protected readonly grouped = computed(() =>
    this.resources.map((r) => ({
      key: r.key,
      label: r.label,
      items: PERMISSIONS.filter((p) => p.resource === r.key),
    })),
  );

  protected variantOf(action: PermissionAction): 'success' | 'info' | 'warning' | 'danger' {
    return ACTION_VARIANT[action];
  }

  protected resourceLabel(key: string): string {
    return getResourceLabel(key);
  }

  protected readonly _allPermissions: IPermission[] = PERMISSIONS;
}
