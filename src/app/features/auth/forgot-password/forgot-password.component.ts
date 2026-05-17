import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  AlertComponent,
  ButtonComponent,
  CardComponent,
  FormFieldComponent,
  InputComponent,
} from '@/shared/ui';

interface ForgotForm {
  email: FormControl<string>;
}

@Component({
  selector: 'app-forgot-password',
  imports: [
    AlertComponent,
    ButtonComponent,
    CardComponent,
    FormFieldComponent,
    InputComponent,
    ReactiveFormsModule,
    RouterLink,
  ],
  template: `
    <app-card padding="lg" [elevated]="true">
      <header class="mb-6">
        <h2 class="text-xl font-semibold text-slate-900">Quên mật khẩu</h2>
        <p class="mt-1 text-sm text-slate-500">
          Nhập email tài khoản — hệ thống sẽ gửi link đặt lại mật khẩu.
        </p>
      </header>

      @if (sent()) {
        <app-alert variant="success" title="Đã gửi email">
          Vui lòng kiểm tra hộp thư và làm theo hướng dẫn. Link có hiệu lực trong 30 phút.
        </app-alert>
        <div class="mt-6">
          <a
            routerLink="/auth/login"
            class="text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            ← Quay lại đăng nhập
          </a>
        </div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-col gap-4" novalidate>
          <app-form-field
            for="forgot-email"
            label="Email"
            [required]="true"
            [errorText]="emailError()"
          >
            <app-input
              id="forgot-email"
              type="email"
              placeholder="ten@comforty.vn"
              autocomplete="email"
              formControlName="email"
              [invalid]="!!emailError()"
            />
          </app-form-field>

          <app-button type="submit" [block]="true" [loading]="submitting()" size="lg">
            Gửi link đặt lại
          </app-button>

          <div class="text-center">
            <a
              routerLink="/auth/login"
              class="text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              ← Quay lại đăng nhập
            </a>
          </div>
        </form>
      }
    </app-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPasswordComponent {
  protected readonly form = new FormGroup<ForgotForm>({
    email: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
  });

  protected readonly submitting = signal<boolean>(false);
  protected readonly submitted = signal<boolean>(false);
  protected readonly sent = signal<boolean>(false);

  protected readonly formValue = toSignal(this.form.valueChanges, {
    initialValue: this.form.value,
  });
  protected readonly formStatus = toSignal(this.form.statusChanges, {
    initialValue: this.form.status,
  });

  protected readonly emailError = computed(() => {
    this.formValue();
    this.formStatus();
    if (!this.submitted()) return '';
    const ctrl = this.form.controls.email;
    if (ctrl.hasError('required')) return 'Vui lòng nhập email.';
    if (ctrl.hasError('email')) return 'Email không hợp lệ.';
    return '';
  });

  protected onSubmit(): void {
    this.submitted.set(true);
    if (this.form.invalid) return;
    this.submitting.set(true);
    // TODO: wire to AuthService.requestPasswordReset() when backend ready.
    setTimeout(() => {
      this.submitting.set(false);
      this.sent.set(true);
    }, 600);
  }
}
