import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export interface DescriptionItem {
  label: string;
  value: string | number | null | undefined;
  hint?: string;
}

export type DescriptionListLayout = 'stack' | 'inline';

@Component({
  selector: 'app-description-list',
  template: `
    <dl [class]="rootClasses()">
      @for (item of items(); track item.label) {
        <div [class]="itemClasses()">
          <dt class="text-xs font-medium uppercase tracking-wide text-slate-500">
            {{ item.label }}
          </dt>
          <dd class="mt-1 text-sm text-slate-900">
            @if (item.value === null || item.value === undefined || item.value === '') {
              <span class="text-slate-400">—</span>
            } @else {
              {{ item.value }}
            }
            @if (item.hint) {
              <span class="mt-0.5 block text-xs text-slate-500">{{ item.hint }}</span>
            }
          </dd>
        </div>
      }
    </dl>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class DescriptionListComponent {
  readonly items = input.required<DescriptionItem[]>();
  readonly layout = input<DescriptionListLayout>('inline');
  readonly columns = input<1 | 2 | 3>(2);

  protected readonly rootClasses = computed(() => {
    if (this.layout() === 'stack') {
      return 'space-y-4';
    }
    const cols = this.columns();
    if (cols === 1) return 'grid gap-x-6 gap-y-4 grid-cols-1';
    if (cols === 3) return 'grid gap-x-6 gap-y-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    return 'grid gap-x-6 gap-y-4 grid-cols-1 sm:grid-cols-2';
  });

  protected readonly itemClasses = computed(() => 'min-w-0');
}
