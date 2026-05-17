import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LucideEdit, LucideLock, LucideUnlock } from '@lucide/angular';
import {
  AvatarComponent,
  BadgeComponent,
  BreadcrumbComponent,
  ButtonComponent,
  CardComponent,
  ConfirmDialogService,
  IconComponent,
  TabPanelDirective,
  TabsComponent,
  TagComponent,
  ToastService,
} from '@/shared/ui';
import { findRole, findUser } from '../iam.mock';

@Component({
  selector: 'app-user-detail',
  imports: [
    AvatarComponent,
    BadgeComponent,
    BreadcrumbComponent,
    ButtonComponent,
    CardComponent,
    DatePipe,
    IconComponent,
    RouterLink,
    TabPanelDirective,
    TabsComponent,
    TagComponent,
  ],
  template: `
    @if (user(); as u) {
      <div class="space-y-6">
        <app-breadcrumb [items]="breadcrumb()" />

        <app-card padding="lg">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex items-center gap-4">
              <app-avatar [name]="u.fullName" size="xl" />
              <div>
                <h1 class="text-2xl font-bold text-slate-900">{{ u.fullName }}</h1>
                <p class="text-sm text-slate-500">{{ u.email }}</p>
                <div class="mt-2 flex items-center gap-2">
                  @if (u.active) {
                    <app-badge variant="success" [dot]="true">Hoạt động</app-badge>
                  } @else {
                    <app-badge variant="neutral" [dot]="true">Đã khóa</app-badge>
                  }
                  <span class="text-xs text-slate-500">
                    Tham gia: {{ u.createdAt | date: 'dd/MM/yyyy' }}
                  </span>
                </div>
              </div>
            </div>
            <div class="flex gap-2">
              <app-button
                [variant]="u.active ? 'secondary' : 'primary'"
                (click)="toggleLock(u.active)"
              >
                <app-icon [icon]="u.active ? lockIcon : unlockIcon" size="md" />
                {{ u.active ? 'Khóa tài khoản' : 'Mở khóa' }}
              </app-button>
              <a [routerLink]="['/iam/users', u.id, 'edit']">
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
              <dl class="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                <div>
                  <dt class="text-xs font-medium uppercase tracking-wide text-slate-500">Email</dt>
                  <dd class="mt-1 text-sm text-slate-900">{{ u.email }}</dd>
                </div>
                <div>
                  <dt class="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Số điện thoại
                  </dt>
                  <dd class="mt-1 text-sm text-slate-900">{{ u.phone || '—' }}</dd>
                </div>
                <div>
                  <dt class="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Lần đăng nhập cuối
                  </dt>
                  <dd class="mt-1 text-sm text-slate-900">
                    @if (u.lastLoginAt) {
                      {{ u.lastLoginAt | date: 'dd/MM/yyyy HH:mm' }}
                    } @else {
                      Chưa đăng nhập
                    }
                  </dd>
                </div>
                <div>
                  <dt class="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Mã người dùng
                  </dt>
                  <dd class="mt-1 text-sm text-slate-900 font-mono">{{ u.id }}</dd>
                </div>
              </dl>
            </app-card>
          </ng-template>

          <ng-template appTabPanel="roles" appTabPanelLabel="Chi nhánh & Vai trò">
            <div class="space-y-3">
              @for (assignment of u.assignments; track assignment.tenantId) {
                <app-card padding="md">
                  <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p class="font-semibold text-slate-900">{{ assignment.tenantName }}</p>
                      <p class="text-xs text-slate-500">{{ assignment.tenantId }}</p>
                    </div>
                    <div class="flex flex-wrap gap-1">
                      @for (rid of assignment.roleIds; track rid) {
                        <app-tag variant="primary">{{ roleName(rid) }}</app-tag>
                      }
                    </div>
                  </div>
                </app-card>
              }
            </div>
          </ng-template>

          <ng-template appTabPanel="activity" appTabPanelLabel="Hoạt động">
            <app-card padding="lg">
              <p class="text-sm text-slate-500">
                Nhật ký hoạt động của người dùng sẽ hiển thị ở đây khi tích hợp Audit log.
              </p>
            </app-card>
          </ng-template>
        </app-tabs>
      </div>
    } @else {
      <div class="rounded-lg border border-slate-200 bg-white p-8 text-center">
        <h2 class="text-lg font-semibold text-slate-900">Không tìm thấy người dùng</h2>
        <p class="mt-1 text-sm text-slate-500">Người dùng có thể đã bị xóa hoặc ID không hợp lệ.</p>
        <a routerLink="/iam/users" class="mt-4 inline-block">
          <app-button variant="primary">Quay lại danh sách</app-button>
        </a>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDetailComponent {
  private readonly toast = inject(ToastService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly router = inject(Router);

  readonly id = input.required<string>();

  protected readonly activeTab = signal('info');
  protected readonly editIcon = LucideEdit.icon;
  protected readonly lockIcon = LucideLock.icon;
  protected readonly unlockIcon = LucideUnlock.icon;

  protected readonly user = computed(() => findUser(this.id()));

  protected readonly breadcrumb = computed(() => [
    { label: 'Hệ thống' },
    { label: 'Người dùng', to: '/iam/users' },
    { label: this.user()?.fullName ?? this.id() },
  ]);

  protected roleName(roleId: string): string {
    return findRole(roleId)?.name ?? roleId;
  }

  protected async toggleLock(currentlyActive: boolean): Promise<void> {
    const action = currentlyActive ? 'Khóa' : 'Mở khóa';
    const ok = await this.confirmDialog.confirm({
      title: `${action} tài khoản`,
      message: `Bạn có chắc muốn ${action.toLowerCase()} tài khoản này?`,
      confirmText: action,
      variant: currentlyActive ? 'danger' : 'primary',
    });
    if (!ok) return;
    this.toast.success(`Đã ${action.toLowerCase()} tài khoản`);
  }
}
