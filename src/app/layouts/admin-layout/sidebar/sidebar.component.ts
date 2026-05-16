import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { LucideChevronsLeft, LucideChevronsRight } from '@lucide/angular';
import { ButtonComponent, IconComponent, NavLinkComponent, TooltipDirective } from '@/shared/ui';
import { SIDEBAR_NAV } from './sidebar-nav.config';

@Component({
  selector: 'app-sidebar',
  imports: [ButtonComponent, IconComponent, NavLinkComponent, TooltipDirective],
  template: `
    <aside [class]="asideClasses()">
      <div class="flex h-14 items-center gap-2 border-b border-slate-200 px-4">
        @if (!collapsed()) {
          <span class="text-lg font-semibold text-slate-900 truncate">Comforty</span>
        }
        <div class="ml-auto">
          <app-button
            variant="ghost"
            size="sm"
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
            @if (group.label && !collapsed()) {
              <div class="px-3 mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                {{ group.label }}
              </div>
            }
            <ul class="flex flex-col gap-0.5">
              @for (item of group.items; track item.to) {
                <li>
                  <app-nav-link
                    [to]="item.to"
                    [collapsed]="collapsed()"
                    [appTooltip]="collapsed() ? item.label : ''"
                    appTooltipPosition="right"
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
  readonly toggleCollapse = output<void>();

  protected readonly nav = SIDEBAR_NAV;
  protected readonly collapseIcon = LucideChevronsLeft.icon;
  protected readonly expandIcon = LucideChevronsRight.icon;

  protected readonly asideClasses = computed(() => {
    const base = 'flex flex-col bg-white border-r border-slate-200 transition-[width] duration-200';
    return `${base} ${this.collapsed() ? 'w-16' : 'w-64'}`;
  });
}
