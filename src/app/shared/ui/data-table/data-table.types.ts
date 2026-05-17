import { type TemplateRef } from '@angular/core';

export type SortDirection = 'asc' | 'desc';

export interface SortState {
  column: string;
  direction: SortDirection;
}

export interface ColumnDef<T> {
  key: string;
  header: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  cell?: TemplateRef<{ row: T; $implicit?: T }>;
  accessor?: (row: T) => string | number | null;
}
