import { DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { ButtonComponent } from '@/shared/ui/button/button.component';
import { IconComponent } from '@/shared/ui/icon/icon.component';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

const SIZE: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

@Component({
  selector: 'app-modal',
  imports: [ButtonComponent, IconComponent],
  template: `
    <div [class]="containerClasses()">
      @if (title() || dismissible()) {
        <header class="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div class="min-w-0">
            @if (title()) {
              <h2 class="text-base font-semibold text-slate-900">{{ title() }}</h2>
            }
            @if (description()) {
              <p class="mt-0.5 text-sm text-slate-500">{{ description() }}</p>
            }
          </div>
          @if (dismissible()) {
            <app-button variant="ghost" size="sm" (click)="close()">
              <app-icon [icon]="closeIcon" size="md" />
            </app-button>
          }
        </header>
      }

      <div class="px-5 py-4">
        <ng-content />
      </div>

      <footer
        class="flex items-center justify-end gap-2 border-t border-slate-200 px-5 py-3 bg-slate-50 rounded-b-lg"
      >
        <ng-content select="[modal-footer]" />
      </footer>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class ModalComponent {
  readonly title = input<string>('');
  readonly description = input<string>('');
  readonly size = input<ModalSize>('md');
  readonly dismissible = input<boolean>(true);

  private readonly dialogRef = inject(DialogRef, { optional: true });

  protected readonly closeIcon = LucideX.icon;

  protected readonly containerClasses = computed(
    () => `flex flex-col w-full rounded-lg bg-white shadow-xl outline-none ${SIZE[this.size()]}`,
  );

  protected close(): void {
    this.dialogRef?.close();
  }
}
