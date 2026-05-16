import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type DividerOrientation = 'horizontal' | 'vertical';

@Component({
  selector: 'app-divider',
  template: `
    <div [class]="classes()" role="separator" [attr.aria-orientation]="orientation()"></div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
})
export class DividerComponent {
  readonly orientation = input<DividerOrientation>('horizontal');

  protected readonly classes = computed(() =>
    this.orientation() === 'horizontal'
      ? 'w-full border-t border-slate-200'
      : 'h-full border-l border-slate-200',
  );
}
