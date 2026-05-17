import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  BadgeComponent,
  BreadcrumbComponent,
  ButtonComponent,
  CardComponent,
  CheckboxComponent,
  ToastService,
} from '@/shared/ui';
import { ACTION_LABELS, ACTION_LIST, RESOURCE_LIST, findRole } from '../iam.mock';
import { type PermissionAction } from '../iam.types';

@Component({
  selector: 'app-role-detail',
  imports: [
    BadgeComponent,
    BreadcrumbComponent,
    ButtonComponent,
    CardComponent,
    CheckboxComponent,
    FormsModule,
    RouterLink,
  ],
  template: `
    @if (role(); as r) {
      <div class="space-y-6">
        <app-breadcrumb [items]="breadcrumb()" />

        <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-2xl font-bold text-slate-900">{{ r.name }}</h1>
              @if (r.isSystem) {
                <app-badge variant="warning">System role</app-badge>
              }
            </div>
            <p class="mt-1 text-sm text-slate-500 max-w-2xl">{{ r.description }}</p>
            <p class="mt-1 text-xs text-slate-500">
              Đang gán <strong class="text-slate-700">{{ selectedCount() }}</strong> /
              {{ totalCount }} quyền
            </p>
          </div>
          <div class="flex gap-2">
            <app-button variant="secondary" type="button" [disabled]="r.isSystem" (click)="reset()">
              Hoàn tác
            </app-button>
            <app-button [disabled]="r.isSystem" (click)="save()">Lưu thay đổi</app-button>
          </div>
        </div>

        @if (r.isSystem) {
          <div
            class="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          >
            Đây là vai trò hệ thống, không thể chỉnh sửa quyền. Để gán quyền tùy chỉnh, tạo một vai
            trò mới.
          </div>
        }

        <app-card padding="none">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-slate-200 text-sm">
              <thead class="bg-slate-50">
                <tr>
                  <th
                    scope="col"
                    class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700"
                  >
                    Tài nguyên
                  </th>
                  @for (action of actions; track action) {
                    <th
                      scope="col"
                      class="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-700"
                    >
                      {{ actionLabel(action) }}
                    </th>
                  }
                  <th
                    scope="col"
                    class="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-700"
                  >
                    Tất cả
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                @for (resource of resources; track resource.key) {
                  <tr class="hover:bg-slate-50">
                    <td class="px-4 py-3 font-medium text-slate-900">{{ resource.label }}</td>
                    @for (action of actions; track action) {
                      <td class="px-4 py-3 text-center">
                        <app-checkbox
                          [id]="resource.key + '-' + action"
                          [ngModel]="isChecked(resource.key, action)"
                          (ngModelChange)="toggle(resource.key, action, $event)"
                        />
                      </td>
                    }
                    <td class="px-4 py-3 text-center">
                      <app-checkbox
                        [id]="resource.key + '-all'"
                        [ngModel]="isResourceFullyChecked(resource.key)"
                        [indeterminate]="isResourcePartiallyChecked(resource.key)"
                        (ngModelChange)="toggleResource(resource.key, $event)"
                      />
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </app-card>
      </div>
    } @else {
      <div class="rounded-lg border border-slate-200 bg-white p-8 text-center">
        <h2 class="text-lg font-semibold text-slate-900">Không tìm thấy vai trò</h2>
        <a routerLink="/iam/roles" class="mt-4 inline-block">
          <app-button variant="primary">Quay lại danh sách</app-button>
        </a>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleDetailComponent {
  private readonly toast = inject(ToastService);

  readonly id = input.required<string>();

  protected readonly resources = RESOURCE_LIST;
  protected readonly actions = ACTION_LIST;
  protected readonly totalCount = RESOURCE_LIST.length * ACTION_LIST.length;

  protected readonly role = computed(() => findRole(this.id()));
  protected readonly originalSet = computed(() => new Set(this.role()?.permissionIds ?? []));

  protected readonly checkedSet = signal<Set<string>>(new Set());

  protected readonly selectedCount = computed(() => this.checkedSet().size);

  protected readonly breadcrumb = computed(() => [
    { label: 'Hệ thống' },
    { label: 'Vai trò', to: '/iam/roles' },
    { label: this.role()?.name ?? this.id() },
  ]);

  constructor() {
    queueMicrotask(() => this.checkedSet.set(new Set(this.originalSet())));
  }

  protected actionLabel(action: PermissionAction): string {
    return ACTION_LABELS[action];
  }

  protected isChecked(resource: string, action: PermissionAction): boolean {
    return this.checkedSet().has(`${resource}:${action}`);
  }

  protected isResourceFullyChecked(resource: string): boolean {
    return this.actions.every((a) => this.checkedSet().has(`${resource}:${a}`));
  }

  protected isResourcePartiallyChecked(resource: string): boolean {
    const checked = this.actions.filter((a) => this.checkedSet().has(`${resource}:${a}`)).length;
    return checked > 0 && checked < this.actions.length;
  }

  protected toggle(resource: string, action: PermissionAction, checked: boolean): void {
    const key = `${resource}:${action}`;
    const next = new Set(this.checkedSet());
    if (checked) next.add(key);
    else next.delete(key);
    this.checkedSet.set(next);
  }

  protected toggleResource(resource: string, checked: boolean): void {
    const next = new Set(this.checkedSet());
    for (const action of this.actions) {
      const key = `${resource}:${action}`;
      if (checked) next.add(key);
      else next.delete(key);
    }
    this.checkedSet.set(next);
  }

  protected reset(): void {
    this.checkedSet.set(new Set(this.originalSet()));
    this.toast.info('Đã hoàn tác về trạng thái ban đầu');
  }

  protected save(): void {
    this.toast.success(`Đã lưu ${this.selectedCount()} quyền cho vai trò`);
  }
}
