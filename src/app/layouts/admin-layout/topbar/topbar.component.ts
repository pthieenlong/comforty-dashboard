import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  LucideBell,
  LucideCheck,
  LucideChevronDown,
  LucideLogOut,
  LucideMegaphone,
  LucideMenu,
  LucideMessageSquare,
  LucidePackage,
  LucideSettings,
  LucideShoppingBag,
  LucideStore,
  LucideTriangleAlert,
  LucideUser,
  LucideUserCog,
  type LucideIconData,
} from '@lucide/angular';
import { AuthStore } from '@/core/auth/auth.store';
import type { NotificationType } from '@/core/notification/notification.types';
import { NotificationStore } from '@/core/notification/notification.store';
import { TenantStore } from '@/core/tenant/tenant.store';
import { RelativeTimePipe } from '@/shared/pipes';
import {
  AvatarComponent,
  BadgeComponent,
  ButtonComponent,
  DividerComponent,
  DropdownComponent,
  DropdownItemComponent,
  DropdownTriggerDirective,
  IconComponent,
  ToastService,
  TooltipDirective,
} from '@/shared/ui';

const NOTI_ICON_MAP: Record<NotificationType, LucideIconData> = {
  order: LucideShoppingBag.icon,
  stock: LucidePackage.icon,
  system: LucideTriangleAlert.icon,
  user: LucideUser.icon,
  marketing: LucideMegaphone.icon,
  hr: LucideUserCog.icon,
  crm: LucideMessageSquare.icon,
};

