import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { SpinnerComponent } from '@/shared/ui/spinner/spinner.component';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonType = 'button' | 'submit' | 'reset';

const BASE =
  'inline-flex items-center justify-center gap-2 font-medium rounded-md transition-colors ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 ' +
  'disabled:cursor-not-allowed disabled:opacity-50';

const VARIANT: Record<ButtonVariant, string> = {
  primary:
    'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 focus-visible:outline-indigo-500',
  secondary:
    'bg-white text-slate-900 border border-slate-300 hover:bg-slate-50 active:bg-slate-100 focus-visible:outline-indigo-500',
  ghost:
    'bg-transparent text-slate-700 hover:bg-slate-100 active:bg-slate-200 focus-visible:outline-indigo-500',
  danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus-visible:outline-red-500',
  link: 'bg-transparent text-indigo-600 hover:text-indigo-700 hover:underline focus-visible:outline-indigo-500 px-1 rounded-sm',
};

const SIZE: Record<ButtonSize, string> = {
  sm: 'text-sm px-3 py-1.5 min-h-[32px]',
  md: 'text-sm px-4 py-2 min-h-[38px]',
  lg: 'text-base px-5 py-2.5 min-h-[44px]',
};

@Component({
  selector: 'app-button',
  imports: [SpinnerComponent],
  template: `
    <button
      [type]="type()"
      [disabled]="disabled() || loading()"
      [class]="classes()"
      [attr.aria-busy]="loading() ? 'true' : null"
    >
      @if (loading()) {
        <app-spinner [size]="size() === 'lg' ? 'md' : 'sm'" />
      }
      <ng-content />
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex' },
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly type = input<ButtonType>('button');
  readonly disabled = input<boolean>(false);
  readonly loading = input<boolean>(false);
  readonly block = input<boolean>(false);

  protected readonly classes = computed(() => {
    const parts = [BASE, VARIANT[this.variant()], SIZE[this.size()]];
    if (this.block()) parts.push('w-full');
    return parts.join(' ');
  });
}
