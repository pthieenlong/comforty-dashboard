import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  AlertComponent,
  ButtonComponent,
  CardComponent,
  CheckboxComponent,
  FormFieldComponent,
  InputComponent,
  PasswordInputComponent,
} from '@/shared/ui';

interface LoginForm {
  email: FormControl<string>;
  password: FormControl<string>;
  remember: FormControl<boolean>;
}

@Component({
  selector: 'app-login',
  imports: [
    AlertComponent,
    ButtonComponent,
    CardComponent,
    CheckboxComponent,
    FormFieldComponent,
    InputComponent,
    PasswordInputComponent,
    ReactiveFormsModule,
    RouterLink,
  ],
  template: `
    <app-card padding="lg" [elevated]="true">
      <header class="mb-6">
        <h2 class="text-xl font-semibold text-slate-900">Đăng nhập</h2>
        <p class="mt-1 text-sm text-slate-500">Nhập thông tin tài khoản nội bộ để tiếp tục.</p>
      </header>

      @if (errorMessage()) {
        <div class="mb-4">
          <app-alert variant="danger" [dismissible]="true" (dismissed)="errorMessage.set('')">
            {{ errorMessage() }}
          </app-alert>
        </div>
      }

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-col gap-4" novalidate>
        <app-form-field
          for="login-email"
          label="Email"
          [required]="true"
          [errorText]="emailError()"
        >
          <app-input
            id="login-email"
            type="email"
            placeholder="ten@comforty.vn"
            autocomplete="email"
            formControlName="email"
            [invalid]="!!emailError()"
          />
        </app-form-field>

        <app-form-field
          for="login-password"
          label="Mật khẩu"
          [required]="true"
          [errorText]="passwordError()"
        >
          <app-password-input
            id="login-password"
            placeholder="Nhập mật khẩu"
            formControlName="password"
            [invalid]="!!passwordError()"
          />
        </app-form-field>

        <div class="flex items-center justify-between">
          <app-checkbox id="login-remember" label="Ghi nhớ đăng nhập" formControlName="remember" />
          <a
            routerLink="/auth/forgot-password"
            class="text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            Quên mật khẩu?
          </a>
        </div>

        <app-button type="submit" [block]="true" [loading]="submitting()" size="lg">
          Đăng nhập
        </app-button>
      </form>
    </app-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  protected readonly form = new FormGroup<LoginForm>({
    email: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)],
    }),
    remember: new FormControl<boolean>(false, { nonNullable: true }),
  });

  protected readonly submitting = signal<boolean>(false);
  protected readonly errorMessage = signal<string>('');
  protected readonly submitted = signal<boolean>(false);

  protected readonly emailError = computed(() => {
    this.formValue();
    this.formStatus();
    if (!this.submitted()) return '';
    const ctrl = this.form.controls.email;
    if (ctrl.hasError('required')) return 'Vui lòng nhập email.';
    if (ctrl.hasError('email')) return 'Email không hợp lệ.';
    return '';
  });

  protected readonly passwordError = computed(() => {
    this.formValue();
    this.formStatus();
    if (!this.submitted()) return '';
    const ctrl = this.form.controls.password;
    if (ctrl.hasError('required')) return 'Vui lòng nhập mật khẩu.';
    if (ctrl.hasError('minlength')) return 'Mật khẩu tối thiểu 6 ký tự.';
    return '';
  });

  // Track form state via signals so computed error messages recompute on every input change.
  protected readonly formValue = toSignal(this.form.valueChanges, {
    initialValue: this.form.value,
  });
  protected readonly formStatus = toSignal(this.form.statusChanges, {
    initialValue: this.form.status,
  });

  protected onSubmit(): void {
    this.submitted.set(true);
    if (this.form.invalid) return;
    this.submitting.set(true);
    this.errorMessage.set('');
    // TODO: wire to AuthService when backend ready.
    setTimeout(() => this.submitting.set(false), 800);
  }
}
