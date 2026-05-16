import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  LucideBell,
  LucideChevronDown,
  LucideLogOut,
  LucideSettings,
  LucideStore,
  LucideUser,
} from '@lucide/angular';
import {
  AvatarComponent,
  BadgeComponent,
  ButtonComponent,
  DividerComponent,
  DropdownComponent,
  DropdownItemComponent,
  DropdownTriggerDirective,
  IconComponent,
  TooltipDirective,
} from '@/shared/ui';

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
    TooltipDirective,
  ],
  template: `
    <header
      class="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-slate-200 bg-white px-4"
    >
      <!-- Tenant switcher -->
      <app-dropdown align="start">
        <button
          appDropdownTrigger
          type="button"
          class="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
        >
          <app-icon [icon]="storeIcon" size="md" />
          <span class="hidden sm:inline">Chi nhánh Quận 1</span>
          <app-icon [icon]="chevronIcon" size="sm" />
        </button>
        <app-dropdown-item>HQ — Trụ sở chính</app-dropdown-item>
        <app-dropdown-item>Chi nhánh Quận 1</app-dropdown-item>
        <app-dropdown-item>Chi nhánh Quận 7</app-dropdown-item>
        <app-dropdown-item>Chi nhánh Thủ Đức</app-dropdown-item>
        <app-dropdown-item>Chi nhánh Hoàn Kiếm</app-dropdown-item>
        <app-dropdown-item>Chi nhánh Hải Châu</app-dropdown-item>
      </app-dropdown>

      <div class="flex-1"></div>

      <!-- Notification -->
      <div class="relative">
        <app-button variant="ghost" size="sm" appTooltip="Thông báo" appTooltipPosition="bottom">
          <app-icon [icon]="bellIcon" size="lg" />
        </app-button>
        <span class="absolute -top-0.5 -right-0.5">
          <app-badge variant="danger" size="sm">3</app-badge>
        </span>
      </div>

      <app-divider orientation="vertical" />

      <!-- User menu -->
      <app-dropdown align="end">
        <button
          appDropdownTrigger
          type="button"
          class="inline-flex items-center gap-2 rounded-md p-1 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
        >
          <app-avatar name="Phạm Thiện Long" size="sm" />
          <div class="hidden sm:flex flex-col items-start leading-tight">
            <span class="text-sm font-medium text-slate-900">Phạm Thiện Long</span>
            <span class="text-xs text-slate-500">Store Manager</span>
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
        <app-dropdown-item [danger]="true">
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
  protected readonly storeIcon = LucideStore.icon;
  protected readonly chevronIcon = LucideChevronDown.icon;
  protected readonly bellIcon = LucideBell.icon;
  protected readonly userIcon = LucideUser.icon;
  protected readonly settingsIcon = LucideSettings.icon;
  protected readonly logoutIcon = LucideLogOut.icon;
}
