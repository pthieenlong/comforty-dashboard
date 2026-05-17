import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  FormArray,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucidePlus, LucideTrash2 } from '@lucide/angular';
import {
  BreadcrumbComponent,
  ButtonComponent,
  CardComponent,
  FormFieldComponent,
  IconComponent,
  ImageUploadGridComponent,
  InputComponent,
  PriceInputComponent,
  SelectComponent,
  type SelectOption,
  StepperComponent,
  StepperStepDirective,
  TextareaComponent,
  ToastService,
  TreeSelectComponent,
  type TreeNode,
} from '@/shared/ui';
import { BRANDS } from '../brand.mock';
import { buildCategoryTree } from '../category.mock';
import { ATTRIBUTE_PRESETS, findPreset } from '../attribute-presets';
import { findProduct } from '../product.mock';
import type { ICategory, ProductStatus } from '../product.types';

interface InfoForm {
  name: FormControl<string>;
  sku: FormControl<string>;
  brandId: FormControl<string>;
  categoryId: FormControl<string | null>;
  status: FormControl<ProductStatus>;
  description: FormControl<string>;
}

interface AttributeRowForm {
  key: FormControl<string>;
  label: FormControl<string>;
  values: FormControl<string[]>;
}

interface VariantRowForm {
  comboKey: FormControl<string>;
  sku: FormControl<string>;
  price: FormControl<number | null>;
  stock: FormControl<number | null>;
}

const STATUS_OPTIONS: SelectOption<ProductStatus>[] = [
  { value: 'draft', label: 'Nháp' },
  { value: 'active', label: 'Đang bán' },
  { value: 'archived', label: 'Ngừng bán' },
];

const STEP_KEYS = ['info', 'attributes', 'images', 'pricing'] as const;

