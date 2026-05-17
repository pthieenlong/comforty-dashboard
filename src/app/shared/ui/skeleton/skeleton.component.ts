import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type SkeletonShape = 'rect' | 'circle' | 'text';

@Component({
  selector: 'app-skeleton',
  template: `<span [class]="classes()" [style.width]="width()" [style.height]="height()"></span>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'inline-flex w-full',
    role: 'status',
    'aria-label': 'Đang tải',
  },
})
export class SkeletonComponent {
  readonly shape = input<SkeletonShape>('rect');
  readonly width = input<string>('100%');
  readonly height = input<string>('1rem');

  protected readonly classes = computed(() => {
    const base = 'block bg-slate-200 animate-pulse';
    const radius =
      this.shape() === 'circle'
        ? 'rounded-full'
        : this.shape() === 'text'
          ? 'rounded-sm'
          : 'rounded-md';
    return `${base} ${radius}`;
  });
}
