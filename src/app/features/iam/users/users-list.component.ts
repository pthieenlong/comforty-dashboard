import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  type TemplateRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucidePlus, LucideTrash2 } from '@lucide/angular';
import {
  AvatarComponent,
  BadgeComponent,
  BreadcrumbComponent,
  ButtonComponent,
  type ColumnDef,
  ConfirmDialogService,
  DataTableComponent,
  IconComponent,
  PaginationComponent,
  SearchInputComponent,
  SelectComponent,
  type SelectOption,
  type SortState,
  TagComponent,
  ToastService,
} from '@/shared/ui';
import { findRole, TENANT_LIST, USERS } from '../iam.mock';
import { type IUser } from '../iam.types';

const STATUS_OPTIONS: SelectOption<string>[] = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'inactive', label: 'Đã khóa' },
];

@Component({
  selector: 'app-users-list',
  imports: [
    AvatarComponent,
    BadgeComponent,
    BreadcrumbComponent,
    ButtonComponent,
    DataTableComponent,
    DatePipe,
    FormsModule,
    IconComponent,
    PaginationComponent,
    RouterLink,
    SearchInputComponent,
    SelectComponent,
    TagComponent,
  ],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <app-breadcrumb [items]="breadcrumb" />
          <h1 class="mt-2 text-2xl font-bold text-slate-900">Người dùng</h1>
          <p class="mt-1 text-sm text-slate-500">
            Quản lý nhân viên truy cập hệ thống — {{ users.length }} người dùng
          </p>
        </div>
        <div class="flex gap-2">
          @if (selected().length > 0) {
            <app-button variant="danger" size="md" (click)="onBulkDelete()">
              <app-icon [icon]="trashIcon" size="md" />
              Khóa {{ selected().length }} tài khoản
            </app-button>
          }
          <a routerLink="/iam/users/new">
            <app-button variant="primary" size="md">
              <app-icon [icon]="plusIcon" size="md" />
              Thêm người dùng
            </app-button>
          </a>
        </div>
      </div>

      <div class="grid gap-3 sm:grid-cols-3">
        <app-search-input
          id="user-search"
          placeholder="Tìm theo tên, email, số điện thoại..."
          [(ngModel)]="searchTerm"
        />
        <app-select
          id="user-status"
          [options]="statusOptions"
          placeholder="Trạng thái"
          [(ngModel)]="statusFilter"
        />
        <app-select
          id="user-tenant"
          [options]="tenantOptions"
          placeholder="Chi nhánh"
          [(ngModel)]="tenantFilter"
        />
      </div>

      <app-data-table
        tableId="users-table"
        [columns]="columns()"
        [rows]="pagedUsers()"
        [selectable]="true"
        trackByKey="id"
        [(sort)]="sortState"
        [(selection)]="selected"
        emptyTitle="Không có người dùng nào khớp"
        emptyDescription="Thử điều chỉnh bộ lọc hoặc xóa từ khóa tìm kiếm."
      />

      <app-pagination [(page)]="page" [pageSize]="pageSize" [totalItems]="filtered().length" />
    </div>

    <ng-template #userCell let-row="row">
      <div class="flex items-center gap-3">
        <app-avatar [name]="row.fullName" size="sm" />
        <div class="min-w-0">
          <a
            [routerLink]="['/iam/users', row.id]"
            class="text-sm font-medium text-slate-900 hover:text-indigo-600 truncate block"
          >
            {{ row.fullName }}
          </a>
          <p class="text-xs text-slate-500 truncate">{{ row.email }}</p>
        </div>
      </div>
    </ng-template>

    <ng-template #rolesCell let-row="row">
      <div class="flex flex-wrap gap-1">
        @for (assignment of row.assignments; track assignment.tenantId) {
          @for (rid of assignment.roleIds; track rid) {
            <app-tag variant="primary">{{ roleName(rid) }}</app-tag>
          }
        }
      </div>
    </ng-template>

    <ng-template #tenantsCell let-row="row">
      <div class="flex flex-col gap-0.5">
        @for (assignment of row.assignments; track assignment.tenantId) {
          <span class="text-xs text-slate-600 truncate">{{ assignment.tenantName }}</span>
        }
      </div>
    </ng-template>

    <ng-template #statusCell let-row="row">
      @if (row.active) {
        <app-badge variant="success" [dot]="true">Hoạt động</app-badge>
      } @else {
        <app-badge variant="neutral" [dot]="true">Đã khóa</app-badge>
      }
    </ng-template>

    <ng-template #lastLoginCell let-row="row">
      @if (row.lastLoginAt) {
        <span class="text-xs text-slate-600">
          {{ row.lastLoginAt | date: 'dd/MM/yyyy HH:mm' }}
        </span>
      } @else {
        <span class="text-xs text-slate-400">Chưa đăng nhập</span>
      }
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersListComponent {
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly toast = inject(ToastService);

  protected readonly users = USERS;
  protected readonly breadcrumb = [{ label: 'Hệ thống' }, { label: 'Người dùng' }];

  protected readonly plusIcon = LucidePlus.icon;
  protected readonly trashIcon = LucideTrash2.icon;

  protected readonly searchTerm = signal('');
  protected readonly statusFilter = signal<string>('');
  protected readonly tenantFilter = signal<string>('');
  protected readonly sortState = signal<SortState | null>({
    column: 'fullName',
    direction: 'asc',
  });
  protected readonly selected = signal<IUser[]>([]);
  protected readonly page = signal(1);
  protected readonly pageSize = 10;

  protected readonly statusOptions = STATUS_OPTIONS;
  protected readonly tenantOptions: SelectOption<string>[] = [
    { value: '', label: 'Tất cả chi nhánh' },
    ...TENANT_LIST.map((t) => ({ value: t.id, label: t.name })),
  ];

  protected readonly userCell = viewChild.required<TemplateRef<{ row: IUser }>>('userCell');
  protected readonly rolesCell = viewChild.required<TemplateRef<{ row: IUser }>>('rolesCell');
  protected readonly tenantsCell = viewChild.required<TemplateRef<{ row: IUser }>>('tenantsCell');
  protected readonly statusCell = viewChild.required<TemplateRef<{ row: IUser }>>('statusCell');
  protected readonly lastLoginCell =
    viewChild.required<TemplateRef<{ row: IUser }>>('lastLoginCell');

  protected readonly columns = computed<ColumnDef<IUser>[]>(() => [
    {
      key: 'fullName',
      header: 'Người dùng',
      sortable: true,
      width: '32%',
      cell: this.userCell(),
    },
    { key: 'roles', header: 'Vai trò', width: '24%', cell: this.rolesCell() },
    { key: 'tenants', header: 'Chi nhánh', width: '20%', cell: this.tenantsCell() },
    {
      key: 'active',
      header: 'Trạng thái',
      sortable: true,
      width: '12%',
      cell: this.statusCell(),
    },
    {
      key: 'lastLoginAt',
      header: 'Lần truy cập cuối',
      sortable: true,
      width: '12%',
      cell: this.lastLoginCell(),
    },
  ]);

  protected readonly filtered = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const status = this.statusFilter();
    const tenant = this.tenantFilter();

    let list = this.users.filter((u) => {
      if (status === 'active' && !u.active) return false;
      if (status === 'inactive' && u.active) return false;
      if (tenant && !u.assignments.some((a) => a.tenantId === tenant)) return false;
      if (!term) return true;
      return (
        u.fullName.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.phone.includes(term)
      );
    });

    const sort = this.sortState();
    if (sort) {
      list = [...list].sort((a, b) => {
        const av = String(a[sort.column as keyof IUser] ?? '');
        const bv = String(b[sort.column as keyof IUser] ?? '');
        const cmp = av.localeCompare(bv, 'vi');
        return sort.direction === 'asc' ? cmp : -cmp;
      });
    }
    return list;
  });

  protected readonly pagedUsers = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  protected roleName(roleId: string): string {
    return findRole(roleId)?.name ?? roleId;
  }

  protected async onBulkDelete(): Promise<void> {
    const count = this.selected().length;
    const ok = await this.confirmDialog.confirm({
      title: 'Khóa tài khoản',
      message: `Bạn có chắc muốn khóa ${count} tài khoản đã chọn? Tài khoản sẽ không thể đăng nhập cho đến khi mở khóa.`,
      confirmText: 'Khóa tài khoản',
      variant: 'danger',
    });
    if (!ok) return;
    this.toast.success(`Đã khóa ${count} tài khoản`);
    this.selected.set([]);
  }
}
