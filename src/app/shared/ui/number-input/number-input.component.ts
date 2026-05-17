import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import { type ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LucideMinus, LucidePlus } from '@lucide/angular';
import { IconComponent } from '@/shared/ui/icon/icon.component';

const noop = (): void => undefined;

@Component({
  selector: 'app-number-input',
  imports: [IconComponent],
  template: `
    <div [class]="wrapperClasses()">
      <button
        type="button"
        class="px-2 text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        [disabled]="disabled() || atMin()"
        [attr.aria-label]="'Giảm'"
        (click)="decrement()"
      >
        <app-icon [icon]="minusIcon" size="sm" />
      </button>
      <input
        [id]="id()"
        type="text"
        inputmode="decimal"
        [disabled]="disabled()"
        [readonly]="readonly()"
        [attr.aria-invalid]="invalid() ? 'true' : null"
        [value]="display()"
        [placeholder]="placeholder()"
        class="flex-1 min-w-0 border-x border-slate-200 px-3 py-1.5 text-sm text-center text-slate-900 outline-none disabled:bg-slate-50 disabled:text-slate-500"
        (input)="handleInput($event)"
        (blur)="handleBlur()"
      />
      <button
        type="button"
        class="px-2 text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        [disabled]="disabled() || atMax()"
        [attr.aria-label]="'Tăng'"
        (click)="increment()"
      >
        <app-icon [icon]="plusIcon" size="sm" />
      </button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NumberInputComponent),
      multi: true,
    },
  ],
  host: { class: 'block' },
})
export class NumberInputComponent implements ControlValueAccessor {
  readonly id = input.required<string>();
  readonly min = input<number | null>(null);
  readonly max = input<number | null>(null);
  readonly step = input<number>(1);
  readonly placeholder = input<string>('0');
  readonly invalid = input<boolean>(false);
  readonly readonly = input<boolean>(false);

  protected readonly value = signal<number | null>(null);
  protected readonly disabled = signal<boolean>(false);
  protected readonly draft = signal<string>('');

  protected readonly minusIcon = LucideMinus.icon;
  protected readonly plusIcon = LucidePlus.icon;

  protected readonly display = computed(() => {
    const draft = this.draft();
    if (draft !== '') return draft;
    const v = this.value();
    return v === null ? '' : String(v);
  });

  protected readonly atMin = computed(() => {
    const min = this.min();
    const v = this.value();
    return min !== null && v !== null && v <= min;
  });

  protected readonly atMax = computed(() => {
    const max = this.max();
    const v = this.value();
    return max !== null && v !== null && v >= max;
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
    this.draft.set('');
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

  protected handleInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    this.draft.set(raw);
    if (raw === '' || raw === '-') {
      this.value.set(null);
      this.onChange(null);
      return;
    }
    const num = Number(raw.replace(/,/g, ''));
    if (Number.isFinite(num)) {
      this.value.set(num);
      this.onChange(num);
    }
  }

  protected handleBlur(): void {
    this.draft.set('');
    this.onTouched();
  }

  protected increment(): void {
    const current = this.value() ?? 0;
    const next = this.clamp(current + this.step());
    this.value.set(next);
    this.draft.set('');
    this.onChange(next);
  }

  protected decrement(): void {
    const current = this.value() ?? 0;
    const next = this.clamp(current - this.step());
    this.value.set(next);
    this.draft.set('');
    this.onChange(next);
  }

  private clamp(n: number): number {
    const min = this.min();
    const max = this.max();
    if (min !== null && n < min) return min;
    if (max !== null && n > max) return max;
    return n;
  }
}