@Component({
  selector: 'app-topbar',
  imports: [
    AvatarComponent,
    BadgeComponent,
    ButtonComponent,
    DividerComponent,
    DropdownComponent,
    DropdownItemComponent,
    DropdownTriggerDirective,
    IconComponent,
    RelativeTimePipe,
    RouterLink,
    TooltipDirective,
  ],
  template: `
    <header
      class="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-slate-200 bg-white px-3 sm:px-4"
    >
      <!-- Hamburger (mobile only) -->
      <app-button
        variant="ghost"
        size="sm"
        class="lg:hidden"
        appTooltip="Mở menu"
        appTooltipPosition="bottom"
        (click)="toggleMobileSidebar.emit()"
      >
        <app-icon [icon]="menuIcon" size="lg" />
      </app-button>

      <!-- Tenant switcher -->
      <app-dropdown align="start">
        <button
          appDropdownTrigger
          type="button"
          [disabled]="tenantStore.switching()"
          class="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
        >
          <app-icon [icon]="storeIcon" size="md" />
          <span class="hidden sm:inline">{{ tenantStore.currentTenant().name }}</span>
          <app-icon [icon]="chevronIcon" size="sm" />
        </button>
        @for (t of tenantStore.tenants(); track t.id) {
          <app-dropdown-item (click)="onSwitchTenant(t.id)">
            <span class="flex flex-col items-start leading-tight">
              <span class="text-sm">{{ t.name }}</span>
              <span class="text-xs text-slate-500">{{ t.city }}</span>
            </span>
            @if (t.id === tenantStore.currentTenant().id) {
              <app-icon [icon]="checkIcon" size="sm" class="ml-auto text-indigo-600" />
            }
          </app-dropdown-item>
        }
      </app-dropdown>

      <div class="flex-1"></div>

      <!-- Notifications -->
      <app-dropdown align="end">
        <button
          appDropdownTrigger
          type="button"
          class="relative inline-flex items-center justify-center w-9 h-9 rounded-md text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          appTooltip="Thông báo"
          appTooltipPosition="bottom"
        >
          <app-icon [icon]="bellIcon" size="lg" />
          @if (notificationStore.unreadCount() > 0) {
            <span class="absolute -top-0.5 -right-0.5">
              <app-badge variant="danger" size="sm">{{
                notificationStore.unreadCount()
              }}</app-badge>
            </span>
          }
        </button>

        <div class="w-[360px] max-w-[calc(100vw-1rem)]">
          <div class="flex items-center justify-between px-4 py-2 border-b border-slate-200">
            <span class="text-sm font-semibold text-slate-900">Thông báo</span>
            @if (notificationStore.unreadCount() > 0) {
              <button
                type="button"
                class="text-xs text-indigo-600 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 rounded-sm"
                (click)="notificationStore.markAllAsRead()"
              >
                Đánh dấu đã đọc
              </button>
            }
          </div>

          <ul class="max-h-[400px] overflow-y-auto py-1">
            @for (n of notificationStore.items(); track n.id) {
              <li>
                <a
                  [routerLink]="n.to ?? null"
                  (click)="notificationStore.markAsRead(n.id)"
                  class="flex gap-3 px-4 py-2.5 hover:bg-slate-50 focus-visible:bg-slate-100 focus-visible:outline-none"
                  [class.bg-indigo-50/40]="!n.read"
                >
                  <span
                    class="flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 text-slate-600 shrink-0"
                  >
                    <app-icon [icon]="iconFor(n.type)" size="md" />
                  </span>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-start gap-2">
                      <span class="text-sm font-medium text-slate-900 truncate">{{ n.title }}</span>
                      @if (!n.read) {
                        <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></span>
                      }
                    </div>
                    <p class="text-xs text-slate-600 line-clamp-2 mt-0.5">{{ n.description }}</p>
                    <p class="text-xs text-slate-400 mt-1">{{ n.createdAt | relativeTime }}</p>
                  </div>
                </a>
              </li>
            }
          </ul>

          <div class="border-t border-slate-200 px-4 py-2 text-center">
            <a
              routerLink="/notifications"
              class="text-xs font-medium text-indigo-600 hover:underline"
            >
              Xem tất cả thông báo →
            </a>
          </div>
        </div>
      </app-dropdown>

      <app-divider orientation="vertical" />

      <!-- User menu -->
      <app-dropdown align="end">
        <button
          appDropdownTrigger
          type="button"
          class="inline-flex items-center gap-2 rounded-md p-1 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
        >
          <app-avatar [name]="userName()" size="sm" />
          <div class="hidden sm:flex flex-col items-start leading-tight">
            <span class="text-sm font-medium text-slate-900">{{ userName() }}</span>
            <span class="text-xs text-slate-500">{{ userRole() }}</span>
          </div>
          <app-icon [icon]="chevronIcon" size="sm" />
        </button>
        <app-dropdown-item>
          <app-icon [icon]="userIcon" size="md" />
          Hồ sơ cá nhân
        </app-dropdown-item>
        <app-dropdown-item>
          <app-icon [icon]="settingsIcon" size="md" />
          Cài đặt
        </app-dropdown-item>
        <app-dropdown-item [danger]="true" (click)="onLogout()">
          <app-icon [icon]="logoutIcon" size="md" />
          Đăng xuất
        </app-dropdown-item>
      </app-dropdown>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
})
export class TopbarComponent {
  readonly toggleMobileSidebar = output<void>();

  protected readonly tenantStore = inject(TenantStore);
  protected readonly notificationStore = inject(NotificationStore);
  private readonly authStore = inject(AuthStore);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly userName = computed(
    () => this.authStore.currentUser()?.fullName ?? 'Người dùng',
  );
  protected readonly userRole = computed(() => this.authStore.currentUser()?.roleLabel ?? '');

  protected readonly menuIcon = LucideMenu.icon;
  protected readonly storeIcon = LucideStore.icon;
  protected readonly chevronIcon = LucideChevronDown.icon;
  protected readonly bellIcon = LucideBell.icon;
  protected readonly checkIcon = LucideCheck.icon;
  protected readonly userIcon = LucideUser.icon;
  protected readonly settingsIcon = LucideSettings.icon;
  protected readonly logoutIcon = LucideLogOut.icon;

  protected iconFor(type: NotificationType): LucideIconData {
    return NOTI_ICON_MAP[type];
  }

  protected async onSwitchTenant(id: string): Promise<void> {
    if (id === this.tenantStore.currentTenant().id) return;
    const tenant = await this.tenantStore.switchTenant(id);
    this.toast.success('Đã chuyển chi nhánh', `Bạn đang xem dữ liệu của ${tenant.name}`);
  }

  protected async onLogout(): Promise<void> {
    await this.authStore.logout();
    this.toast.info('Đã đăng xuất');
  }
}