@Component({
  selector: 'app-product-form',
  imports: [
    BreadcrumbComponent,
    ButtonComponent,
    CardComponent,
    FormFieldComponent,
    FormsModule,
    IconComponent,
    ImageUploadGridComponent,
    InputComponent,
    PriceInputComponent,
    ReactiveFormsModule,
    RouterLink,
    SelectComponent,
    StepperComponent,
    StepperStepDirective,
    TextareaComponent,
    TreeSelectComponent,
  ],
  template: `
    <div class="space-y-6">
      <div>
        <app-breadcrumb [items]="breadcrumb()" />
        <h1 class="mt-2 text-2xl font-bold text-slate-900">{{ headingText() }}</h1>
        <p class="mt-1 text-sm text-slate-500">{{ subHeadingText() }}</p>
      </div>

      <app-card padding="lg">
        <app-stepper [(activeKey)]="activeStep" [mode]="stepperMode()">
          <ng-template
            appStepperStep="info"
            appStepperStepLabel="Thông tin cơ bản"
            appStepperStepDescription="Tên, SKU, danh mục, mô tả"
            [appStepperStepValid]="infoValid()"
          >
            <form [formGroup]="infoForm" novalidate class="grid gap-4 sm:grid-cols-2">
              <app-form-field
                for="p-name"
                label="Tên sản phẩm"
                [required]="true"
                [errorText]="nameError()"
                class="sm:col-span-2"
              >
                <app-input
                  id="p-name"
                  placeholder="Áo thun nam Comforty Essential"
                  formControlName="name"
                  [invalid]="!!nameError()"
                />
              </app-form-field>

              <app-form-field
                for="p-sku"
                label="SKU gốc"
                [required]="true"
                [errorText]="skuError()"
                hint="Variant SKU sẽ tự sinh từ SKU gốc + giá trị thuộc tính."
              >
                <app-input
                  id="p-sku"
                  placeholder="CMF-MEN-TS-001"
                  formControlName="sku"
                  [invalid]="!!skuError()"
                />
              </app-form-field>

              <app-form-field for="p-status" label="Trạng thái" [required]="true">
                <app-select id="p-status" [options]="statusOptions" formControlName="status" />
              </app-form-field>

              <app-form-field
                for="p-brand"
                label="Thương hiệu"
                [required]="true"
                [errorText]="brandError()"
              >
                <app-select
                  id="p-brand"
                  [options]="brandOptions"
                  placeholder="Chọn thương hiệu"
                  [searchable]="true"
                  formControlName="brandId"
                  [invalid]="!!brandError()"
                />
              </app-form-field>

              <app-form-field
                for="p-cat"
                label="Danh mục"
                [required]="true"
                [errorText]="categoryError()"
              >
                <app-tree-select
                  id="p-cat"
                  [nodes]="categoryNodes()"
                  placeholder="Chọn danh mục"
                  [allowClear]="false"
                  formControlName="categoryId"
                  [invalid]="!!categoryError()"
                />
              </app-form-field>

              <app-form-field
                for="p-desc"
                label="Mô tả"
                class="sm:col-span-2"
                hint="Mô tả ngắn về chất liệu, form dáng, công dụng."
              >
                <app-textarea
                  id="p-desc"
                  placeholder="Áo thun cotton 100%..."
                  [rows]="4"
                  [maxLength]="500"
                  formControlName="description"
                />
              </app-form-field>
            </form>
          </ng-template>

          <ng-template
            appStepperStep="attributes"
            appStepperStepLabel="Thuộc tính"
            appStepperStepDescription="Khai báo variant attributes"
            [appStepperStepValid]="attributesValid()"
          >
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <p class="text-sm text-slate-600">
                  Chọn các thuộc tính ảnh hưởng đến variant. Hệ thống sẽ tự sinh tổ hợp variant ở
                  bước Pricing.
                </p>
                <app-button variant="secondary" size="sm" (click)="addAttribute()">
                  <app-icon [icon]="plusIcon" size="sm" />
                  Thêm thuộc tính
                </app-button>
              </div>

              @if (attrRows.length === 0) {
                <div
                  class="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500"
                >
                  Sản phẩm chưa có thuộc tính. Nếu chỉ có 1 SKU, bỏ qua bước này.
                </div>
              } @else {
                <div class="space-y-3">
                  @for (row of attrRows.controls; track $index; let i = $index) {
                    <div
                      class="grid gap-3 rounded-lg border border-slate-200 p-3 sm:grid-cols-[1fr_2fr_auto]"
                      [formGroup]="$any(row)"
                    >
                      <app-form-field [for]="'attr-preset-' + i" label="Thuộc tính">
                        <app-select
                          [id]="'attr-preset-' + i"
                          [options]="presetOptions"
                          placeholder="Chọn thuộc tính"
                          formControlName="key"
                          (ngModelChange)="onPresetChange(i)"
                        />
                      </app-form-field>

                      <app-form-field
                        [for]="'attr-values-' + i"
                        label="Giá trị"
                        hint="Tick chọn từ preset, hoặc xóa thuộc tính nếu không cần."
                      >
                        @if (presetValuesFor(i); as values) {
                          @if (values.length > 0) {
                            <div class="flex flex-wrap gap-1.5 pt-1">
                              @for (v of values; track v) {
                                <button
                                  type="button"
                                  [class]="valueChipClasses(i, v)"
                                  (click)="toggleValue(i, v)"
                                >
                                  {{ v }}
                                </button>
                              }
                            </div>
                          } @else {
                            <p class="pt-2 text-xs text-slate-400">
                              Chọn thuộc tính ở bên trái để xem giá trị.
                            </p>
                          }
                        }
                      </app-form-field>

                      <div class="flex items-end pb-1">
                        <button
                          type="button"
                          class="rounded p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                          [attr.aria-label]="'Xóa thuộc tính'"
                          (click)="removeAttribute(i)"
                        >
                          <app-icon [icon]="trashIcon" size="sm" />
                        </button>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          </ng-template>

          <ng-template
            appStepperStep="images"
            appStepperStepLabel="Hình ảnh"
            appStepperStepDescription="Tối đa 8 ảnh, ảnh đầu là ảnh chính"
            [appStepperStepValid]="true"
          >
            <app-image-upload-grid id="p-images" [maxImages]="8" [formControl]="imagesControl" />
          </ng-template>

          <ng-template
            appStepperStep="pricing"
            appStepperStepLabel="Giá & Tồn kho"
            appStepperStepDescription="Điền giá và tồn kho cho từng variant"
            [appStepperStepValid]="pricingValid()"
          >
            <div class="space-y-4">
              @if (variantRows.length === 0) {
                <div
                  class="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500"
                >
                  Chưa có variant nào. Quay lại bước Thuộc tính để khai báo.
                </div>
              } @else {
                <div class="flex flex-wrap items-end justify-between gap-3">
                  <p class="text-sm text-slate-600">
                    Tổng <strong>{{ variantRows.length }}</strong> variant. Có thể áp giá đồng loạt.
                  </p>
                  <div class="flex items-end gap-2">
                    <app-form-field for="bulk-price" label="Áp giá đồng loạt">
                      <app-price-input id="bulk-price" [(ngModel)]="bulkPrice" />
                    </app-form-field>
                    <app-button variant="secondary" size="md" (click)="applyBulkPrice()">
                      Áp dụng
                    </app-button>
                  </div>
                </div>

                <div class="overflow-x-auto rounded-lg border border-slate-200">
                  <table class="w-full text-sm">
                    <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th class="px-3 py-2 text-left font-medium">Variant</th>
                        <th class="px-3 py-2 text-left font-medium">SKU</th>
                        <th class="px-3 py-2 text-left font-medium w-44">Giá</th>
                        <th class="px-3 py-2 text-left font-medium w-32">Tồn kho</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                      @for (
                        row of variantRows.controls;
                        track row.controls.comboKey.value;
                        let i = $index
                      ) {
                        <tr [formGroup]="$any(row)">
                          <td class="px-3 py-2 text-slate-700">
                            {{ variantLabel(i) }}
                          </td>
                          <td class="px-3 py-2">
                            <app-input [id]="'v-sku-' + i" formControlName="sku" inputSize="sm" />
                          </td>
                          <td class="px-3 py-2">
                            <app-price-input [id]="'v-price-' + i" formControlName="price" />
                          </td>
                          <td class="px-3 py-2">
                            <app-input
                              [id]="'v-stock-' + i"
                              type="number"
                              formControlName="stock"
                              inputSize="sm"
                            />
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              }
            </div>
          </ng-template>
        </app-stepper>

        <div class="mt-6 flex items-center justify-between gap-2 border-t border-slate-100 pt-4">
          <a routerLink="/catalog/products">
            <app-button variant="secondary" type="button">Hủy</app-button>
          </a>
          <div class="flex gap-2">
            @if (!stepper()?.isFirst()) {
              <app-button variant="secondary" type="button" (click)="goPrev()">
                Quay lại
              </app-button>
            }
            @if (!stepper()?.isLast()) {
              <app-button type="button" [disabled]="!canGoNext()" (click)="goNext()">
                Tiếp tục
              </app-button>
            } @else {
              <app-button
                type="button"
                [loading]="submitting()"
                [disabled]="!canSubmit()"
                (click)="onSubmit()"
              >
                {{ id() ? 'Lưu thay đổi' : 'Tạo sản phẩm' }}
              </app-button>
            }
          </div>
        </div>
      </app-card>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductFormComponent {
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly id = input<string | null>(null);

  protected readonly plusIcon = LucidePlus.icon;
  protected readonly trashIcon = LucideTrash2.icon;

  protected readonly stepper = viewChild(StepperComponent);

  protected readonly activeStep = signal<string>(STEP_KEYS[0]);
  protected readonly submitting = signal(false);
  protected readonly bulkPrice = signal<number | null>(null);

  protected readonly stepperMode = computed<'strict' | 'free'>(() =>
    this.id() ? 'free' : 'strict',
  );

  protected readonly statusOptions = STATUS_OPTIONS;
  protected readonly brandOptions: SelectOption<string>[] = BRANDS.map((b) => ({
    value: b.id,
    label: b.name,
  }));
  protected readonly presetOptions: SelectOption<string>[] = ATTRIBUTE_PRESETS.map((p) => ({
    value: p.key,
    label: p.label,
  }));

  protected readonly categoryNodes = computed<TreeNode<ICategory>[]>(() => {
    const roots = buildCategoryTree();
    const toTreeNode = (
      node: ReturnType<typeof buildCategoryTree>[number],
    ): TreeNode<ICategory> => ({
      id: node.id,
      label: node.name,
      data: node,
      children: node.children.map(toTreeNode),
    });
    return roots.map(toTreeNode);
  });

  protected readonly infoForm = new FormGroup<InfoForm>({
    name: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)],
    }),
    sku: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^[A-Z0-9-]{4,40}$/)],
    }),
    brandId: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    categoryId: new FormControl<string | null>(null, {
      validators: [Validators.required],
    }),
    status: new FormControl<ProductStatus>('draft', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    description: new FormControl<string>('', { nonNullable: true }),
  });

  protected readonly attrRows = new FormArray<FormGroup<AttributeRowForm>>([]);
  protected readonly variantRows = new FormArray<FormGroup<VariantRowForm>>([]);
  protected readonly imagesControl = new FormControl<string[]>([], { nonNullable: true });

  private readonly infoStatus = toSignal(this.infoForm.statusChanges, {
    initialValue: this.infoForm.status,
  });
  private readonly attrStatus = toSignal(this.attrRows.statusChanges, {
    initialValue: this.attrRows.status,
  });
  private readonly variantStatus = toSignal(this.variantRows.statusChanges, {
    initialValue: this.variantRows.status,
  });
  // Force template recompute when any row value changes.
  private readonly attrValue = toSignal(this.attrRows.valueChanges, {
    initialValue: this.attrRows.value,
  });
  private readonly variantValue = toSignal(this.variantRows.valueChanges, {
    initialValue: this.variantRows.value,
  });

  protected readonly infoValid = computed(() => {
    this.infoStatus();
    return this.infoForm.valid;
  });

  protected readonly attributesValid = computed(() => {
    this.attrStatus();
    this.attrValue();
    return this.attrRows.controls.every((row) => {
      const key = row.controls.key.value;
      const values = row.controls.values.value;
      return !!key && values.length > 0;
    });
  });

  protected readonly pricingValid = computed(() => {
    this.variantStatus();
    this.variantValue();
    if (this.variantRows.length === 0) return true;
    return this.variantRows.controls.every((row) => {
      const price = row.controls.price.value;
      const stock = row.controls.stock.value;
      const sku = row.controls.sku.value;
      return price !== null && price > 0 && stock !== null && stock >= 0 && !!sku;
    });
  });

  protected readonly breadcrumb = computed(() => [
    { label: 'Sản phẩm' },
    { label: 'Danh sách', to: '/catalog/products' },
    { label: this.id() ? 'Chỉnh sửa' : 'Thêm mới' },
  ]);

  protected readonly headingText = computed(() =>
    this.id() ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới',
  );
  protected readonly subHeadingText = computed(() =>
    this.id()
      ? 'Cập nhật thông tin, thuộc tính, ảnh và giá. Có thể nhảy giữa các bước tự do.'
      : 'Hoàn thành từng bước theo thứ tự để tạo sản phẩm với variant matrix.',
  );

  protected readonly nameError = computed(() => {
    this.infoStatus();
    const ctrl = this.infoForm.controls.name;
    if (!ctrl.dirty && !ctrl.touched) return '';
    if (ctrl.hasError('required')) return 'Vui lòng nhập tên sản phẩm.';
    if (ctrl.hasError('minlength')) return 'Tên tối thiểu 3 ký tự.';
    return '';
  });

  protected readonly skuError = computed(() => {
    this.infoStatus();
    const ctrl = this.infoForm.controls.sku;
    if (!ctrl.dirty && !ctrl.touched) return '';
    if (ctrl.hasError('required')) return 'Vui lòng nhập SKU.';
    if (ctrl.hasError('pattern')) return 'SKU chỉ gồm chữ HOA, số và dấu - (4–40 ký tự).';
    return '';
  });

  protected readonly brandError = computed(() => {
    this.infoStatus();
    const ctrl = this.infoForm.controls.brandId;
    if (!ctrl.dirty && !ctrl.touched) return '';
    return ctrl.hasError('required') ? 'Vui lòng chọn thương hiệu.' : '';
  });

  protected readonly categoryError = computed(() => {
    this.infoStatus();
    const ctrl = this.infoForm.controls.categoryId;
    if (!ctrl.dirty && !ctrl.touched) return '';
    return ctrl.hasError('required') ? 'Vui lòng chọn danh mục.' : '';
  });

  constructor() {
    queueMicrotask(() => {
      const pid = this.id();
      if (!pid) return;
      const product = findProduct(pid);
      if (!product) return;

      this.infoForm.patchValue({
        name: product.name,
        sku: product.sku,
        brandId: product.brandId,
        categoryId: product.categoryId,
        status: product.status,
        description: product.description,
      });
      this.infoForm.controls.sku.disable();

      product.attributes.forEach((attr) => {
        this.attrRows.push(
          new FormGroup<AttributeRowForm>({
            key: new FormControl<string>(attr.key, { nonNullable: true }),
            label: new FormControl<string>(attr.label, { nonNullable: true }),
            values: new FormControl<string[]>([...attr.values], { nonNullable: true }),
          }),
        );
      });

      this.imagesControl.setValue([...product.images]);
      this.regenerateVariants(product.variants);
    });
  }

  protected addAttribute(): void {
    this.attrRows.push(
      new FormGroup<AttributeRowForm>({
        key: new FormControl<string>('', { nonNullable: true }),
        label: new FormControl<string>('', { nonNullable: true }),
        values: new FormControl<string[]>([], { nonNullable: true }),
      }),
    );
  }

  protected removeAttribute(index: number): void {
    this.attrRows.removeAt(index);
  }

  protected onPresetChange(index: number): void {
    const row = this.attrRows.at(index);
    const key = row.controls.key.value;
    const preset = findPreset(key);
    if (preset) {
      row.controls.label.setValue(preset.label);
      row.controls.values.setValue([]);
    }
  }

  protected presetValuesFor(index: number): string[] {
    const key = this.attrRows.at(index).controls.key.value;
    return findPreset(key)?.values ?? [];
  }

  protected toggleValue(index: number, value: string): void {
    const ctrl = this.attrRows.at(index).controls.values;
    const current = ctrl.value;
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    ctrl.setValue(next);
  }

  protected valueChipClasses(index: number, value: string): string {
    const selected = this.attrRows.at(index).controls.values.value.includes(value);
    const base = 'rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset transition';
    return selected
      ? `${base} bg-indigo-600 text-white ring-indigo-600`
      : `${base} bg-white text-slate-700 ring-slate-300 hover:bg-slate-50`;
  }

  protected variantLabel(index: number): string {
    const comboKey = this.variantRows.at(index).controls.comboKey.value;
    if (!comboKey) return '(default)';
    return comboKey
      .split('|')
      .map((pair) => pair.split('=')[1])
      .join(' / ');
  }

  protected applyBulkPrice(): void {
    const price = this.bulkPrice();
    if (price === null) return;
    this.variantRows.controls.forEach((row) => row.controls.price.setValue(price));
  }

  protected canGoNext(): boolean {
    const idx = STEP_KEYS.indexOf(this.activeStep() as (typeof STEP_KEYS)[number]);
    if (idx === 0) return this.infoValid();
    if (idx === 1) return true; // attributes optional
    if (idx === 2) return true;
    return true;
  }

  protected canSubmit(): boolean {
    return this.infoValid() && this.pricingValid();
  }

  protected goNext(): void {
    const idx = STEP_KEYS.indexOf(this.activeStep() as (typeof STEP_KEYS)[number]);
    if (idx === 1) {
      // Coming out of Attributes — regenerate variant rows.
      this.regenerateVariants();
    }
    this.stepper()?.next();
  }

  protected goPrev(): void {
    this.stepper()?.prev();
  }

  protected onSubmit(): void {
    if (!this.canSubmit()) {
      this.infoForm.markAllAsTouched();
      this.variantRows.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    setTimeout(() => {
      this.submitting.set(false);
      this.toast.success(
        this.id() ? 'Đã cập nhật sản phẩm' : 'Đã tạo sản phẩm mới',
        `${this.variantRows.length} variant được lưu.`,
      );
      this.router.navigate(['/catalog/products']);
    }, 500);
  }

  /**
   * Build variant rows from current attribute selections, preserving any
   * price/stock/sku for combos that still exist.
   */
  private regenerateVariants(
    prefill?: { sku: string; price: number; stock: number; attributes: Record<string, string> }[],
  ): void {
    const attrs = this.attrRows.controls
      .map((row) => ({
        key: row.controls.key.value,
        values: row.controls.values.value,
      }))
      .filter((a) => a.key && a.values.length > 0);

    const baseSku = this.infoForm.controls.sku.value || 'NEW';
    const previous = new Map<string, { sku: string; price: number | null; stock: number | null }>();
    this.variantRows.controls.forEach((row) => {
      previous.set(row.controls.comboKey.value, {
        sku: row.controls.sku.value,
        price: row.controls.price.value,
        stock: row.controls.stock.value,
      });
    });
    if (prefill) {
      prefill.forEach((v) => {
        const comboKey = this.makeComboKey(v.attributes);
        previous.set(comboKey, { sku: v.sku, price: v.price, stock: v.stock });
      });
    }

    const combos = this.cartesian(attrs);
    this.variantRows.clear();

    if (combos.length === 0 || (combos.length === 1 && Object.keys(combos[0] ?? {}).length === 0)) {
      // No attributes — single default variant.
      const restored = previous.get('');
      this.variantRows.push(
        new FormGroup<VariantRowForm>({
          comboKey: new FormControl<string>('', { nonNullable: true }),
          sku: new FormControl<string>(restored?.sku ?? baseSku, { nonNullable: true }),
          price: new FormControl<number | null>(restored?.price ?? null),
          stock: new FormControl<number | null>(restored?.stock ?? 0),
        }),
      );
      return;
    }

    combos.forEach((combo) => {
      const comboKey = this.makeComboKey(combo);
      const suffix = Object.values(combo)
        .map((v) =>
          v
            .slice(0, 3)
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, ''),
        )
        .join('-');
      const restored = previous.get(comboKey);
      this.variantRows.push(
        new FormGroup<VariantRowForm>({
          comboKey: new FormControl<string>(comboKey, { nonNullable: true }),
          sku: new FormControl<string>(restored?.sku ?? `${baseSku}-${suffix}`, {
            nonNullable: true,
          }),
          price: new FormControl<number | null>(restored?.price ?? null),
          stock: new FormControl<number | null>(restored?.stock ?? 0),
        }),
      );
    });
  }

  private cartesian(attrs: { key: string; values: string[] }[]): Record<string, string>[] {
    if (attrs.length === 0) return [{}];
    return attrs.reduce<Record<string, string>[]>(
      (acc, attr) => acc.flatMap((combo) => attr.values.map((v) => ({ ...combo, [attr.key]: v }))),
      [{}],
    );
  }

  private makeComboKey(combo: Record<string, string>): string {
    return Object.entries(combo)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('|');
  }
}
