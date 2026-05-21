import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  ButtonComponent,
  CardComponent,
  CheckboxComponent,
  type DateRange,
  DateRangePickerComponent,
  EmptyStateComponent,
  PageHeaderComponent,
  PaginationComponent,
  SearchInputComponent,
  SelectComponent,
  type SelectOption,
  ToastService,
} from '@/shared/ui';
import { RelativeTimePipe } from '@/shared/pipes/relative-time.pipe';
import { NotificationStore } from './notification.store';
import {
  NOTIFICATION_TYPE_META,
  type INotification,
  type NotificationType,
} from './notification.types';

type ReadFilter = 'all' | 'unread' | 'read';

const TYPE_OPTIONS: SelectOption<NotificationType | 'all'>[] = [
  { value: 'all', label: 'Tất cả phân loại' },
  ...(Object.keys(NOTIFICATION_TYPE_META) as NotificationType[]).map((v) => ({
    value: v,
    label: NOTIFICATION_TYPE_META[v].label,
  })),
];

const READ_OPTIONS: SelectOption<ReadFilter>[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'unread', label: 'Chưa đọc' },
  { value: 'read', label: 'Đã đọc' },
];

const PAGE_SIZE = 25;

@Component({
  selector: 'app-notifications-list',
  imports: [
    ButtonComponent,
    CardComponent,
    CheckboxComponent,
    DatePipe,
    DateRangePickerComponent,
    EmptyStateComponent,
    FormsModule,
    PageHeaderComponent,
    PaginationComponent,
    RelativeTimePipe,
    RouterLink,
    SearchInputComponent,
    SelectComponent,
  ],
  template: `
    <div class="space-y-4">
      <app-page-header
        title="Thông báo"
        description="Tổng hợp toàn bộ thông báo của tài khoản."
        [breadcrumb]="breadcrumbs"
      >
        <div page-actions class="flex items-center gap-2">
          <app-button variant="secondary" size="sm" (click)="markAll()">
            Đánh dấu tất cả đã đọc
          </app-button>
        </div>
      </app-page-header>

      <div class="grid grid-cols-2 gap-3 md:grid-cols-3">
        <app-card padding="md">
          <p class="text-xs text-slate-500">Tổng</p>
          <p class="text-2xl font-bold text-slate-900">{{ store.total() }}</p>
        </app-card>
        <app-card padding="md">
          <p class="text-xs text-slate-500">Chưa đọc</p>
          <p class="text-2xl font-bold text-indigo-700">{{ store.unreadCount() }}</p>
        </app-card>
        <app-card padding="md">
          <p class="text-xs text-slate-500">Hôm nay</p>
          <p class="text-2xl font-bold text-emerald-700">{{ store.todayCount() }}</p>
        </app-card>
      </div>

      <app-card padding="lg" class="block">
        <div class="mb-4 grid gap-3 md:grid-cols-[1fr_180px_140px_240px]">
          <app-search-input
            id="noti-search"
            placeholder="Tìm theo tiêu đề hoặc nội dung..."
            [(ngModel)]="search"
          />
          <app-select id="noti-type" [options]="typeOptions" [(ngModel)]="typeFilter" />
          <app-select id="noti-read" [options]="readOptions" [(ngModel)]="readFilter" />
          <app-date-range-picker
            id="noti-date"
            [ngModel]="dateRange()"
            (ngModelChange)="onRangeChange($event)"
          />
        </div>

        @if (selectedIds().size > 0) {
          <div class="mb-3 flex items-center justify-between rounded-md bg-indigo-50 px-3 py-2">
            <span class="text-sm text-indigo-900">
              Đã chọn {{ selectedIds().size }} thông báo
            </span>
            <div class="flex gap-2">
              <app-button size="sm" variant="secondary" (click)="bulkMarkRead()">
                Đánh dấu đã đọc
              </app-button>
              <app-button size="sm" variant="secondary" (click)="bulkArchive()">
                Lưu trữ
              </app-button>
              <app-button size="sm" variant="secondary" (click)="clearSelection()">
                Bỏ chọn
              </app-button>
            </div>
          </div>
        }

        @if (pageRows().length > 0) {
          <ul class="divide-y divide-slate-100 rounded-md border border-slate-200">
            @for (n of pageRows(); track n.id) {
              <li
                class="flex gap-3 px-4 py-3 transition-colors hover:bg-slate-50"
                [class.bg-indigo-50/40]="!n.read"
              >
                <div class="pt-1">
                  <app-checkbox
                    [id]="'noti-' + n.id"
                    [ngModel]="selectedIds().has(n.id)"
                    (ngModelChange)="toggleSelect(n.id, $event)"
                  />
                </div>
                <button
                  type="button"
                  class="flex-shrink-0 self-start"
                  [attr.aria-label]="'Phân loại ' + typeLabel(n)"
                  (click)="open(n)"
                >
                  <span
                    class="inline-flex h-8 w-8 items-center justify-center rounded-full"
                    [class]="typeBadge(n)"
                  >
                    <span class="h-2 w-2 rounded-full" [class]="typeDot(n)"></span>
                  </span>
                </button>
                <button type="button" class="flex-1 text-left" (click)="open(n)">
                  <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                      <p
                        class="truncate text-sm"
                        [class.font-semibold]="!n.read"
                        [class.text-slate-900]="!n.read"
                        [class.text-slate-700]="n.read"
                      >
                        {{ n.title }}
                      </p>
                      <p class="mt-0.5 line-clamp-2 text-xs text-slate-500">{{ n.description }}</p>
                    </div>
                    <div class="flex shrink-0 flex-col items-end gap-1 text-xs">
                      <span class="text-slate-500">{{ n.createdAt | relativeTime }}</span>
                      <span class="text-[10px] text-slate-400">
                        {{ n.createdAt | date: 'dd/MM HH:mm' }}
                      </span>
                    </div>
                  </div>
                </button>
              </li>
            }
          </ul>
        } @else {
          <app-empty-state
            title="Không có thông báo"
            description="Điều chỉnh bộ lọc hoặc chờ thông báo mới."
          />
        }

        <div class="mt-3 flex items-center justify-between">
          <span class="text-xs text-slate-500">
            Hiển thị {{ pageRows().length }} / {{ filtered().length }} thông báo
          </span>
          <app-pagination
            [(page)]="currentPage"
            [pageSize]="pageSize"
            [totalItems]="filtered().length"
          />
        </div>
      </app-card>

      <p class="text-center text-xs text-slate-400">
        <a routerLink="/dashboard" class="hover:underline">← Quay về Dashboard</a>
      </p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationsListComponent {
  protected readonly store = inject(NotificationStore);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly breadcrumbs = [{ label: 'Hệ thống' }, { label: 'Thông báo' }];
  protected readonly typeOptions = TYPE_OPTIONS;
  protected readonly readOptions = READ_OPTIONS;
  protected readonly pageSize = PAGE_SIZE;

  protected readonly search = signal<string>('');
  protected readonly typeFilter = signal<NotificationType | 'all'>('all');
  protected readonly readFilter = signal<ReadFilter>('all');
  protected readonly dateRange = signal<DateRange>({ start: null, end: null });
  protected readonly currentPage = signal<number>(1);
  protected readonly selectedIds = signal<ReadonlySet<string>>(new Set<string>());

  protected readonly filtered = computed<INotification[]>(() => {
    const q = this.search().trim().toLowerCase();
    const type = this.typeFilter();
    const read = this.readFilter();
    const range = this.dateRange();
    return this.store.items().filter((n) => {
      if (n.archived) return false;
      if (q && !`${n.title} ${n.description}`.toLowerCase().includes(q)) return false;
      if (type !== 'all' && n.type !== type) return false;
      if (read === 'unread' && n.read) return false;
      if (read === 'read' && !n.read) return false;
      if (range.start && n.createdAt < range.start) return false;
      if (range.end && n.createdAt > `${range.end}T23:59:59.999Z`) return false;
      return true;
    });
  });

  protected readonly pageRows = computed<INotification[]>(() => {
    const start = (this.currentPage() - 1) * PAGE_SIZE;
    return this.filtered().slice(start, start + PAGE_SIZE);
  });

  protected typeLabel(n: INotification): string {
    return NOTIFICATION_TYPE_META[n.type].label;
  }
  protected typeBadge(n: INotification): string {
    return NOTIFICATION_TYPE_META[n.type].badgeClass;
  }
  protected typeDot(n: INotification): string {
    return NOTIFICATION_TYPE_META[n.type].dotClass;
  }

  protected onRangeChange(r: DateRange): void {
    this.dateRange.set(r);
    this.currentPage.set(1);
  }

  protected toggleSelect(id: string, on: boolean): void {
    this.selectedIds.update((set) => {
      const next = new Set(set);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  protected clearSelection(): void {
    this.selectedIds.set(new Set<string>());
  }

  protected bulkMarkRead(): void {
    const ids = this.selectedIds();
    this.store.markManyAsRead(ids);
    this.toast.success(`Đã đánh dấu ${ids.size} thông báo là đã đọc`);
    this.clearSelection();
  }

  protected bulkArchive(): void {
    const ids = this.selectedIds();
    this.store.archiveMany(ids);
    this.toast.info(`Đã lưu trữ ${ids.size} thông báo`);
    this.clearSelection();
  }

  protected markAll(): void {
    this.store.markAllAsRead();
    this.toast.success('Đã đánh dấu tất cả là đã đọc');
  }

  protected open(n: INotification): void {
    if (!n.read) this.store.markAsRead(n.id);
    if (n.to) void this.router.navigateByUrl(n.to);
  }
}
