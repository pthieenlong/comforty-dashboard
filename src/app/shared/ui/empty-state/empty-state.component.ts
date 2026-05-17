import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { type LucideIconData, LucideInbox } from '@lucide/angular';
import { IconComponent } from '@/shared/ui/icon/icon.component';

@Component({
  selector: 'app-empty-state',
  imports: [IconComponent],
  template: `
    <div class="flex flex-col items-center justify-center text-center py-12 px-4">
      <div class="rounded-full bg-slate-100 p-3 text-slate-400">
        <app-icon [icon]="iconData()" size="xl" />
      </div>
      <h3 class="mt-4 text-sm font-semibold text-slate-900">{{ title() }}</h3>
      @if (description()) {
        <p class="mt-1 text-sm text-slate-500 max-w-sm">{{ description() }}</p>
      }
      <div class="mt-4 flex gap-2">
        <ng-content />
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class EmptyStateComponent {
  readonly title = input.required<string>();
  readonly description = input<string>('');
  readonly icon = input<LucideIconData | null>(null);

  protected readonly iconData = computed(() => this.icon() ?? LucideInbox.icon);
}
