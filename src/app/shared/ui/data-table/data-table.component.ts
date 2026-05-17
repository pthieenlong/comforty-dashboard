import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideArrowUpDown, LucideChevronDown, LucideChevronUp } from '@lucide/angular';
import { CheckboxComponent } from '@/shared/ui/checkbox/checkbox.component';
import { EmptyStateComponent } from '@/shared/ui/empty-state/empty-state.component';
import { IconComponent } from '@/shared/ui/icon/icon.component';
import { SkeletonComponent } from '@/shared/ui/skeleton/skeleton.component';
import { type ColumnDef, type SortDirection, type SortState } from './data-table.types';

@Component({
  selector: 'app-data-table',
  imports: [
    CheckboxComponent,
    EmptyStateComponent,
    FormsModule,
    IconComponent,
    NgTemplateOutlet,
    SkeletonComponent,
  ],
  template: `
    <div class="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200 text-sm">
          <thead class="bg-slate-50">
            <tr>
              @if (selectable()) {
                <th class="w-10 px-3 py-2.5 text-left">
                  <app-checkbox
                    [id]="tableId() + '-select-all'"
                    [ngModel]="allSelected()"
                    [indeterminate]="someSelected()"
                    (ngModelChange)="toggleAll($event)"
                  />
                </th>
              }
              @for (col of columns(); track col.key) {
                <th [style.width]="col.width" [class]="headerCellClasses(col)" scope="col">
                  @if (col.sortable) {
                    <button
                      type="button"
                      class="inline-flex items-center gap-1 font-semibold text-slate-700 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 rounded-sm"
                      (click)="onSort(col.key)"
                    >
                      {{ col.header }}
                      <app-icon [icon]="sortIcon(col.key)" size="sm" />
                    </button>
                  } @else {
                    <span class="font-semibold text-slate-700">{{ col.header }}</span>
                  }
                </th>
              }
            </tr>
          </thead>

          <tbody class="divide-y divide-slate-100">
            @if (loading()) {
              @for (i of skeletonRows; track i) {
                <tr>
                  @if (selectable()) {
                    <td class="px-3 py-3">
                      <app-skeleton width="16px" height="16px" />
                    </td>
                  }
                  @for (col of columns(); track col.key) {
                    <td class="px-3 py-3">
                      <app-skeleton height="14px" />
                    </td>
                  }
                </tr>
              }
            } @else if (rows().length === 0) {
              <tr>
                <td [attr.colspan]="totalCols()" class="p-0">
                  <app-empty-state [title]="emptyTitle()" [description]="emptyDescription()" />
                </td>
              </tr>
            } @else {
              @for (row of rows(); track trackBy(row); let i = $index) {
                <tr class="hover:bg-slate-50">
                  @if (selectable()) {
                    <td class="w-10 px-3 py-2.5">
                      <app-checkbox
                        [id]="tableId() + '-row-' + i"
                        [ngModel]="isSelected(row)"
                        (ngModelChange)="toggleRow(row, $event)"
                      />
                    </td>
                  }
                  @for (col of columns(); track col.key) {
                    <td [class]="bodyCellClasses(col)">
                      @if (col.cell) {
                        <ng-container
                          *ngTemplateOutlet="col.cell; context: { $implicit: row, row: row }"
                        />
                      } @else {
                        <span class="text-slate-700">{{ getValue(row, col) }}</span>
                      }
                    </td>
                  }
                </tr>
              }
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class DataTableComponent<T> {
  readonly tableId = input<string>('data-table');
  readonly columns = input.required<ColumnDef<T>[]>();
  readonly rows = input.required<T[]>();
  readonly loading = input<boolean>(false);
  readonly selectable = input<boolean>(false);
  readonly trackByKey = input<keyof T | null>(null);
  readonly emptyTitle = input<string>('Chưa có dữ liệu');
  readonly emptyDescription = input<string>('');

  readonly sort = model<SortState | null>(null);
  readonly selection = model<T[]>([]);
  readonly rowClick = output<T>();

  protected readonly skeletonRows = Array.from({ length: 5 }, (_, i) => i);

  protected readonly sortableIcon = LucideArrowUpDown.icon;
  protected readonly ascIcon = LucideChevronUp.icon;
  protected readonly descIcon = LucideChevronDown.icon;

  protected readonly allSelected = computed(
    () => this.rows().length > 0 && this.selection().length === this.rows().length,
  );

  protected readonly someSelected = computed(() => {
    const len = this.selection().length;
    return len > 0 && len < this.rows().length;
  });

  protected readonly totalCols = computed(
    () => this.columns().length + (this.selectable() ? 1 : 0),
  );

  protected sortIcon(key: string) {
    const current = this.sort();
    if (!current || current.column !== key) return this.sortableIcon;
    return current.direction === 'asc' ? this.ascIcon : this.descIcon;
  }

  protected headerCellClasses(col: ColumnDef<T>): string {
    const align =
      col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left';
    return `px-3 py-2.5 ${align} text-xs uppercase tracking-wider`;
  }

  protected bodyCellClasses(col: ColumnDef<T>): string {
    const align =
      col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left';
    return `px-3 py-2.5 ${align}`;
  }

  protected getValue(row: T, col: ColumnDef<T>): string | number | null {
    if (col.accessor) return col.accessor(row);
    const key = col.key as keyof T;
    return (row[key] as string | number | null) ?? null;
  }

  protected trackBy = (row: T): unknown => {
    const key = this.trackByKey();
    if (key) return row[key];
    return row;
  };

  protected onSort(column: string): void {
    const current = this.sort();
    let next: SortState;
    if (!current || current.column !== column) {
      next = { column, direction: 'asc' };
    } else {
      const direction: SortDirection = current.direction === 'asc' ? 'desc' : 'asc';
      next = { column, direction };
    }
    this.sort.set(next);
  }

  protected isSelected(row: T): boolean {
    return this.selection().includes(row);
  }

  protected toggleRow(row: T, checked: boolean): void {
    const current = this.selection();
    this.selection.set(checked ? [...current, row] : current.filter((r) => r !== row));
  }

  protected toggleAll(checked: boolean): void {
    this.selection.set(checked ? [...this.rows()] : []);
  }
}
