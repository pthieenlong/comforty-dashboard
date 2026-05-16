import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { type LucideIconInput, LucideDynamicIcon } from '@lucide/angular';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const SIZE_PX: Record<IconSize, number> = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
};

@Component({
  selector: 'app-icon',
  imports: [LucideDynamicIcon],
  template: `
    <svg
      [lucideIcon]="icon()"
      [size]="pixels()"
      [strokeWidth]="strokeWidth()"
      [attr.aria-hidden]="ariaHidden() ? 'true' : null"
      [attr.aria-label]="ariaLabel()"
      [attr.role]="ariaLabel() ? 'img' : null"
    ></svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex shrink-0' },
})
export class IconComponent {
  readonly icon = input.required<LucideIconInput>();
  readonly size = input<IconSize>('md');
  readonly strokeWidth = input<number>(2);
  readonly ariaLabel = input<string | null>(null);
  readonly ariaHidden = input<boolean>(true);

  protected readonly pixels = computed(() => SIZE_PX[this.size()]);
}
