import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { LucideChevronLeft, LucideChevronRight } from '@lucide/angular';
import { IconComponent } from '@/shared/ui/icon/icon.component';

@Component({
  selector: 'app-pagination',
  imports: [IconComponent],
  template: `
    <nav class="flex items-center justify-between gap-4" aria-label="Phân trang">
      <p class="text-sm text-slate-600">
        Hiển thị
        <span class="font-medium text-slate-900">{{ rangeStart() }}</span>
        –
        <span class="font-medium text-slate-900">{{ rangeEnd() }}</span>
        / <span class="font-medium text-slate-900">{{ totalItems() }}</span>
      </p>
      <div class="flex items-center gap-1">
        <button
          type="button"
          class="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          [disabled]="page() <= 1"
          aria-label="Trang trước"
          (click)="goTo(page() - 1)"
        >
          <app-icon [icon]="prevIcon" size="md" />
        </button>

        @for (p of pages(); track p) {
          @if (p === -1) {
            <span class="px-1 text-sm text-slate-400">…</span>
          } @else {
            <button
              type="button"
              [class]="pageBtnClasses(p === page())"
              [attr.aria-current]="p === page() ? 'page' : null"
              (click)="goTo(p)"
            >
              {{ p }}
            </button>
          }
        }

        <button
          type="button"
          class="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          [disabled]="page() >= totalPages()"
          aria-label="Trang sau"
          (click)="goTo(page() + 1)"
        >
          <app-icon [icon]="nextIcon" size="md" />
        </button>
      </div>
    </nav>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class PaginationComponent {
  readonly page = model.required<number>();
  readonly pageSize = input.required<number>();
  readonly totalItems = input.required<number>();

  protected readonly prevIcon = LucideChevronLeft.icon;
  protected readonly nextIcon = LucideChevronRight.icon;

  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalItems() / this.pageSize())),
  );

  protected readonly rangeStart = computed(() =>
    this.totalItems() === 0 ? 0 : (this.page() - 1) * this.pageSize() + 1,
  );

  protected readonly rangeEnd = computed(() =>
    Math.min(this.totalItems(), this.page() * this.pageSize()),
  );

  protected readonly pages = computed<number[]>(() => {
    const total = this.totalPages();
    const current = this.page();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const items: number[] = [1];
    if (current > 3) items.push(-1);

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) items.push(i);

    if (current < total - 2) items.push(-1);
    items.push(total);
    return items;
  });

  protected pageBtnClasses(active: boolean): string {
    const base =
      'inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500';
    return active
      ? `${base} bg-indigo-600 text-white`
      : `${base} bg-white border border-slate-300 text-slate-700 hover:bg-slate-50`;
  }

  protected goTo(target: number): void {
    if (target < 1 || target > this.totalPages() || target === this.page()) return;
    this.page.set(target);
  }
}
