import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type SpinnerSize = 'sm' | 'md' | 'lg';

const SIZE_CLASSES: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-[3px]',
};

@Component({
  selector: 'app-spinner',
  template: `
    <span
      role="status"
      [attr.aria-label]="label()"
      [class]="classes()"
      class="inline-block animate-spin rounded-full border-current border-t-transparent align-[-2px]"
    ></span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex' },
})
export class SpinnerComponent {
  readonly size = input<SpinnerSize>('md');
  readonly label = input<string>('Đang tải');

  protected readonly classes = computed(() => SIZE_CLASSES[this.size()]);
}
