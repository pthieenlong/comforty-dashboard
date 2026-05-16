import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import { type ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
export type InputSize = 'sm' | 'md' | 'lg';

// Placeholder used until Angular wires registerOnChange / registerOnTouched.
const noop = (): void => undefined;

const BASE =
  'block w-full rounded-md border bg-white text-slate-900 placeholder:text-slate-400 ' +
  'focus:outline-none focus:ring-2 focus:ring-offset-0 ' +
  'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500';

const SIZE: Record<InputSize, string> = {
  sm: 'text-sm px-3 py-1.5 min-h-[32px]',
  md: 'text-sm px-3 py-2 min-h-[38px]',
  lg: 'text-base px-4 py-2.5 min-h-[44px]',
};

@Component({
  selector: 'app-input',
  template: `
    <input
      [id]="id()"
      [type]="type()"
      [placeholder]="placeholder()"
      [disabled]="disabled()"
      [readonly]="readonly()"
      [attr.autocomplete]="autocomplete()"
      [attr.aria-invalid]="invalid() ? 'true' : null"
      [attr.aria-describedby]="describedBy()"
      [value]="value()"
      [class]="classes()"
      (input)="handleInput($event)"
      (blur)="handleBlur()"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
})
export class InputComponent implements ControlValueAccessor {
  readonly id = input.required<string>();
  readonly type = input<InputType>('text');
  readonly placeholder = input<string>('');
  readonly autocomplete = input<string | null>(null);
  readonly inputSize = input<InputSize>('md');
  readonly invalid = input<boolean>(false);
  readonly describedBy = input<string | null>(null);
  readonly readonly = input<boolean>(false);

  protected readonly value = signal<string>('');
  protected readonly disabled = signal<boolean>(false);

  protected readonly classes = computed(() => {
    const parts = [BASE, SIZE[this.inputSize()]];
    parts.push(
      this.invalid()
        ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
        : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500',
    );
    return parts.join(' ');
  });

  private onChange: (value: string) => void = noop;
  private onTouched: () => void = noop;

  writeValue(value: string | null): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  protected handleInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value.set(target.value);
    this.onChange(target.value);
  }

  protected handleBlur(): void {
    this.onTouched();
  }
}
