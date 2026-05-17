import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideShieldCheck } from '@lucide/angular';
import { BadgeComponent, BreadcrumbComponent, CardComponent, IconComponent } from '@/shared/ui';
import { ROLES, USERS } from '../iam.mock';

@Component({
  selector: 'app-roles-list',
  imports: [BadgeComponent, BreadcrumbComponent, CardComponent, IconComponent, RouterLink],
  template: `
    <div class="space-y-6">
      <div>
        <app-breadcrumb [items]="breadcrumb" />
        <h1 class="mt-2 text-2xl font-bold text-slate-900">Vai trò</h1>
        <p class="mt-1 text-sm text-slate-500">
          Quản lý {{ roles.length }} vai trò và gán quyền truy cập tương ứng.
        </p>
      </div>

      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        @for (role of roles; track role.id) {
          <a [routerLink]="['/iam/roles', role.id]" class="block">
            <app-card padding="md" [elevated]="true">
              <div class="flex items-start gap-3">
                <div class="rounded-md bg-indigo-50 p-2 text-indigo-600">
                  <app-icon [icon]="shieldIcon" size="lg" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <h3 class="font-semibold text-slate-900 truncate">{{ role.name }}</h3>
                    @if (role.isSystem) {
                      <app-badge variant="warning" size="sm">System</app-badge>
                    }
                  </div>
                  <p class="mt-1 text-sm text-slate-500 line-clamp-2">{{ role.description }}</p>
                  <div class="mt-3 flex items-center gap-3 text-xs text-slate-500">
                    <span>
                      <strong class="text-slate-900">{{ role.permissionIds.length }}</strong>
                      quyền
                    </span>
                    <span>·</span>
                    <span>
                      <strong class="text-slate-900">{{ countUsersWithRole(role.id) }}</strong>
                      người dùng
                    </span>
                  </div>
                </div>
              </div>
            </app-card>
          </a>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RolesListComponent {
  protected readonly breadcrumb = [{ label: 'Hệ thống' }, { label: 'Vai trò' }];
  protected readonly roles = ROLES;
  protected readonly shieldIcon = LucideShieldCheck.icon;

  protected countUsersWithRole(roleId: string): number {
    return USERS.filter((u) => u.assignments.some((a) => a.roleIds.includes(roleId))).length;
  }
}
