import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { IconComponent } from '@/shared/ui/icon/icon.component';

export type TagVariant = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

const VARIANT: Record<TagVariant, string> = {
  neutral: 'bg-slate-100 text-slate-700 ring-slate-200',
  primary: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  success: 'bg-green-50 text-green-700 ring-green-200',
  warning: 'bg-amber-50 text-amber-800 ring-amber-200',
  danger: 'bg-red-50 text-red-700 ring-red-200',
  info: 'bg-sky-50 text-sky-700 ring-sky-200',
};

@Component({
  selector: 'app-tag',
  imports: [IconComponent],
  template: `
    <span [class]="classes()">
      <ng-content />
      @if (removable()) {
        <button
          type="button"
          class="ml-0.5 -mr-1 rounded-full p-0.5 hover:bg-black/10 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-current"
          [attr.aria-label]="'Xóa ' + (label() || 'tag')"
          (click)="removed.emit($event)"
        >
          <app-icon [icon]="closeIcon" size="xs" />
        </button>
      }
    </span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex' },
})
export class TagComponent {
  readonly variant = input<TagVariant>('neutral');
  readonly removable = input<boolean>(false);
  readonly label = input<string>('');
  readonly removed = output<MouseEvent>();

  protected readonly closeIcon = LucideX.icon;
  protected readonly classes = computed(
    () =>
      `inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${VARIANT[this.variant()]}`,
  );
}
