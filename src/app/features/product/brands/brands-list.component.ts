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
import { LucideEdit, LucidePlus } from '@lucide/angular';
import {
  BadgeComponent,
  ButtonComponent,
  type ColumnDef,
  DataTableComponent,
  IconComponent,
  PageHeaderComponent,
  SearchInputComponent,
  SelectComponent,
  type SelectOption,
  type SortState,
  ToastService,
} from '@/shared/ui';
import { BRANDS } from '../brand.mock';
import type { IBrand } from '../product.types';

const STATUS_OPTIONS: SelectOption<string>[] = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'active', label: 'Đang bán' },
  { value: 'inactive', label: 'Ngừng bán' },
];

@Component({
  selector: 'app-brands-list',
  imports: [
    BadgeComponent,
    ButtonComponent,
    DataTableComponent,
    DatePipe,
    FormsModule,
    IconComponent,
    PageHeaderComponent,
    RouterLink,
    SearchInputComponent,
    SelectComponent,
  ],
  template: `
    <div class="space-y-6">
      <app-page-header
        title="Thương hiệu"
        description="Quản lý các thương hiệu phân phối trong hệ thống."
        [breadcrumb]="breadcrumb"
      >
        <a routerLink="/catalog/brands/new" page-actions>
          <app-button variant="primary">
            <app-icon [icon]="plusIcon" size="md" />
            Thêm thương hiệu
          </app-button>
        </a>
      </app-page-header>

      <div class="grid gap-3 sm:grid-cols-2">
        <app-search-input
          id="brand-search"
          placeholder="Tìm theo tên, mã, quốc gia..."
          [(ngModel)]="searchTerm"
        />
        <app-select
          id="brand-status"
          [options]="statusOptions"
          placeholder="Trạng thái"
          [(ngModel)]="statusFilter"
        />
      </div>

      <app-data-table
        tableId="brands-table"
        [columns]="columns()"
        [rows]="sorted()"
        trackByKey="id"
        [(sort)]="sortState"
        emptyTitle="Không có thương hiệu nào"
        emptyDescription="Thử thay đổi bộ lọc hoặc thêm thương hiệu mới."
      />
    </div>

    <ng-template #brandCell let-row="row">
      <div>
        <a
          [routerLink]="['/catalog/brands', row.id, 'edit']"
          class="text-sm font-medium text-slate-900 hover:text-indigo-600"
        >
          {{ row.name }}
        </a>
        <p class="text-xs text-slate-500 font-mono">{{ row.code }}</p>
      </div>
    </ng-template>

    <ng-template #countryCell let-row="row">
      <span class="text-sm text-slate-700">{{ row.country }}</span>
    </ng-template>

    <ng-template #countCell let-row="row">
      <span class="text-sm font-medium text-slate-900">{{ row.productCount }}</span>
    </ng-template>

    <ng-template #statusCell let-row="row">
      @if (row.active) {
        <app-badge variant="success" [dot]="true">Đang bán</app-badge>
      } @else {
        <app-badge variant="neutral" [dot]="true">Ngừng bán</app-badge>
      }
    </ng-template>

    <ng-template #createdCell let-row="row">
      <span class="text-xs text-slate-600">{{ row.createdAt | date: 'dd/MM/yyyy' }}</span>
    </ng-template>

    <ng-template #actionCell let-row="row">
      <a
        [routerLink]="['/catalog/brands', row.id, 'edit']"
        class="text-indigo-600 hover:text-indigo-700"
      >
        <app-icon [icon]="editIcon" size="sm" />
      </a>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrandsListComponent {
  private readonly toast = inject(ToastService);

  protected readonly breadcrumb = [{ label: 'Sản phẩm' }, { label: 'Thương hiệu' }];
  protected readonly brands = BRANDS;

  protected readonly plusIcon = LucidePlus.icon;
  protected readonly editIcon = LucideEdit.icon;

  protected readonly searchTerm = signal('');
  protected readonly statusFilter = signal<string>('');
  protected readonly sortState = signal<SortState | null>({
    column: 'name',
    direction: 'asc',
  });

  protected readonly statusOptions = STATUS_OPTIONS;

  protected readonly brandCell = viewChild.required<TemplateRef<{ row: IBrand }>>('brandCell');
  protected readonly countryCell = viewChild.required<TemplateRef<{ row: IBrand }>>('countryCell');
  protected readonly countCell = viewChild.required<TemplateRef<{ row: IBrand }>>('countCell');
  protected readonly statusCell = viewChild.required<TemplateRef<{ row: IBrand }>>('statusCell');
  protected readonly createdCell = viewChild.required<TemplateRef<{ row: IBrand }>>('createdCell');
  protected readonly actionCell = viewChild.required<TemplateRef<{ row: IBrand }>>('actionCell');

  protected readonly columns = computed<ColumnDef<IBrand>[]>(() => [
    { key: 'name', header: 'Thương hiệu', sortable: true, width: '32%', cell: this.brandCell() },
    { key: 'country', header: 'Quốc gia', sortable: true, width: '18%', cell: this.countryCell() },
    {
      key: 'productCount',
      header: 'Số sản phẩm',
      sortable: true,
      width: '14%',
      cell: this.countCell(),
    },
    { key: 'active', header: 'Trạng thái', sortable: true, width: '14%', cell: this.statusCell() },
    {
      key: 'createdAt',
      header: 'Thêm vào',
      sortable: true,
      width: '14%',
      cell: this.createdCell(),
    },
    { key: 'actions', header: '', width: '8%', cell: this.actionCell() },
  ]);

  protected readonly filtered = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const status = this.statusFilter();
    return this.brands.filter((b) => {
      if (status === 'active' && !b.active) return false;
      if (status === 'inactive' && b.active) return false;
      if (!term) return true;
      return (
        b.name.toLowerCase().includes(term) ||
        b.code.toLowerCase().includes(term) ||
        b.country.toLowerCase().includes(term)
      );
    });
  });

  protected readonly sorted = computed(() => {
    const sort = this.sortState();
    const list = this.filtered();
    if (!sort) return list;
    return [...list].sort((a, b) => {
      const av = a[sort.column as keyof IBrand];
      const bv = b[sort.column as keyof IBrand];
      if (typeof av === 'number' && typeof bv === 'number') {
        return sort.direction === 'asc' ? av - bv : bv - av;
      }
      const cmp = String(av ?? '').localeCompare(String(bv ?? ''), 'vi');
      return sort.direction === 'asc' ? cmp : -cmp;
    });
  });
}
