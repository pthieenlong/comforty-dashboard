import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import { type ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LucideSearch, LucideX } from '@lucide/angular';
import { IconComponent } from '@/shared/ui/icon/icon.component';

const noop = (): void => undefined;

const BASE =
  'block w-full rounded-md border bg-white text-slate-900 placeholder:text-slate-400 ' +
  'focus:outline-none focus:ring-2 focus:ring-offset-0 ' +
  'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 ' +
  'pl-9 pr-9 py-2 min-h-[38px] text-sm';

@Component({
  selector: 'app-search-input',
  imports: [IconComponent],
  template: `
    <div class="relative">
      <span
        class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"
      >
        <app-icon [icon]="searchIcon" size="md" />
      </span>
      <input
        [id]="id()"
        type="search"
        [placeholder]="placeholder()"
        [disabled]="disabled()"
        [attr.aria-label]="ariaLabel()"
        [value]="value()"
        [class]="inputClasses()"
        (input)="handleInput($event)"
        (blur)="handleBlur()"
      />
      @if (value()) {
        <button
          type="button"
          class="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 rounded-r-md"
          aria-label="Xóa tìm kiếm"
          (click)="clear()"
        >
          <app-icon [icon]="clearIcon" size="md" />
        </button>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchInputComponent),
      multi: true,
    },
  ],
})
export class SearchInputComponent implements ControlValueAccessor {
  readonly id = input.required<string>();
  readonly placeholder = input<string>('Tìm kiếm...');
  readonly ariaLabel = input<string>('Tìm kiếm');

  protected readonly value = signal<string>('');
  protected readonly disabled = signal<boolean>(false);

  protected readonly searchIcon = LucideSearch.icon;
  protected readonly clearIcon = LucideX.icon;

  protected readonly inputClasses = computed(
    () => `${BASE} border-slate-300 focus:border-indigo-500 focus:ring-indigo-500`,
  );

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

  protected clear(): void {
    this.value.set('');
    this.onChange('');
  }
}
