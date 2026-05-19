import { ScrollingModule } from '@angular/cdk/scrolling';
import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideArrowUpDown, LucideChevronDown, LucideChevronUp } from '@lucide/angular';
import { CheckboxComponent } from '@/shared/ui/checkbox/checkbox.component';
import { EmptyStateComponent } from '@/shared/ui/empty-state/empty-state.component';
import { IconComponent } from '@/shared/ui/icon/icon.component';
import { type ColumnDef, type SortDirection, type SortState } from './data-table.types';

@Component({
  selector: 'app-data-table-virtual',
  imports: [
    CheckboxComponent,
    EmptyStateComponent,
    FormsModule,
    IconComponent,
    NgTemplateOutlet,
    ScrollingModule,
  ],
  template: `
    <div class="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <!-- Header (sticky outside viewport) -->
      <div class="bg-slate-50 border-b border-slate-200">
        <div class="flex items-stretch text-xs uppercase tracking-wider">
          @if (selectable()) {
            <div class="w-10 px-3 py-2.5 flex items-center">
              <app-checkbox
                [id]="tableId() + '-select-all'"
                [ngModel]="allSelected()"
                [indeterminate]="someSelected()"
                (ngModelChange)="toggleAll($event)"
              />
            </div>
          }
          @for (col of columns(); track col.key) {
            <div
              [style.width]="col.width || 'auto'"
              [style.flex]="col.width ? '0 0 auto' : '1 1 0'"
              [class]="headerCellClasses(col)"
            >
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
            </div>
          }
        </div>
      </div>

      @if (rows().length === 0) {
        <app-empty-state [title]="emptyTitle()" [description]="emptyDescription()" />
      } @else {
        <cdk-virtual-scroll-viewport [itemSize]="rowHeight()" [style.height.px]="viewportHeight()">
          <div
            *cdkVirtualFor="let row of rows(); trackBy: trackBy; let i = index"
            class="flex items-stretch border-b border-slate-100 hover:bg-slate-50"
            [style.height.px]="rowHeight()"
          >
            @if (selectable()) {
              <div class="w-10 px-3 flex items-center">
                <app-checkbox
                  [id]="tableId() + '-row-' + i"
                  [ngModel]="isSelected(row)"
                  (ngModelChange)="toggleRow(row, $event)"
                />
              </div>
            }
            @for (col of columns(); track col.key) {
              <div
                [style.width]="col.width || 'auto'"
                [style.flex]="col.width ? '0 0 auto' : '1 1 0'"
                [class]="bodyCellClasses(col)"
              >
                @if (col.cell) {
                  <ng-container
                    *ngTemplateOutlet="col.cell; context: { $implicit: row, row: row }"
                  />
                } @else {
                  <span class="text-slate-700 truncate">{{ getValue(row, col) }}</span>
                }
              </div>
            }
          </div>
        </cdk-virtual-scroll-viewport>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class DataTableVirtualComponent<T> {
  readonly tableId = input<string>('data-table-virtual');
  readonly columns = input.required<ColumnDef<T>[]>();
  readonly rows = input.required<T[]>();
  readonly selectable = input<boolean>(false);
  readonly trackByKey = input<keyof T | null>(null);
  readonly emptyTitle = input<string>('Chưa có dữ liệu');
  readonly emptyDescription = input<string>('');
  readonly rowHeight = input<number>(48);
  readonly viewportHeight = input<number>(560);

  readonly sort = model<SortState | null>(null);
  readonly selection = model<T[]>([]);
  readonly rowClick = output<T>();

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

  protected sortIcon(key: string) {
    const current = this.sort();
    if (!current || current.column !== key) return this.sortableIcon;
    return current.direction === 'asc' ? this.ascIcon : this.descIcon;
  }

  protected headerCellClasses(col: ColumnDef<T>): string {
    const align =
      col.align === 'right'
        ? 'text-right justify-end'
        : col.align === 'center'
          ? 'text-center justify-center'
          : 'text-left';
    return `px-3 py-2.5 flex items-center ${align}`;
  }

  protected bodyCellClasses(col: ColumnDef<T>): string {
    const align =
      col.align === 'right'
        ? 'text-right justify-end'
        : col.align === 'center'
          ? 'text-center justify-center'
          : 'text-left';
    return `px-3 flex items-center ${align} text-sm min-w-0`;
  }

  protected getValue(row: T, col: ColumnDef<T>): string | number | null {
    if (col.accessor) return col.accessor(row);
    const key = col.key as keyof T;
    return (row[key] as string | number | null) ?? null;
  }

  protected trackBy = (_: number, row: T): unknown => {
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
