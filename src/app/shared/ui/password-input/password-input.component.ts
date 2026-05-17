import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import { type ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LucideEye, LucideEyeOff } from '@lucide/angular';
import { IconComponent } from '@/shared/ui/icon/icon.component';

const noop = (): void => undefined;

const BASE =
  'block w-full rounded-md border bg-white text-slate-900 placeholder:text-slate-400 ' +
  'focus:outline-none focus:ring-2 focus:ring-offset-0 ' +
  'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 ' +
  'pl-3 pr-10 py-2 min-h-[38px] text-sm';

@Component({
  selector: 'app-password-input',
  imports: [IconComponent],
  template: `
    <div class="relative">
      <input
        [id]="id()"
        [type]="visible() ? 'text' : 'password'"
        [placeholder]="placeholder()"
        [disabled]="disabled()"
        [attr.autocomplete]="autocomplete()"
        [attr.aria-invalid]="invalid() ? 'true' : null"
        [attr.aria-describedby]="describedBy()"
        [value]="value()"
        [class]="inputClasses()"
        (input)="handleInput($event)"
        (blur)="handleBlur()"
      />
      <button
        type="button"
        class="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 rounded-r-md"
        [attr.aria-label]="visible() ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'"
        [attr.aria-pressed]="visible()"
        [tabIndex]="-1"
        (click)="toggleVisible()"
      >
        <app-icon [icon]="visible() ? eyeOffIcon : eyeIcon" size="md" />
      </button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PasswordInputComponent),
      multi: true,
    },
  ],
})
export class PasswordInputComponent implements ControlValueAccessor {
  readonly id = input.required<string>();
  readonly placeholder = input<string>('');
  readonly autocomplete = input<string | null>('current-password');
  readonly invalid = input<boolean>(false);
  readonly describedBy = input<string | null>(null);

  protected readonly value = signal<string>('');
  protected readonly disabled = signal<boolean>(false);
  protected readonly visible = signal<boolean>(false);

  protected readonly eyeIcon = LucideEye.icon;
  protected readonly eyeOffIcon = LucideEyeOff.icon;

  protected readonly inputClasses = computed(() =>
    this.invalid()
      ? `${BASE} border-red-400 focus:border-red-500 focus:ring-red-500`
      : `${BASE} border-slate-300 focus:border-indigo-500 focus:ring-indigo-500`,
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

  protected toggleVisible(): void {
    this.visible.update((v) => !v);
  }
}
