import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideFolderPlus, LucideTrash2 } from '@lucide/angular';
import {
  BadgeComponent,
  ButtonComponent,
  CardComponent,
  ConfirmDialogService,
  EmptyStateComponent,
  FormFieldComponent,
  IconComponent,
  InputComponent,
  NumberInputComponent,
  PageHeaderComponent,
  SwitchComponent,
  TextareaComponent,
  ToastService,
  TreeComponent,
  type TreeNode,
  TreeSelectComponent,
} from '@/shared/ui';
import { CATEGORIES, buildCategoryTree, findCategory, getCategoryPath } from '../category.mock';
import type { ICategory } from '../product.types';

interface CategoryForm {
  code: FormControl<string>;
  name: FormControl<string>;
  parentId: FormControl<string | null>;
  description: FormControl<string>;
  sortOrder: FormControl<number | null>;
  active: FormControl<boolean>;
}

type Mode = 'idle' | 'create' | 'edit';

@Component({
  selector: 'app-categories-page',
  imports: [
    BadgeComponent,
    ButtonComponent,
    CardComponent,
    EmptyStateComponent,
    FormFieldComponent,
    IconComponent,
    InputComponent,
    NgTemplateOutlet,
    NumberInputComponent,
    PageHeaderComponent,
    ReactiveFormsModule,
    SwitchComponent,
    TextareaComponent,
    TreeComponent,
    TreeSelectComponent,
  ],
  template: `
    <div class="space-y-6">
      <app-page-header
        title="Danh mục"
        description="Cây danh mục đa cấp dùng để phân loại sản phẩm."
        [breadcrumb]="breadcrumb"
      >
        <app-button variant="primary" page-actions (click)="openCreate(null)">
          <app-icon [icon]="folderPlusIcon" size="md" />
          Thêm danh mục gốc
        </app-button>
      </app-page-header>

      <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <app-card padding="md">
          <h2 class="text-sm font-semibold text-slate-700 mb-2">Cây danh mục</h2>
          <app-tree [nodes]="treeNodes()" [(selectedId)]="selectedId">
            <ng-template let-node="node">
              <div class="flex items-center gap-2 min-w-0">
                <span class="text-sm text-slate-900 truncate">{{ node.label }}</span>
                <span class="text-xs text-slate-400 font-mono shrink-0">{{ node.data.code }}</span>
                @if (!node.data.active) {
                  <app-badge variant="neutral" size="sm">Ẩn</app-badge>
                }
                <span class="ml-auto text-xs text-slate-400 shrink-0">
                  {{ node.data.productCount }} SP
                </span>
              </div>
            </ng-template>
          </app-tree>
        </app-card>

        <app-card padding="lg">
          @switch (mode()) {
            @case ('idle') {
              <app-empty-state
                title="Chưa chọn danh mục"
                description="Click vào một node trong cây để xem chi tiết, hoặc thêm danh mục mới."
              />
            }
            @case ('create') {
              <div class="space-y-1 mb-4">
                <h2 class="text-lg font-semibold text-slate-900">Thêm danh mục</h2>
                <p class="text-sm text-slate-500">
                  @if (form.controls.parentId.value) {
                    Dưới {{ parentLabel() }}
                  } @else {
                    Danh mục gốc
                  }
                </p>
              </div>
              <ng-container *ngTemplateOutlet="formTpl" />
            }
            @case ('edit') {
              @if (selected(); as cat) {
                <div class="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <h2 class="text-lg font-semibold text-slate-900">{{ cat.name }}</h2>
                    <p class="text-xs text-slate-500 font-mono">{{ pathLabel() }}</p>
                  </div>
                  <div class="flex gap-2">
                    <app-button variant="primary" size="sm" (click)="openCreate(cat.id)">
                      <app-icon [icon]="folderPlusIcon" size="sm" />
                      Thêm con
                    </app-button>
                    <app-button variant="danger" size="sm" (click)="onDelete(cat)">
                      <app-icon [icon]="trashIcon" size="sm" />
                      Xóa
                    </app-button>
                  </div>
                </div>
                <ng-container *ngTemplateOutlet="formTpl" />
              }
            }
          }
        </app-card>
      </div>
    </div>

    <ng-template #formTpl>
      <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate class="space-y-4">
        <div class="grid gap-4 sm:grid-cols-2">
          <app-form-field for="cat-code" label="Mã" [required]="true" [errorText]="codeError()">
            <app-input
              id="cat-code"
              placeholder="LIV-SF-CR"
              formControlName="code"
              [invalid]="!!codeError()"
            />
          </app-form-field>

          <app-form-field for="cat-name" label="Tên" [required]="true" [errorText]="nameError()">
            <app-input
              id="cat-name"
              placeholder="Sofa góc"
              formControlName="name"
              [invalid]="!!nameError()"
            />
          </app-form-field>

          <app-form-field for="cat-parent" label="Danh mục cha" class="sm:col-span-2">
            <app-tree-select
              id="cat-parent"
              [nodes]="treeNodes()"
              placeholder="Không có (gốc)"
              formControlName="parentId"
            />
          </app-form-field>

          <app-form-field for="cat-sort" label="Thứ tự hiển thị">
            <app-number-input id="cat-sort" [min]="0" formControlName="sortOrder" />
          </app-form-field>

          <div class="flex items-center pt-6">
            <app-switch id="cat-active" label="Đang hiển thị" formControlName="active" />
          </div>

          <app-form-field for="cat-desc" label="Mô tả" class="sm:col-span-2">
            <app-textarea
              id="cat-desc"
              placeholder="Mô tả ngắn..."
              [rows]="2"
              formControlName="description"
            />
          </app-form-field>
        </div>

        <div class="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <app-button variant="secondary" type="button" (click)="cancel()">Hủy</app-button>
          <app-button type="submit" [loading]="submitting()">
            {{ mode() === 'create' ? 'Tạo danh mục' : 'Lưu thay đổi' }}
          </app-button>
        </div>
      </form>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriesPageComponent {
  private readonly toast = inject(ToastService);
  private readonly confirmDialog = inject(ConfirmDialogService);

  protected readonly breadcrumb = [{ label: 'Sản phẩm' }, { label: 'Danh mục' }];

  protected readonly folderPlusIcon = LucideFolderPlus.icon;
  protected readonly trashIcon = LucideTrash2.icon;

  protected readonly categories = signal<ICategory[]>([...CATEGORIES]);
  protected readonly selectedId = signal<string | null>(null);
  protected readonly mode = signal<Mode>('idle');
  protected readonly submitting = signal(false);
  protected readonly submitted = signal(false);

  protected readonly treeNodes = computed<TreeNode<ICategory>[]>(() => {
    const roots = buildCategoryTree(this.categories());
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

  protected readonly selected = computed<ICategory | null>(() => {
    const id = this.selectedId();
    if (!id) return null;
    return this.categories().find((c) => c.id === id) ?? null;
  });

  protected readonly form = new FormGroup<CategoryForm>({
    code: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    name: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    parentId: new FormControl<string | null>(null),
    description: new FormControl<string>('', { nonNullable: true }),
    sortOrder: new FormControl<number | null>(1),
    active: new FormControl<boolean>(true, { nonNullable: true }),
  });

  protected readonly formValue = toSignal(this.form.valueChanges, {
    initialValue: this.form.value,
  });
  protected readonly formStatus = toSignal(this.form.statusChanges, {
    initialValue: this.form.status,
  });

  protected readonly codeError = computed(() => {
    this.formValue();
    this.formStatus();
    if (!this.submitted()) return '';
    const ctrl = this.form.controls.code;
    if (ctrl.hasError('required')) return 'Vui lòng nhập mã.';
    if (ctrl.hasError('minlength')) return 'Mã tối thiểu 2 ký tự.';
    return '';
  });

  protected readonly nameError = computed(() => {
    this.formValue();
    this.formStatus();
    if (!this.submitted()) return '';
    const ctrl = this.form.controls.name;
    if (ctrl.hasError('required')) return 'Vui lòng nhập tên.';
    if (ctrl.hasError('minlength')) return 'Tên tối thiểu 2 ký tự.';
    return '';
  });

  protected readonly parentLabel = computed(() => {
    const pid = this.form.controls.parentId.value;
    if (!pid) return '';
    return findCategory(pid)?.name ?? '';
  });

  protected readonly pathLabel = computed(() => {
    const cat = this.selected();
    if (!cat) return '';
    return getCategoryPath(cat.id)
      .map((c) => c.name)
      .join(' › ');
  });

  constructor() {
    effect(() => {
      const id = this.selectedId();
      if (id && this.mode() !== 'create') {
        const cat = this.categories().find((c) => c.id === id);
        if (cat) this.openEditInternal(cat);
      }
    });
  }

  private openEditInternal(cat: ICategory): void {
    this.mode.set('edit');
    this.submitted.set(false);
    this.form.reset({
      code: cat.code,
      name: cat.name,
      parentId: cat.parentId,
      description: cat.description,
      sortOrder: cat.sortOrder,
      active: cat.active,
    });
    this.form.controls.code.disable();
  }

  protected openCreate(parentId: string | null): void {
    this.mode.set('create');
    this.submitted.set(false);
    this.form.reset({
      code: '',
      name: '',
      parentId,
      description: '',
      sortOrder: 1,
      active: true,
    });
    this.form.controls.code.enable();
  }

  protected cancel(): void {
    this.mode.set('idle');
    this.selectedId.set(null);
  }

  protected onSubmit(): void {
    this.submitted.set(true);
    if (this.form.invalid) return;
    this.submitting.set(true);
    const v = this.form.getRawValue();
    setTimeout(() => {
      this.submitting.set(false);
      if (this.mode() === 'create') {
        const id = `cat-new-${Date.now()}`;
        this.categories.update((list) => [
          ...list,
          {
            id,
            parentId: v.parentId,
            code: v.code,
            name: v.name,
            description: v.description,
            sortOrder: v.sortOrder ?? 1,
            active: v.active,
            productCount: 0,
          },
        ]);
        this.toast.success(`Đã tạo danh mục "${v.name}"`);
        this.selectedId.set(id);
        this.mode.set('edit');
      } else {
        const id = this.selectedId();
        if (!id) return;
        this.categories.update((list) =>
          list.map((c) =>
            c.id === id
              ? {
                  ...c,
                  name: v.name,
                  parentId: v.parentId,
                  description: v.description,
                  sortOrder: v.sortOrder ?? c.sortOrder,
                  active: v.active,
                }
              : c,
          ),
        );
        this.toast.success('Đã cập nhật danh mục');
      }
    }, 400);
  }

  protected async onDelete(cat: ICategory): Promise<void> {
    const hasChildren = this.categories().some((c) => c.parentId === cat.id);
    if (hasChildren) {
      this.toast.warning('Không thể xóa danh mục có danh mục con. Xóa các con trước.');
      return;
    }
    if (cat.productCount > 0) {
      this.toast.warning(`Còn ${cat.productCount} sản phẩm thuộc danh mục này.`);
      return;
    }
    const ok = await this.confirmDialog.confirm({
      title: 'Xóa danh mục',
      message: `Bạn có chắc muốn xóa "${cat.name}"?`,
      confirmText: 'Xóa',
      variant: 'danger',
    });
    if (!ok) return;
    this.categories.update((list) => list.filter((c) => c.id !== cat.id));
    this.toast.success('Đã xóa danh mục');
    this.cancel();
  }
}
