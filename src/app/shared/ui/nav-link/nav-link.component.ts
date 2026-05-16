import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-nav-link',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <a
      [routerLink]="to()"
      routerLinkActive
      [routerLinkActiveOptions]="{ exact: exact() }"
      #rla="routerLinkActive"
      [class.bg-indigo-50]="rla.isActive"
      [class.text-indigo-700]="rla.isActive"
      [class.font-medium]="rla.isActive"
      [class.text-slate-700]="!rla.isActive"
      class="group flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-slate-100 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
      [attr.aria-current]="rla.isActive ? 'page' : null"
    >
      <ng-content select="[nav-icon]" />
      @if (!collapsed()) {
        <span class="truncate flex-1">
          <ng-content />
        </span>
        <ng-content select="[nav-badge]" />
      }
    </a>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class NavLinkComponent {
  readonly to = input.required<string | string[]>();
  readonly exact = input<boolean>(false);
  readonly collapsed = input<boolean>(false);
}
