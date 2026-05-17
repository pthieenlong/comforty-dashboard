import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideChevronRight } from '@lucide/angular';
import { IconComponent } from '@/shared/ui/icon/icon.component';

export interface BreadcrumbItem {
  label: string;
  to?: string | string[];
}

@Component({
  selector: 'app-breadcrumb',
  imports: [IconComponent, RouterLink],
  template: `
    <nav aria-label="Breadcrumb">
      <ol class="flex flex-wrap items-center gap-1 text-sm text-slate-500">
        @for (item of items(); track $index; let last = $last) {
          <li class="inline-flex items-center gap-1">
            @if (item.to && !last) {
              <a
                [routerLink]="item.to"
                class="hover:text-indigo-600 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 rounded-sm"
              >
                {{ item.label }}
              </a>
            } @else {
              <span
                [class.text-slate-900]="last"
                [class.font-medium]="last"
                [attr.aria-current]="last ? 'page' : null"
              >
                {{ item.label }}
              </span>
            }
            @if (!last) {
              <app-icon [icon]="chevronIcon" size="sm" />
            }
          </li>
        }
      </ol>
    </nav>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class BreadcrumbComponent {
  readonly items = input.required<BreadcrumbItem[]>();

  protected readonly chevronIcon = LucideChevronRight.icon;
}
