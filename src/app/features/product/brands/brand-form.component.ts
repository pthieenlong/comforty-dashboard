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
  SwitchComponent,
  TextareaComponent,
  ToastService,
} from '@/shared/ui';
import { findBrand } from '../brand.mock';

interface BrandForm {
  code: FormControl<string>;
  name: FormControl<string>;
  country: FormControl<string>;
  website: FormControl<string>;
  description: FormControl<string>;
  active: FormControl<boolean>;
}

@Component({
  selector: 'app-brand-form',
  imports: [
    BreadcrumbComponent,
    ButtonComponent,
    CardComponent,
    CardHeaderComponent,
    FormFieldComponent,
    InputComponent,
    ReactiveFormsModule,
    RouterLink,
    SwitchComponent,
    TextareaComponent,
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
            title="Thông tin thương hiệu"
            description="Mã thương hiệu được dùng làm prefix SKU và không thể đổi sau khi tạo."
          />
          <div class="grid gap-4 sm:grid-cols-2">
            <app-form-field
              for="brand-code"
              label="Mã thương hiệu"
              [required]="true"
              [errorText]="codeError()"
            >
              <app-input
                id="brand-code"
                placeholder="CMF"
                formControlName="code"
                [invalid]="!!codeError()"
              />
            </app-form-field>

            <app-form-field
              for="brand-name"
              label="Tên thương hiệu"
              [required]="true"
              [errorText]="nameError()"
            >
              <app-input
                id="brand-name"
                placeholder="Comforty"
                formControlName="name"
                [invalid]="!!nameError()"
              />
            </app-form-field>

            <app-form-field
              for="brand-country"
              label="Quốc gia"
              [required]="true"
              [errorText]="countryError()"
            >
              <app-input
                id="brand-country"
                placeholder="Việt Nam"
                formControlName="country"
                [invalid]="!!countryError()"
              />
            </app-form-field>

            <app-form-field for="brand-website" label="Website" [errorText]="websiteError()">
              <app-input
                id="brand-website"
                type="url"
                placeholder="https://comforty.vn"
                formControlName="website"
                [invalid]="!!websiteError()"
              />
            </app-form-field>

            <app-form-field
              for="brand-description"
              label="Mô tả"
              hint="Tối đa 280 ký tự, hiển thị trong chi tiết thương hiệu."
              class="sm:col-span-2"
            >
              <app-textarea
                id="brand-description"
                placeholder="Mô tả ngắn về thương hiệu..."
                [rows]="3"
                [maxLength]="280"
                formControlName="description"
              />
            </app-form-field>
          </div>
        </app-card>

        <app-card padding="lg">
          <app-card-header
            title="Tùy chọn"
            description="Tắt khi tạm ngừng nhập hàng, sản phẩm cũ vẫn còn nhưng không cho tạo mới."
          />
          <app-switch
            id="brand-active"
            label="Đang phân phối trong hệ thống"
            formControlName="active"
          />
        </app-card>

        <div class="flex items-center justify-end gap-2">
          <a routerLink="/catalog/brands">
            <app-button variant="secondary" type="button">Hủy</app-button>
          </a>
          <app-button type="submit" [loading]="submitting()">
            {{ id() ? 'Lưu thay đổi' : 'Tạo thương hiệu' }}
          </app-button>
        </div>
      </form>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrandFormComponent {
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly id = input<string | null>(null);

  protected readonly form = new FormGroup<BrandForm>({
    code: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^[A-Z]{2,5}$/)],
    }),
    name: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    country: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    website: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.pattern(/^https?:\/\/.+/)],
    }),
    description: new FormControl<string>('', { nonNullable: true }),
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
    { label: 'Sản phẩm' },
    { label: 'Thương hiệu', to: '/catalog/brands' },
    { label: this.id() ? 'Chỉnh sửa' : 'Thêm mới' },
  ]);

  protected readonly headingText = computed(() =>
    this.id() ? 'Chỉnh sửa thương hiệu' : 'Thêm thương hiệu mới',
  );
  protected readonly subHeadingText = computed(() =>
    this.id()
      ? 'Cập nhật thông tin và trạng thái phân phối.'
      : 'Khai báo thương hiệu mới để gán cho sản phẩm.',
  );

  protected readonly codeError = computed(() => {
    this.formValue();
    this.formStatus();
    if (!this.submitted()) return '';
    const ctrl = this.form.controls.code;
    if (ctrl.hasError('required')) return 'Vui lòng nhập mã.';
    if (ctrl.hasError('pattern')) return 'Mã phải gồm 2–5 ký tự viết hoa (vd: CMF).';
    return '';
  });

  protected readonly nameError = computed(() => {
    this.formValue();
    this.formStatus();
    if (!this.submitted()) return '';
    const ctrl = this.form.controls.name;
    if (ctrl.hasError('required')) return 'Vui lòng nhập tên thương hiệu.';
    if (ctrl.hasError('minlength')) return 'Tên tối thiểu 2 ký tự.';
    return '';
  });

  protected readonly countryError = computed(() => {
    this.formValue();
    this.formStatus();
    if (!this.submitted()) return '';
    return this.form.controls.country.hasError('required') ? 'Vui lòng nhập quốc gia.' : '';
  });

  protected readonly websiteError = computed(() => {
    this.formValue();
    this.formStatus();
    if (!this.submitted()) return '';
    return this.form.controls.website.hasError('pattern')
      ? 'Website phải bắt đầu bằng http:// hoặc https://'
      : '';
  });

  constructor() {
    queueMicrotask(() => {
      const bid = this.id();
      if (!bid) return;
      const brand = findBrand(bid);
      if (!brand) return;
      this.form.patchValue({
        code: brand.code,
        name: brand.name,
        country: brand.country,
        website: brand.website,
        description: brand.description,
        active: brand.active,
      });
      this.form.controls.code.disable();
    });
  }

  protected onSubmit(): void {
    this.submitted.set(true);
    if (this.form.invalid) return;
    this.submitting.set(true);
    setTimeout(() => {
      this.submitting.set(false);
      this.toast.success(this.id() ? 'Đã cập nhật thương hiệu' : 'Đã tạo thương hiệu mới');
      this.router.navigate(['/catalog/brands']);
    }, 500);
  }
}
