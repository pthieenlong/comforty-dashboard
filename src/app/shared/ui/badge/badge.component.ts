import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type BadgeVariant = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
export type BadgeSize = 'sm' | 'md';

const VARIANT: Record<BadgeVariant, string> = {
  neutral: 'bg-slate-100 text-slate-700 ring-slate-200',
  primary: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  success: 'bg-green-50 text-green-700 ring-green-200',
  warning: 'bg-amber-50 text-amber-800 ring-amber-200',
  danger: 'bg-red-50 text-red-700 ring-red-200',
  info: 'bg-sky-50 text-sky-700 ring-sky-200',
};

const SIZE: Record<BadgeSize, string> = {
  sm: 'text-xs px-1.5 py-0.5',
  md: 'text-xs px-2 py-1',
};

@Component({
  selector: 'app-badge',
  template: `
    <span [class]="classes()">
      @if (dot()) {
        <span [class]="dotClasses()" aria-hidden="true"></span>
      }
      <ng-content />
    </span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex' },
})
export class BadgeComponent {
  readonly variant = input<BadgeVariant>('neutral');
  readonly size = input<BadgeSize>('md');
  readonly dot = input<boolean>(false);

  protected readonly classes = computed(
    () =>
      'inline-flex items-center gap-1 font-medium rounded-full ring-1 ring-inset ' +
      `${VARIANT[this.variant()]} ${SIZE[this.size()]}`,
  );

  protected readonly dotClasses = computed(() => {
    const dotColor: Record<BadgeVariant, string> = {
      neutral: 'bg-slate-400',
      primary: 'bg-indigo-500',
      success: 'bg-green-500',
      warning: 'bg-amber-500',
      danger: 'bg-red-500',
      info: 'bg-sky-500',
    };
    return `inline-block h-1.5 w-1.5 rounded-full ${dotColor[this.variant()]}`;
  });
}
