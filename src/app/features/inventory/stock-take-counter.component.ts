import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideCheck, LucideSave, LucideX } from '@lucide/angular';
import {
  BadgeComponent,
  BreadcrumbComponent,
  ButtonComponent,
  CardComponent,
  CheckboxComponent,
  ConfirmDialogService,
  IconComponent,
  PaginationComponent,
  SearchInputComponent,
  ToastService,
} from '@/shared/ui';
import { MOCK_WAREHOUSES } from '@/core/warehouse/warehouse.mock';
import { findStockTake } from './inventory.mock';
import type { IStockTakeLine, StockTakeStatus } from './inventory.types';

const STATUS_LABEL: Record<StockTakeStatus, string> = {
  draft: 'Nháp',
  in_progress: 'Đang kiểm',
  completed: 'Đã hoàn tất',
  cancelled: 'Đã huỷ',
};

const STATUS_VARIANT: Record<StockTakeStatus, 'neutral' | 'warning' | 'success' | 'danger'> = {
  draft: 'neutral',
  in_progress: 'warning',
  completed: 'success',
  cancelled: 'danger',
};

interface LineDraft {
  variantId: string;
  variantSku: string;
  productName: string;
  variantLabel: string;
  expectedQuantity: number;
  countedQuantity: number | null;
  note: string;
}

