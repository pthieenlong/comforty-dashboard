import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { LucideChevronsLeft, LucideChevronsRight, LucideX } from '@lucide/angular';
import { ButtonComponent, IconComponent, NavLinkComponent, TooltipDirective } from '@/shared/ui';
import { SIDEBAR_NAV } from './sidebar-nav.config';

@Component({
  selector: 'app-sidebar',
  imports: [ButtonComponent, IconComponent, NavLinkComponent, TooltipDirective],
  template: `
    <!-- Mobile backdrop -->
    @if (mobileOpen()) {
      <div
        class="fixed inset-0 z-30 bg-slate-900/50 lg:hidden"
        aria-hidden="true"
        (click)="closeMobile.emit()"
      ></div>
    }

    <aside [class]="asideClasses()" [attr.aria-hidden]="isHiddenOnMobile()">
      <div class="flex h-14 items-center gap-2 border-b border-slate-200 px-4">
        @if (!collapsed() || mobileOpen()) {
          <span class="text-lg font-semibold text-slate-900 truncate">Comforty</span>
        }
        <div class="ml-auto">
          <!-- Mobile close button -->
          <app-button variant="ghost" size="sm" class="lg:hidden" (click)="closeMobile.emit()">
            <app-icon [icon]="closeIcon" size="md" />
          </app-button>
          <!-- Desktop collapse toggle -->
          <app-button
            variant="ghost"
            size="sm"
            class="hidden lg:inline-flex"
            [appTooltip]="collapsed() ? 'Mở rộng' : 'Thu gọn'"
            appTooltipPosition="right"
            (click)="toggleCollapse.emit()"
          >
            <app-icon [icon]="collapsed() ? expandIcon : collapseIcon" size="md" />
          </app-button>
        </div>
      </div>

      <nav class="flex-1 overflow-y-auto py-3" aria-label="Điều hướng chính">
        @for (group of nav; track $index) {
          <div class="px-3 mb-4">
            @if (group.label && (!collapsed() || mobileOpen())) {
              <div class="px-3 mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                {{ group.label }}
              </div>
            }
            <ul class="flex flex-col gap-0.5">
              @for (item of group.items; track item.to) {
                <li>
                  <app-nav-link
                    [to]="item.to"
                    [collapsed]="isItemCollapsed()"
                    [appTooltip]="isItemCollapsed() ? item.label : ''"
                    appTooltipPosition="right"
                    (click)="onNavClick()"
                  >
                    <app-icon nav-icon [icon]="item.icon" size="lg" />
                    {{ item.label }}
                  </app-nav-link>
                </li>
              }
            </ul>
          </div>
        }
      </nav>
    </aside>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
})
export class SidebarComponent {
  readonly collapsed = input<boolean>(false);
  readonly mobileOpen = input<boolean>(false);
  readonly toggleCollapse = output<void>();
  readonly closeMobile = output<void>();

  protected readonly nav = SIDEBAR_NAV;
  protected readonly collapseIcon = LucideChevronsLeft.icon;
  protected readonly expandIcon = LucideChevronsRight.icon;
  protected readonly closeIcon = LucideX.icon;

  protected readonly isItemCollapsed = computed(() => this.collapsed() && !this.mobileOpen());
  protected readonly isHiddenOnMobile = computed(() => (this.mobileOpen() ? null : 'true'));

  protected readonly asideClasses = computed(() => {
    const base =
      'flex flex-col bg-white border-r border-slate-200 transition-[width,transform] duration-200';
    const desktopWidth = this.collapsed() ? 'lg:w-16' : 'lg:w-64';
    const mobile = this.mobileOpen()
      ? 'fixed inset-y-0 left-0 z-40 w-64 translate-x-0 shadow-xl'
      : 'fixed inset-y-0 left-0 z-40 w-64 -translate-x-full lg:translate-x-0';
    const desktop = 'lg:static lg:shadow-none lg:translate-x-0';
    return `${base} ${desktopWidth} ${mobile} ${desktop}`;
  });

  protected onNavClick(): void {
    if (this.mobileOpen()) {
      this.closeMobile.emit();
    }
  }
}
