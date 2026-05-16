import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

const PADDING: Record<CardPadding, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

@Component({
  selector: 'app-card',
  template: `
    <div [class]="classes()">
      <ng-content />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class CardComponent {
  readonly padding = input<CardPadding>('md');
  readonly bordered = input<boolean>(true);
  readonly elevated = input<boolean>(false);

  protected readonly classes = computed(() => {
    const parts = ['rounded-lg bg-white', PADDING[this.padding()]];
    if (this.bordered()) parts.push('border border-slate-200');
    if (this.elevated()) parts.push('shadow-sm');
    return parts.join(' ');
  });
}

@Component({
  selector: 'app-card-header',
  template: `
    <div class="flex items-start justify-between gap-4 border-b border-slate-200 pb-3 mb-4">
      <div class="flex-1 min-w-0">
        @if (title()) {
          <h3 class="text-base font-semibold text-slate-900 truncate">{{ title() }}</h3>
        }
        @if (description()) {
          <p class="mt-0.5 text-sm text-slate-500">{{ description() }}</p>
        }
        <ng-content select="[card-title]" />
      </div>
      <div class="flex items-center gap-2">
        <ng-content select="[card-actions]" />
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class CardHeaderComponent {
  readonly title = input<string>('');
  readonly description = input<string>('');
}

@Component({
  selector: 'app-card-footer',
  template: `
    <div class="flex items-center justify-end gap-2 border-t border-slate-200 pt-3 mt-4">
      <ng-content />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class CardFooterComponent {}
