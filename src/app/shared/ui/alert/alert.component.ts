import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import {
  LucideAlertTriangle,
  LucideCheckCircle2,
  LucideInfo,
  LucideX,
  LucideXCircle,
  type LucideIconData,
} from '@lucide/angular';
import { IconComponent } from '@/shared/ui/icon/icon.component';

export type AlertVariant = 'success' | 'warning' | 'danger' | 'info';

const VARIANT_STYLE: Record<
  AlertVariant,
  { container: string; icon: string; ariaRole: 'status' | 'alert'; lucide: LucideIconData }
> = {
  success: {
    container: 'bg-green-50 border-green-200 text-green-800',
    icon: 'text-green-600',
    ariaRole: 'status',
    lucide: LucideCheckCircle2.icon,
  },
  warning: {
    container: 'bg-amber-50 border-amber-200 text-amber-900',
    icon: 'text-amber-600',
    ariaRole: 'alert',
    lucide: LucideAlertTriangle.icon,
  },
  danger: {
    container: 'bg-red-50 border-red-200 text-red-800',
    icon: 'text-red-600',
    ariaRole: 'alert',
    lucide: LucideXCircle.icon,
  },
  info: {
    container: 'bg-sky-50 border-sky-200 text-sky-800',
    icon: 'text-sky-600',
    ariaRole: 'status',
    lucide: LucideInfo.icon,
  },
};

@Component({
  selector: 'app-alert',
  imports: [IconComponent],
  template: `
    <div [class]="containerClasses()" [attr.role]="role()">
      <div [class]="iconWrapClasses()">
        <app-icon [icon]="iconData()" size="lg" />
      </div>
      <div class="flex-1 min-w-0">
        @if (title()) {
          <p class="text-sm font-semibold">{{ title() }}</p>
        }
        <div class="text-sm" [class.mt-0.5]="title()">
          <ng-content />
        </div>
      </div>
      @if (dismissible()) {
        <button
          type="button"
          class="ml-2 shrink-0 rounded-md p-1 hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
          aria-label="Đóng"
          (click)="dismissed.emit()"
        >
          <app-icon [icon]="closeIcon" size="md" />
        </button>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class AlertComponent {
  readonly variant = input<AlertVariant>('info');
  readonly title = input<string>('');
  readonly dismissible = input<boolean>(false);
  readonly dismissed = output<void>();

  protected readonly closeIcon = LucideX.icon;

  protected readonly containerClasses = computed(
    () => `flex items-start gap-3 rounded-md border p-3 ${VARIANT_STYLE[this.variant()].container}`,
  );

  protected readonly iconWrapClasses = computed(
    () => `shrink-0 ${VARIANT_STYLE[this.variant()].icon}`,
  );

  protected readonly iconData = computed(() => VARIANT_STYLE[this.variant()].lucide);
  protected readonly role = computed(() => VARIANT_STYLE[this.variant()].ariaRole);
}
