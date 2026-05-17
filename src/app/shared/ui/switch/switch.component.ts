import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import { type ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

const noop = (): void => undefined;

@Component({
  selector: 'app-switch',
  template: `
    <label class="inline-flex items-center gap-2 cursor-pointer select-none">
      <input
        type="checkbox"
        [id]="id()"
        [checked]="checked()"
        [disabled]="disabled()"
        [attr.aria-describedby]="describedBy()"
        class="peer sr-only"
        (change)="handleChange($event)"
        (blur)="handleBlur()"
      />
      <span [class]="trackClasses()" role="switch" [attr.aria-checked]="checked()">
        <span [class]="thumbClasses()"></span>
      </span>
      @if (label()) {
        <span class="text-sm text-slate-700" [class.text-slate-400]="disabled()">
          {{ label() }}
        </span>
      }
    </label>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SwitchComponent),
      multi: true,
    },
  ],
})
export class SwitchComponent implements ControlValueAccessor {
  readonly id = input.required<string>();
  readonly label = input<string>('');
  readonly describedBy = input<string | null>(null);

  protected readonly checked = signal<boolean>(false);
  protected readonly disabled = signal<boolean>(false);

  protected readonly trackClasses = computed(() => {
    const base =
      'relative inline-flex h-5 w-9 items-center rounded-full transition-colors ' +
      'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-indigo-500';
    const color = this.checked() ? 'bg-indigo-600' : 'bg-slate-300';
    const dim = this.disabled() ? 'opacity-50 cursor-not-allowed' : '';
    return `${base} ${color} ${dim}`;
  });

  protected readonly thumbClasses = computed(() => {
    const base = 'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform';
    return this.checked() ? `${base} translate-x-4` : `${base} translate-x-0.5`;
  });

  private onChange: (value: boolean) => void = noop;
  private onTouched: () => void = noop;

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
