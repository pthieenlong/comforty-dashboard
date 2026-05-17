import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  BreadcrumbComponent,
  type BreadcrumbItem,
} from '@/shared/ui/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-page-header',
  imports: [BreadcrumbComponent],
  template: `
    @if (breadcrumb().length > 0) {
      <app-breadcrumb [items]="breadcrumb()" class="mb-2" />
    }
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="min-w-0">
        <h1 class="text-2xl font-bold text-slate-900 truncate">{{ title() }}</h1>
        @if (description()) {
          <p class="mt-1 text-sm text-slate-500">{{ description() }}</p>
        }
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <ng-content select="[page-actions]" />
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class PageHeaderComponent {
  readonly title = input.required<string>();
  readonly description = input<string>('');
  readonly breadcrumb = input<BreadcrumbItem[]>([]);
}
