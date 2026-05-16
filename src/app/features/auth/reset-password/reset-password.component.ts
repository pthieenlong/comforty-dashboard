import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  type AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  type ValidationErrors,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  AlertComponent,
  ButtonComponent,
  CardComponent,
  FormFieldComponent,
  PasswordInputComponent,
} from '@/shared/ui';

interface ResetForm {
  password: FormControl<string>;
  confirm: FormControl<string>;
}

function matchPasswords(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirm = group.get('confirm')?.value;
  return password && confirm && password !== confirm ? { mismatch: true } : null;
}

@Component({
  selector: 'app-reset-password',
  imports: [
    AlertComponent,
    ButtonComponent,
    CardComponent,
    FormFieldComponent,
    PasswordInputComponent,
    ReactiveFormsModule,
    RouterLink,
  ],
  template: `
    <app-card padding="lg" [elevated]="true">
      <header class="mb-6">
        <h2 class="text-xl font-semibold text-slate-900">Đặt lại mật khẩu</h2>
        <p class="mt-1 text-sm text-slate-500">Mật khẩu mới tối thiểu 8 ký tự, gồm chữ và số.</p>
      </header>

      @if (done()) {
        <app-alert variant="success" title="Đã đặt lại mật khẩu">
          Bạn có thể đăng nhập lại bằng mật khẩu mới.
        </app-alert>
        <div class="mt-6">
          <a
            routerLink="/auth/login"
            class="text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            ← Đến trang đăng nhập
          </a>
        </div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-col gap-4" novalidate>
          <app-form-field
            for="reset-password"
            label="Mật khẩu mới"
            [required]="true"
            [errorText]="passwordError()"
          >
            <app-password-input
              id="reset-password"
              placeholder="Nhập mật khẩu mới"
              autocomplete="new-password"
              formControlName="password"
              [invalid]="!!passwordError()"
            />
          </app-form-field>

          <app-form-field
            for="reset-confirm"
            label="Xác nhận mật khẩu"
            [required]="true"
            [errorText]="confirmError()"
          >
            <app-password-input
              id="reset-confirm"
              placeholder="Nhập lại mật khẩu"
              autocomplete="new-password"
              formControlName="confirm"
              [invalid]="!!confirmError()"
            />
          </app-form-field>

          <app-button type="submit" [block]="true" [loading]="submitting()" size="lg">
            Xác nhận
          </app-button>
        </form>
      }
    </app-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPasswordComponent {
  protected readonly form = new FormGroup<ResetForm>(
    {
      password: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(8)],
      }),
      confirm: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    },
    { validators: matchPasswords },
  );

  protected readonly submitting = signal<boolean>(false);
  protected readonly submitted = signal<boolean>(false);
  protected readonly done = signal<boolean>(false);

  protected readonly formValue = toSignal(this.form.valueChanges, {
    initialValue: this.form.value,
  });
  protected readonly formStatus = toSignal(this.form.statusChanges, {
    initialValue: this.form.status,
  });

  protected readonly passwordError = computed(() => {
    this.formValue();
    this.formStatus();
    if (!this.submitted()) return '';
    const ctrl = this.form.controls.password;
    if (ctrl.hasError('required')) return 'Vui lòng nhập mật khẩu.';
    if (ctrl.hasError('minlength')) return 'Mật khẩu tối thiểu 8 ký tự.';
    return '';
  });

  protected readonly confirmError = computed(() => {
    this.formValue();
    this.formStatus();
    if (!this.submitted()) return '';
    const ctrl = this.form.controls.confirm;
    if (ctrl.hasError('required')) return 'Vui lòng nhập lại mật khẩu.';
    if (this.form.hasError('mismatch')) return 'Mật khẩu không khớp.';
    return '';
  });

  protected onSubmit(): void {
    this.submitted.set(true);
    if (this.form.invalid) return;
    this.submitting.set(true);
    // TODO: wire to AuthService.resetPassword(token, password) when backend ready.
    setTimeout(() => {
      this.submitting.set(false);
      this.done.set(true);
    }, 600);
  }
}
