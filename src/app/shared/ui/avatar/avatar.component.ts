import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const SIZE: Record<AvatarSize, string> = {
  xs: 'h-6 w-6 text-xs',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
};

@Component({
  selector: 'app-avatar',
  template: `
    @if (src()) {
      <img
        [src]="src()"
        [alt]="alt() || name() || 'avatar'"
        [class]="imgClasses()"
        loading="lazy"
        decoding="async"
      />
    } @else {
      <span [class]="fallbackClasses()" [attr.aria-label]="alt() || name() || null">
        {{ initials() }}
      </span>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex shrink-0' },
})
export class AvatarComponent {
  readonly src = input<string | null>(null);
  readonly name = input<string>('');
  readonly alt = input<string>('');
  readonly size = input<AvatarSize>('md');

  protected readonly initials = computed(() => {
    const n = this.name().trim();
    if (!n) return '?';
    const parts = n.split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  });

  protected readonly imgClasses = computed(() => `rounded-full object-cover ${SIZE[this.size()]}`);

  protected readonly fallbackClasses = computed(
    () =>
      `inline-flex items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-medium ${SIZE[this.size()]}`,
  );
}
