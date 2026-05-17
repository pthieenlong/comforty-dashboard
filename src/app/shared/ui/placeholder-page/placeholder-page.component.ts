import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucideConstruction } from '@lucide/angular';
import type { BreadcrumbItem } from '@/shared/ui/breadcrumb/breadcrumb.component';
import { CardComponent } from '@/shared/ui/card/card.component';
import { EmptyStateComponent } from '@/shared/ui/empty-state/empty-state.component';
import { PageHeaderComponent } from '@/shared/ui/page-header/page-header.component';

@Component({
  selector: 'app-placeholder-page',
  imports: [CardComponent, EmptyStateComponent, PageHeaderComponent],
  template: `
    <div class="space-y-6">
      <app-page-header
        [title]="title()"
        [description]="description()"
        [breadcrumb]="breadcrumb()"
      />
      <app-card>
        <app-empty-state
          [icon]="constructionIcon"
          [title]="emptyTitle()"
          [description]="emptyDescription()"
        />
      </app-card>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class PlaceholderPageComponent {
  readonly title = input.required<string>();
  readonly description = input<string>('');
  readonly breadcrumb = input<BreadcrumbItem[]>([]);
  readonly emptyTitle = input<string>('Tính năng đang phát triển');
  readonly emptyDescription = input<string>(
    'Module này sẽ được hoàn thiện ở các sprint tiếp theo. Mock data và UI sẽ được wire khi tới phiên.',
  );

  protected readonly constructionIcon = LucideConstruction.icon;
}
