import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  BreadcrumbComponent,
  ButtonComponent,
  CardComponent,
  CardHeaderComponent,
  FormFieldComponent,
  InputComponent,
  SelectComponent,
  type SelectOption,
  SwitchComponent,
  ToastService,
} from '@/shared/ui';
import { ROLES, TENANT_LIST, findUser } from '../iam.mock';

interface UserForm {
  email: FormControl<string>;
  fullName: FormControl<string>;
  phone: FormControl<string>;
  tenantId: FormControl<string>;
  roleId: FormControl<string>;
  active: FormControl<boolean>;
}

@Component({
  selector: 'app-user-form',
  imports: [
    BreadcrumbComponent,
    ButtonComponent,
    CardComponent,
    CardHeaderComponent,
    FormFieldComponent,
    InputComponent,
    ReactiveFormsModule,
    RouterLink,
    SelectComponent,
    SwitchComponent,
  ],
  template: `
    <div class="space-y-6">
      <div>
        <app-breadcrumb [items]="breadcrumb()" />
        <h1 class="mt-2 text-2xl font-bold text-slate-900">{{ headingText() }}</h1>
        <p class="mt-1 text-sm text-slate-500">{{ subHeadingText() }}</p>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate class="space-y-5">
        <app-card padding="lg">
          <app-card-header
            title="Thông tin cá nhân"
            description="Email và số điện thoại phải duy nhất trong hệ thống."
          />
          <div class="grid gap-4 sm:grid-cols-2">
            <app-form-field
              for="user-email"
              label="Email"
              [required]="true"
              [errorText]="emailError()"
            >
              <app-input
                id="user-email"
                type="email"
                placeholder="ten@comforty.vn"
                formControlName="email"
                [invalid]="!!emailError()"
              />
            </app-form-field>

            <app-form-field
              for="user-name"
              label="Họ và tên"
              [required]="true"
              [errorText]="nameError()"
            >
              <app-input
                id="user-name"
                placeholder="Nguyễn Văn A"
                formControlName="fullName"
                [invalid]="!!nameError()"
              />
            </app-form-field>

            <app-form-field for="user-phone" label="Số điện thoại" [errorText]="phoneError()">
              <app-input
                id="user-phone"
                type="tel"
                placeholder="0901234567"
                formControlName="phone"
                [invalid]="!!phoneError()"
              />
            </app-form-field>

            <div class="flex items-center pt-6">
              <app-switch id="user-active" label="Tài khoản hoạt động" formControlName="active" />
            </div>
          </div>
        </app-card>

        <app-card padding="lg">
          <app-card-header
            title="Phân quyền"
            description="Chỉ định chi nhánh và vai trò chính cho người dùng."
          />
          <div class="grid gap-4 sm:grid-cols-2">
            <app-form-field
              for="user-tenant"
              label="Chi nhánh"
              [required]="true"
              [errorText]="tenantError()"
            >
              <app-select
                id="user-tenant"
                [options]="tenantOptions"
                placeholder="Chọn chi nhánh"
                formControlName="tenantId"
                [invalid]="!!tenantError()"
              />
            </app-form-field>

            <app-form-field
              for="user-role"
              label="Vai trò"
              [required]="true"
              [errorText]="roleError()"
            >
              <app-select
                id="user-role"
                [options]="roleOptions"
                placeholder="Chọn vai trò"
                [searchable]="true"
                formControlName="roleId"
                [invalid]="!!roleError()"
              />
            </app-form-field>
          </div>
        </app-card>

        <div class="flex items-center justify-end gap-2">
          <a routerLink="/iam/users">
            <app-button variant="secondary" type="button">Hủy</app-button>
          </a>
          <app-button type="submit" [loading]="submitting()">
            {{ id() ? 'Lưu thay đổi' : 'Tạo người dùng' }}
          </app-button>
        </div>
      </form>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserFormComponent {
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly id = input<string | null>(null);

  protected readonly tenantOptions: SelectOption<string>[] = TENANT_LIST.map((t) => ({
    value: t.id,
    label: t.name,
  }));
  protected readonly roleOptions: SelectOption<string>[] = ROLES.map((r) => ({
    value: r.id,
    label: r.name,
  }));

  protected readonly form = new FormGroup<UserForm>({
    email: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    fullName: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    phone: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.pattern(/^0\d{9,10}$/)],
    }),
    tenantId: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    roleId: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    active: new FormControl<boolean>(true, { nonNullable: true }),
  });

  protected readonly submitting = signal(false);
  protected readonly submitted = signal(false);

  protected readonly formValue = toSignal(this.form.valueChanges, {
    initialValue: this.form.value,
  });
  protected readonly formStatus = toSignal(this.form.statusChanges, {
    initialValue: this.form.status,
  });

  protected readonly breadcrumb = computed(() => [
    { label: 'Hệ thống' },
    { label: 'Người dùng', to: '/iam/users' },
    { label: this.id() ? 'Chỉnh sửa' : 'Thêm mới' },
  ]);

  protected readonly headingText = computed(() =>
    this.id() ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới',
  );
  protected readonly subHeadingText = computed(() =>
    this.id()
      ? 'Cập nhật thông tin và phân quyền cho người dùng hiện tại.'
      : 'Tạo tài khoản nhân viên và gán vào chi nhánh.',
  );

  protected readonly emailError = computed(() => {
    this.formValue();
    this.formStatus();
    if (!this.submitted()) return '';
    const ctrl = this.form.controls.email;
    if (ctrl.hasError('required')) return 'Vui lòng nhập email.';
    if (ctrl.hasError('email')) return 'Email không hợp lệ.';
    return '';
  });

  protected readonly nameError = computed(() => {
    this.formValue();
    this.formStatus();
    if (!this.submitted()) return '';
    const ctrl = this.form.controls.fullName;
    if (ctrl.hasError('required')) return 'Vui lòng nhập họ tên.';
    if (ctrl.hasError('minlength')) return 'Họ tên tối thiểu 2 ký tự.';
    return '';
  });

  protected readonly phoneError = computed(() => {
    this.formValue();
    this.formStatus();
    if (!this.submitted()) return '';
    const ctrl = this.form.controls.phone;
    if (ctrl.hasError('pattern')) return 'Số điện thoại không hợp lệ (10–11 số, bắt đầu bằng 0).';
    return '';
  });

  protected readonly tenantError = computed(() => {
    this.formValue();
    this.formStatus();
    if (!this.submitted()) return '';
    return this.form.controls.tenantId.hasError('required') ? 'Vui lòng chọn chi nhánh.' : '';
  });

  protected readonly roleError = computed(() => {
    this.formValue();
    this.formStatus();
    if (!this.submitted()) return '';
    return this.form.controls.roleId.hasError('required') ? 'Vui lòng chọn vai trò.' : '';
  });

  constructor() {
    const userId = this.id();
    if (userId) {
      const user = findUser(userId);
      if (user) {
        const primary = user.assignments[0];
        this.form.patchValue({
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
          tenantId: primary?.tenantId ?? '',
          roleId: primary?.roleIds[0] ?? '',
          active: user.active,
        });
      }
    }
  }

  protected onSubmit(): void {
    this.submitted.set(true);
    if (this.form.invalid) return;
    this.submitting.set(true);
    setTimeout(() => {
      this.submitting.set(false);
      this.toast.success(this.id() ? 'Đã cập nhật người dùng' : 'Đã tạo người dùng mới');
      this.router.navigate(['/iam/users']);
    }, 500);
  }
}
