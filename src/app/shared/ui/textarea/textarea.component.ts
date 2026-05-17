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

const BASE =
  'block w-full rounded-md border bg-white text-slate-900 placeholder:text-slate-400 ' +
  'px-3 py-2 text-sm leading-relaxed resize-y ' +
  'focus:outline-none focus:ring-2 focus:ring-offset-0 ' +
  'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500';

@Component({
  selector: 'app-textarea',
  template: `
    <textarea
      [id]="id()"
      [rows]="rows()"
      [placeholder]="placeholder()"
      [disabled]="disabled()"
      [readonly]="readonly()"
      [attr.maxlength]="maxLength()"
      [attr.aria-invalid]="invalid() ? 'true' : null"
      [value]="value()"
      [class]="classes()"
      (input)="handleInput($event)"
      (blur)="handleBlur()"
    ></textarea>
    @if (maxLength()) {
      <p class="mt-1 text-right text-xs text-slate-400">{{ value().length }}/{{ maxLength() }}</p>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextareaComponent),
      multi: true,
    },
  ],
  host: { class: 'block' },
})
export class TextareaComponent implements ControlValueAccessor {
  readonly id = input.required<string>();
  readonly placeholder = input<string>('');
  readonly rows = input<number>(4);
  readonly maxLength = input<number | null>(null);
  readonly invalid = input<boolean>(false);
  readonly readonly = input<boolean>(false);

  protected readonly value = signal<string>('');
  protected readonly disabled = signal<boolean>(false);

  protected readonly classes = computed(() => {
    const parts = [BASE];
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
    const target = event.target as HTMLTextAreaElement;
    this.value.set(target.value);
    this.onChange(target.value);
  }

  protected handleBlur(): void {
    this.onTouched();
  }
}