@Component({
  selector: 'app-stock-take-counter',
  imports: [
    BadgeComponent,
    BreadcrumbComponent,
    ButtonComponent,
    CardComponent,
    CheckboxComponent,
    DatePipe,
    FormsModule,
    IconComponent,
    PaginationComponent,
    RouterLink,
    SearchInputComponent,
  ],
  template: `
    @if (take(); as t) {
      <div class="space-y-6">
        <app-breadcrumb [items]="breadcrumb()" />

        <app-card padding="lg">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <h1 class="text-2xl font-bold text-slate-900 font-mono">{{ t.code }}</h1>
                <app-badge [variant]="statusVariant()" [dot]="true">
                  {{ statusLabel() }}
                </app-badge>
                @if (t.scope === 'full') {
                  <app-badge variant="primary" size="sm">Toàn bộ</app-badge>
                } @else {
                  <app-badge variant="neutral" size="sm">Một phần</app-badge>
                }
              </div>
              <p class="mt-1 text-sm text-slate-600">
                Kho: <strong>{{ warehouseName() }}</strong>
              </p>
              <p class="mt-1 text-xs text-slate-500">
                Tạo {{ t.createdAt | date: 'dd/MM/yyyy HH:mm' }} bởi {{ t.createdBy }}
                @if (t.completedAt) {
                  · Hoàn tất {{ t.completedAt | date: 'dd/MM/yyyy HH:mm' }}
                }
              </p>
              @if (t.note) {
                <p class="mt-2 text-sm text-slate-700">{{ t.note }}</p>
              }
            </div>

            @if (isEditable()) {
              <div class="flex flex-wrap gap-2 shrink-0">
                <app-button variant="secondary" (click)="onCancel()">
                  <app-icon [icon]="cancelIcon" size="md" />
                  Huỷ phiên
                </app-button>
                <app-button variant="secondary" (click)="onSaveDraft()" [loading]="saving()">
                  <app-icon [icon]="saveIcon" size="md" />
                  Lưu nháp
                </app-button>
                <app-button
                  variant="primary"
                  (click)="onComplete()"
                  [loading]="completing()"
                  [disabled]="!canComplete()"
                >
                  <app-icon [icon]="checkIcon" size="md" />
                  Hoàn tất kiểm kê
                </app-button>
              </div>
            }
          </div>
        </app-card>

        <div class="grid gap-3 sm:grid-cols-4">
          <app-card padding="md">
            <p class="text-xs uppercase text-slate-500">Tổng dòng</p>
            <p class="mt-1 text-2xl font-bold text-slate-900">{{ lines().length }}</p>
          </app-card>
          <app-card padding="md">
            <p class="text-xs uppercase text-slate-500">Đã đếm</p>
            <p class="mt-1 text-2xl font-bold text-green-700">{{ countedCount() }}</p>
            <p class="text-xs text-slate-400">{{ countedPercent() }}%</p>
          </app-card>
          <app-card padding="md">
            <p class="text-xs uppercase text-slate-500">Chưa đếm</p>
            <p class="mt-1 text-2xl font-bold text-amber-700">{{ pendingCount() }}</p>
          </app-card>
          <app-card padding="md">
            <p class="text-xs uppercase text-slate-500">Chênh lệch</p>
            <p [class]="totalVarianceClass()">
              {{ totalVariance() > 0 ? '+' : '' }}{{ totalVariance() }}
            </p>
            <p class="text-xs text-slate-400">{{ varianceLineCount() }} dòng lệch</p>
          </app-card>
        </div>

        <div class="grid gap-3 lg:grid-cols-3">
          <app-search-input
            id="stk-search"
            placeholder="Tìm SKU, sản phẩm..."
            [(ngModel)]="searchTerm"
          />
          <app-checkbox
            id="stk-only-uncounted"
            label="Chỉ hiển thị chưa đếm"
            [(ngModel)]="onlyUncounted"
          />
          <app-checkbox
            id="stk-only-variance"
            label="Chỉ hiển thị có chênh lệch"
            [(ngModel)]="onlyVariance"
          />
        </div>

        <app-card padding="none">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th class="px-3 py-2 text-left font-medium">Sản phẩm</th>
                  <th class="px-3 py-2 text-left font-medium">SKU</th>
                  <th class="px-3 py-2 text-right font-medium w-24">Hệ thống</th>
                  <th class="px-3 py-2 text-right font-medium w-32">Đếm thực tế</th>
                  <th class="px-3 py-2 text-right font-medium w-24">Lệch</th>
                  <th class="px-3 py-2 text-left font-medium w-56">Ghi chú</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                @for (entry of pagedLines(); track entry.line.variantId) {
                  <tr [class]="rowClass(entry.line)">
                    <td class="px-3 py-2">
                      <p class="text-slate-700">{{ entry.line.productName }}</p>
                      @if (entry.line.variantLabel) {
                        <p class="text-xs text-slate-400">{{ entry.line.variantLabel }}</p>
                      }
                    </td>
                    <td class="px-3 py-2 font-mono text-xs text-slate-600">
                      {{ entry.line.variantSku }}
                    </td>
                    <td class="px-3 py-2 text-right text-slate-700">
                      {{ entry.line.expectedQuantity }}
                    </td>
                    <td class="px-3 py-2 text-right">
                      <input
                        type="number"
                        min="0"
                        class="w-24 rounded-md border border-slate-300 px-2 py-1 text-right text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500"
                        [disabled]="!isEditable()"
                        [value]="entry.line.countedQuantity ?? ''"
                        (input)="onCountChange(entry.originalIndex, $event)"
                      />
                    </td>
                    <td class="px-3 py-2 text-right">
                      @if (entry.line.countedQuantity === null) {
                        <span class="text-xs text-slate-300">—</span>
                      } @else if (variance(entry.line); as v) {
                        <span [class]="varianceClass(v)"> {{ v > 0 ? '+' : '' }}{{ v }} </span>
                      } @else {
                        <span class="text-xs text-slate-500">0</span>
                      }
                    </td>
                    <td class="px-3 py-2">
                      <input
                        type="text"
                        placeholder="Lý do lệch, hỏng..."
                        class="w-full rounded-md border border-slate-300 px-2 py-1 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500"
                        [disabled]="!isEditable()"
                        [value]="entry.line.note"
                        (input)="onNoteChange(entry.originalIndex, $event)"
                      />
                    </td>
                  </tr>
                }
                @if (pagedLines().length === 0) {
                  <tr>
                    <td colspan="6" class="px-3 py-8 text-center text-sm text-slate-400">
                      Không có dòng nào khớp bộ lọc.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </app-card>

        <app-pagination [(page)]="page" [pageSize]="pageSize" [totalItems]="filtered().length" />
      </div>
    } @else {
      <div class="rounded-lg border border-slate-200 bg-white p-8 text-center">
        <h2 class="text-lg font-semibold text-slate-900">Không tìm thấy phiên kiểm kê</h2>
        <a routerLink="/inventory/stock-take" class="mt-4 inline-block">
          <app-button variant="primary">Quay lại danh sách</app-button>
        </a>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockTakeCounterComponent {
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly confirmDialog = inject(ConfirmDialogService);

  readonly id = input.required<string>();

  protected readonly cancelIcon = LucideX.icon;
  protected readonly saveIcon = LucideSave.icon;
  protected readonly checkIcon = LucideCheck.icon;

  protected readonly searchTerm = signal('');
  protected readonly onlyUncounted = signal(false);
  protected readonly onlyVariance = signal(false);
  protected readonly page = signal(1);
  protected readonly pageSize = 20;

  protected readonly saving = signal(false);
  protected readonly completing = signal(false);

  protected readonly take = computed(() => findStockTake(this.id()));

  protected readonly statusOverride = signal<StockTakeStatus | null>(null);
  protected readonly lines = signal<LineDraft[]>([]);

  protected readonly breadcrumb = computed(() => [
    { label: 'Kho' },
    { label: 'Kiểm kê', to: '/inventory/stock-take' },
    { label: this.take()?.code ?? this.id() },
  ]);

  protected readonly currentStatus = computed<StockTakeStatus>(
    () => this.statusOverride() ?? this.take()?.status ?? 'draft',
  );

  protected readonly isEditable = computed(
    () => this.currentStatus() === 'draft' || this.currentStatus() === 'in_progress',
  );

  protected readonly warehouseName = computed(() => {
    const t = this.take();
    return MOCK_WAREHOUSES.find((w) => w.id === t?.warehouseId)?.name ?? '—';
  });

  protected readonly countedCount = computed(
    () => this.lines().filter((l) => l.countedQuantity !== null).length,
  );

  protected readonly pendingCount = computed(() => this.lines().length - this.countedCount());

  protected readonly countedPercent = computed(() => {
    const total = this.lines().length;
    if (total === 0) return 0;
    return Math.round((this.countedCount() / total) * 100);
  });

  protected readonly totalVariance = computed(() =>
    this.lines().reduce(
      (sum, l) =>
        l.countedQuantity === null ? sum : sum + (l.countedQuantity - l.expectedQuantity),
      0,
    ),
  );

  protected readonly varianceLineCount = computed(
    () =>
      this.lines().filter(
        (l) => l.countedQuantity !== null && l.countedQuantity !== l.expectedQuantity,
      ).length,
  );

  protected readonly totalVarianceClass = computed(() => {
    const base = 'mt-1 text-2xl font-bold';
    const v = this.totalVariance();
    if (v > 0) return `${base} text-green-700`;
    if (v < 0) return `${base} text-red-600`;
    return `${base} text-slate-900`;
  });

  protected readonly filtered = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const uncountedOnly = this.onlyUncounted();
    const varianceOnly = this.onlyVariance();
    const list = this.lines();

    return list.flatMap((line, originalIndex) => {
      if (uncountedOnly && line.countedQuantity !== null) return [];
      if (
        varianceOnly &&
        (line.countedQuantity === null || line.countedQuantity === line.expectedQuantity)
      )
        return [];
      if (
        term &&
        !line.productName.toLowerCase().includes(term) &&
        !line.variantSku.toLowerCase().includes(term)
      )
        return [];
      return [{ line, originalIndex }];
    });
  });

  protected readonly pagedLines = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  protected readonly canComplete = computed(
    () => this.lines().length > 0 && this.countedCount() === this.lines().length,
  );

  constructor() {
    queueMicrotask(() => {
      const t = this.take();
      if (!t) return;
      this.lines.set(t.lines.map((l) => ({ ...l })));
    });
  }

  protected statusLabel(): string {
    return STATUS_LABEL[this.currentStatus()];
  }

  protected statusVariant() {
    return STATUS_VARIANT[this.currentStatus()];
  }

  protected variance(line: IStockTakeLine | LineDraft): number {
    if (line.countedQuantity === null) return 0;
    return line.countedQuantity - line.expectedQuantity;
  }

  protected varianceClass(v: number): string {
    const base = 'text-sm font-semibold';
    if (v > 0) return `${base} text-green-700`;
    if (v < 0) return `${base} text-red-600`;
    return `${base} text-slate-700`;
  }

  protected rowClass(line: LineDraft): string {
    if (line.countedQuantity === null) return '';
    if (line.countedQuantity !== line.expectedQuantity) return 'bg-amber-50/40';
    return '';
  }

  protected onCountChange(index: number, event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    const value = raw === '' ? null : Number(raw);
    this.lines.update((list) =>
      list.map((l, i) =>
        i === index
          ? { ...l, countedQuantity: value === null || Number.isNaN(value) ? null : value }
          : l,
      ),
    );
  }

  protected onNoteChange(index: number, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.lines.update((list) => list.map((l, i) => (i === index ? { ...l, note: value } : l)));
  }

  protected onSaveDraft(): void {
    this.saving.set(true);
    setTimeout(() => {
      this.saving.set(false);
      if (this.currentStatus() === 'draft' && this.countedCount() > 0) {
        this.statusOverride.set('in_progress');
      }
      this.toast.success(
        'Đã lưu nháp',
        `${this.countedCount()}/${this.lines().length} dòng đã đếm.`,
      );
    }, 400);
  }

  protected async onComplete(): Promise<void> {
    const variance = this.totalVariance();
    const message =
      variance === 0
        ? 'Hoàn tất phiên kiểm kê? Toàn bộ tồn kho khớp hệ thống.'
        : `Hoàn tất phiên kiểm kê? Sẽ tạo ${this.varianceLineCount()} bút toán điều chỉnh (tổng lệch ${variance > 0 ? '+' : ''}${variance}).`;
    const ok = await this.confirmDialog.confirm({
      title: 'Hoàn tất kiểm kê',
      message,
      confirmText: 'Hoàn tất',
      variant: 'primary',
    });
    if (!ok) return;
    this.completing.set(true);
    setTimeout(() => {
      this.completing.set(false);
      this.statusOverride.set('completed');
      this.toast.success(
        'Đã hoàn tất kiểm kê',
        variance === 0
          ? 'Không có chênh lệch.'
          : `Đã tạo bút toán cho ${this.varianceLineCount()} SKU.`,
      );
    }, 600);
  }

  protected async onCancel(): Promise<void> {
    const ok = await this.confirmDialog.confirm({
      title: 'Huỷ phiên kiểm kê',
      message: 'Toàn bộ dữ liệu đếm sẽ bị bỏ. Bạn có chắc?',
      confirmText: 'Huỷ phiên',
      variant: 'danger',
    });
    if (!ok) return;
    this.statusOverride.set('cancelled');
    this.toast.success('Đã huỷ phiên kiểm kê');
    setTimeout(() => this.router.navigate(['/inventory/stock-take']), 400);
  }
}
