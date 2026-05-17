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

const FORMATTER = new Intl.NumberFormat('vi-VN');

@Component({
  selector: 'app-price-input',
  template: `
    <div [class]="wrapperClasses()">
      <input
        [id]="id()"
        type="text"
        inputmode="numeric"
        [disabled]="disabled()"
        [attr.aria-invalid]="invalid() ? 'true' : null"
        [value]="display()"
        [placeholder]="placeholder()"
        class="flex-1 min-w-0 px-3 py-1.5 text-sm text-right text-slate-900 outline-none disabled:bg-slate-50 disabled:text-slate-500"
        (input)="handleInput($event)"
        (blur)="handleBlur()"
        (focus)="handleFocus()"
      />
      <span
        class="flex items-center px-3 text-sm font-medium text-slate-500 border-l border-slate-200 bg-slate-50"
      >
        {{ suffix() }}
      </span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PriceInputComponent),
      multi: true,
    },
  ],
  host: { class: 'block' },
})
export class PriceInputComponent implements ControlValueAccessor {
  readonly id = input.required<string>();
  readonly placeholder = input<string>('0');
  readonly suffix = input<string>('VNĐ');
  readonly invalid = input<boolean>(false);

  protected readonly value = signal<number | null>(null);
  protected readonly disabled = signal<boolean>(false);
  protected readonly focused = signal<boolean>(false);
  protected readonly draft = signal<string>('');

  protected readonly display = computed(() => {
    if (this.focused()) return this.draft();
    const v = this.value();
    return v === null ? '' : FORMATTER.format(v);
  });

  protected readonly wrapperClasses = computed(() => {
    const base = 'flex items-stretch rounded-md border bg-white overflow-hidden min-h-[38px]';
    return this.invalid()
      ? `${base} border-red-400 focus-within:ring-2 focus-within:ring-red-500`
      : `${base} border-slate-300 focus-within:ring-2 focus-within:ring-indigo-500`;
  });

  private onChange: (value: number | null) => void = noop;
  private onTouched: () => void = noop;

  writeValue(value: number | null): void {
    this.value.set(value ?? null);
    this.draft.set(value === null || value === undefined ? '' : String(value));
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  protected handleFocus(): void {
    const v = this.value();
    this.draft.set(v === null ? '' : String(v));
    this.focused.set(true);
  }

  protected handleInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    const digitsOnly = raw.replace(/[^\d]/g, '');
    this.draft.set(digitsOnly);
    if (digitsOnly === '') {
      this.value.set(null);
      this.onChange(null);
      return;
    }
    const num = Number(digitsOnly);
    if (Number.isFinite(num)) {
      this.value.set(num);
      this.onChange(num);
    }
  }

  protected handleBlur(): void {
    this.focused.set(false);
    this.onTouched();
  }
}
