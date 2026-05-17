import {
  ChangeDetectionStrategy,
  Component,
  type ElementRef,
  computed,
  effect,
  forwardRef,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { type ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LucideCheck, LucideMinus } from '@lucide/angular';
import { IconComponent } from '@/shared/ui/icon/icon.component';

const noop = (): void => undefined;

@Component({
  selector: 'app-checkbox',
  imports: [IconComponent],
  template: `
    <label [for]="id()" class="inline-flex items-start gap-2 cursor-pointer select-none">
      <span class="relative inline-flex shrink-0 mt-0.5">
        <input
          #input
          type="checkbox"
          [id]="id()"
          [checked]="checked()"
          [disabled]="disabled()"
          [attr.aria-describedby]="describedBy()"
          [attr.aria-invalid]="invalid() ? 'true' : null"
          class="peer sr-only"
          (change)="handleChange($event)"
          (blur)="handleBlur()"
        />
        <span [class]="boxClasses()">
          @if (checked() && !indeterminate()) {
            <app-icon [icon]="checkIcon" size="sm" [strokeWidth]="3" />
          } @else if (indeterminate()) {
            <app-icon [icon]="dashIcon" size="sm" [strokeWidth]="3" />
          }
        </span>
      </span>
      @if (label()) {
        <span class="text-sm text-slate-700" [class.text-slate-400]="disabled()">
          {{ label() }}
        </span>
      }
      <ng-content />
    </label>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true,
    },
  ],
})
export class CheckboxComponent implements ControlValueAccessor {
  readonly id = input.required<string>();
  readonly label = input<string>('');
  readonly indeterminate = input<boolean>(false);
  readonly invalid = input<boolean>(false);
  readonly describedBy = input<string | null>(null);

  protected readonly checked = signal<boolean>(false);
  protected readonly disabled = signal<boolean>(false);
  protected readonly inputEl = viewChild<ElementRef<HTMLInputElement>>('input');

  protected readonly checkIcon = LucideCheck.icon;
  protected readonly dashIcon = LucideMinus.icon;

  protected readonly boxClasses = computed(() => {
    const base =
      'inline-flex h-4 w-4 items-center justify-center rounded border transition-colors ' +
      'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-indigo-500';
    const filled = this.checked() || this.indeterminate();
    const color = this.invalid()
      ? 'border-red-400'
      : filled
        ? 'bg-indigo-600 border-indigo-600 text-white'
        : 'border-slate-300 bg-white';
    const disabledStyle = this.disabled() ? 'opacity-50 cursor-not-allowed' : '';
    return `${base} ${color} ${disabledStyle}`;
  });

  private onChange: (value: boolean) => void = noop;
  private onTouched: () => void = noop;

  constructor() {
    effect(() => {
      const el = this.inputEl()?.nativeElement;
      if (el) el.indeterminate = this.indeterminate();
    });
  }

  writeValue(value: boolean | null): void {
    this.checked.set(!!value);
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  protected handleChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.checked.set(target.checked);
    this.onChange(target.checked);
  }

  protected handleBlur(): void {
    this.onTouched();
  }
}
