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
import { findTenant } from '@/core/tenant/tenant.mock';
import type { TenantStatus } from '@/core/tenant/tenant.types';

interface TenantForm {
  name: FormControl<string>;
  city: FormControl<string>;
  address: FormControl<string>;
  phone: FormControl<string>;
  email: FormControl<string>;
  managerName: FormControl<string>;
  status: FormControl<TenantStatus>;
  active: FormControl<boolean>;
}

const STATUS_OPTIONS: SelectOption<TenantStatus>[] = [
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'inactive', label: 'Tạm ngưng' },
];

@Component({
  selector: 'app-tenant-form',
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
    @if (tenant(); as t) {
      <div class="space-y-6">
        <div>
          <app-breadcrumb [items]="breadcrumb()" />
          <h1 class="mt-2 text-2xl font-bold text-slate-900">Chỉnh sửa chi nhánh</h1>
          <p class="mt-1 text-sm text-slate-500">
            Cập nhật thông tin liên hệ và trạng thái hoạt động. Mã và loại chi nhánh không thể đổi.
          </p>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate class="space-y-5">
          <app-card padding="lg">
            <app-card-header
              title="Thông tin cơ bản"
              description="Mã và loại chi nhánh được khóa để tránh ảnh hưởng dữ liệu cũ."
            />
            <div class="grid gap-4 sm:grid-cols-2">
              <app-form-field for="tenant-code" label="Mã chi nhánh">
                <div
                  id="tenant-code"
                  class="min-h-[38px] rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 font-mono"
                >
                  {{ t.code }}
                </div>
              </app-form-field>

              <app-form-field for="tenant-type" label="Loại">
                <div
                  id="tenant-type"
                  class="min-h-[38px] rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600"
                >
                  {{ t.type === 'hq' ? 'Trụ sở chính' : 'Chi nhánh bán lẻ' }}
                </div>
              </app-form-field>

              <app-form-field
                for="tenant-name"
                label="Tên chi nhánh"
                [required]="true"
                [errorText]="nameError()"
              >
                <app-input
                  id="tenant-name"
                  placeholder="Chi nhánh Quận 1"
                  formControlName="name"
                  [invalid]="!!nameError()"
                />
              </app-form-field>

              <app-form-field for="tenant-status" label="Trạng thái" [required]="true">
                <app-select id="tenant-status" [options]="statusOptions" formControlName="status" />
              </app-form-field>
            </div>
          </app-card>

          <app-card padding="lg">
            <app-card-header
              title="Địa chỉ & Liên hệ"
              description="Hiển thị trên hóa đơn, email giao dịch và Google Maps."
            />
            <div class="grid gap-4 sm:grid-cols-2">
              <app-form-field
                for="tenant-city"
                label="Thành phố"
                [required]="true"
                [errorText]="cityError()"
              >
                <app-input
                  id="tenant-city"
                  placeholder="TP. Hồ Chí Minh"
                  formControlName="city"
                  [invalid]="!!cityError()"
                />
              </app-form-field>

              <app-form-field
                for="tenant-manager"
                label="Quản lý chi nhánh"
                [required]="true"
                [errorText]="managerError()"
              >
                <app-input
                  id="tenant-manager"
                  placeholder="Nguyễn Văn A"
                  formControlName="managerName"
                  [invalid]="!!managerError()"
                />
              </app-form-field>

              <app-form-field
                for="tenant-address"
                label="Địa chỉ"
                [required]="true"
                [errorText]="addressError()"
                class="sm:col-span-2"
              >
                <app-input
                  id="tenant-address"
                  placeholder="Số nhà, đường, phường, quận"
                  formControlName="address"
                  [invalid]="!!addressError()"
                />
              </app-form-field>

              <app-form-field
                for="tenant-phone"
                label="Số điện thoại"
                [required]="true"
                [errorText]="phoneError()"
              >
                <app-input
                  id="tenant-phone"
                  type="tel"
                  placeholder="028 3823 4567"
                  formControlName="phone"
                  [invalid]="!!phoneError()"
                />
              </app-form-field>

              <app-form-field
                for="tenant-email"
                label="Email liên hệ"
                [required]="true"
                [errorText]="emailError()"
              >
                <app-input
                  id="tenant-email"
                  type="email"
                  placeholder="chinhanh@comforty.vn"
                  formControlName="email"
                  [invalid]="!!emailError()"
                />
              </app-form-field>
            </div>
          </app-card>

          <app-card padding="lg">
            <app-card-header
              title="Tùy chọn vận hành"
              description="Tắt khi chi nhánh tạm ngừng giao dịch."
            />
            <app-switch
              id="tenant-active"
              label="Cho phép giao dịch POS và đặt hàng online"
              formControlName="active"
            />
          </app-card>

          <div class="flex items-center justify-end gap-2">
            <a [routerLink]="['/tenants', t.id]">
              <app-button variant="secondary" type="button">Hủy</app-button>
            </a>
            <app-button type="submit" [loading]="submitting()">Lưu thay đổi</app-button>
          </div>
        </form>
      </div>
    } @else {
      <div class="rounded-lg border border-slate-200 bg-white p-8 text-center">
        <h2 class="text-lg font-semibold text-slate-900">Không tìm thấy chi nhánh</h2>
        <a routerLink="/tenants" class="mt-4 inline-block">
          <app-button variant="primary">Quay lại danh sách</app-button>
        </a>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TenantFormComponent {
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly id = input.required<string>();

  protected readonly statusOptions = STATUS_OPTIONS;

  protected readonly form = new FormGroup<TenantForm>({
    name: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    city: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    address: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(5)],
    }),
    phone: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^[0-9\s+\-()]{8,15}$/)],
    }),
    email: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    managerName: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    status: new FormControl<TenantStatus>('active', {
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

  protected readonly tenant = computed(() => findTenant(this.id()));

  protected readonly breadcrumb = computed(() => [
    { label: 'Hệ thống' },
    { label: 'Chi nhánh', to: '/tenants' },
    { label: this.tenant()?.name ?? this.id(), to: `/tenants/${this.id()}` },
    { label: 'Chỉnh sửa' },
  ]);

  protected readonly nameError = computed(() => {
    this.formValue();
    this.formStatus();
    if (!this.submitted()) return '';
    const ctrl = this.form.controls.name;
    if (ctrl.hasError('required')) return 'Vui lòng nhập tên chi nhánh.';
    if (ctrl.hasError('minlength')) return 'Tên tối thiểu 2 ký tự.';
    return '';
  });

  protected readonly cityError = computed(() => {
    this.formValue();
    this.formStatus();
    if (!this.submitted()) return '';
    return this.form.controls.city.hasError('required') ? 'Vui lòng nhập thành phố.' : '';
  });

  protected readonly addressError = computed(() => {
    this.formValue();
    this.formStatus();
    if (!this.submitted()) return '';
    const ctrl = this.form.controls.address;
    if (ctrl.hasError('required')) return 'Vui lòng nhập địa chỉ.';
    if (ctrl.hasError('minlength')) return 'Địa chỉ quá ngắn.';
    return '';
  });

  protected readonly phoneError = computed(() => {
    this.formValue();
    this.formStatus();
    if (!this.submitted()) return '';
    const ctrl = this.form.controls.phone;
    if (ctrl.hasError('required')) return 'Vui lòng nhập số điện thoại.';
    if (ctrl.hasError('pattern')) return 'Số điện thoại không hợp lệ.';
    return '';
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

  protected readonly managerError = computed(() => {
    this.formValue();
    this.formStatus();
    if (!this.submitted()) return '';
    const ctrl = this.form.controls.managerName;
    if (ctrl.hasError('required')) return 'Vui lòng nhập tên quản lý.';
    if (ctrl.hasError('minlength')) return 'Tên quản lý tối thiểu 2 ký tự.';
    return '';
  });

  constructor() {
    queueMicrotask(() => {
      const t = this.tenant();
      if (t) {
        this.form.patchValue({
          name: t.name,
          city: t.city,
          address: t.address,
          phone: t.phone,
          email: t.email,
          managerName: t.managerName,
          status: t.status,
          active: t.status === 'active',
        });
      }
    });
  }

  protected onSubmit(): void {
    this.submitted.set(true);
    if (this.form.invalid) return;
    this.submitting.set(true);
    setTimeout(() => {
      this.submitting.set(false);
      this.toast.success('Đã cập nhật chi nhánh');
      this.router.navigate(['/tenants', this.id()]);
    }, 500);
  }
}
