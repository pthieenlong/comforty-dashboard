import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  computed,
  contentChild,
  input,
} from '@angular/core';
import type { LucideIconData } from '@lucide/angular';
import { IconComponent } from '@/shared/ui/icon/icon.component';

export type TimelineDotVariant = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

export interface TimelineEntry<T = unknown> {
  id: string;
  title: string;
  timestamp: string;
  description?: string;
  icon?: LucideIconData;
  variant?: TimelineDotVariant;
  data?: T;
}

const DOT_BG: Record<TimelineDotVariant, string> = {
  neutral: 'bg-slate-100 text-slate-500 ring-slate-200',
  primary: 'bg-indigo-50 text-indigo-600 ring-indigo-200',
  success: 'bg-green-50 text-green-600 ring-green-200',
  warning: 'bg-amber-50 text-amber-600 ring-amber-200',
  danger: 'bg-red-50 text-red-600 ring-red-200',
  info: 'bg-sky-50 text-sky-600 ring-sky-200',
};

@Component({
  selector: 'app-timeline',
  imports: [IconComponent, NgTemplateOutlet],
  template: `
    <ol class="relative space-y-5">
      @for (entry of entries(); track entry.id; let last = $last) {
        <li class="flex gap-3">
          <div class="relative flex shrink-0 flex-col items-center">
            <span [class]="dotClasses(entry)">
              @if (entry.icon) {
                <app-icon [icon]="entry.icon" size="sm" />
              } @else {
                <span class="block h-1.5 w-1.5 rounded-full bg-current"></span>
              }
            </span>
            @if (!last) {
              <span class="mt-1 w-px flex-1 bg-slate-200"></span>
            }
          </div>

          <div class="-mt-0.5 flex-1 pb-1 min-w-0">
            <div class="flex flex-wrap items-baseline justify-between gap-x-3">
              <p class="text-sm font-medium text-slate-900">{{ entry.title }}</p>
              <p class="text-xs text-slate-500">{{ formatTime(entry.timestamp) }}</p>
            </div>
            @if (entry.description) {
              <p class="mt-0.5 text-sm text-slate-600">{{ entry.description }}</p>
            }
            @if (entryTemplate(); as tpl) {
              <div class="mt-2">
                <ng-container *ngTemplateOutlet="tpl; context: { entry: entry }" />
              </div>
            }
          </div>
        </li>
      }
    </ol>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class TimelineComponent<T = unknown> {
  readonly entries = input.required<TimelineEntry<T>[]>();

  protected readonly entryTemplate =
    contentChild<TemplateRef<{ entry: TimelineEntry<T> }>>(TemplateRef);

  protected readonly noopComputed = computed(() => this.entries().length);

  protected dotClasses(entry: TimelineEntry<T>): string {
    const variant = entry.variant ?? 'neutral';
    return `flex h-7 w-7 items-center justify-center rounded-full ring-1 ring-inset ${DOT_BG[variant]}`;
  }

  protected formatTime(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
