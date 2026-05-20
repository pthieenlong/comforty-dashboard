import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  LucideCheck,
  LucideCopy,
  LucidePauseCircle,
  LucidePlayCircle,
  LucideTicket,
} from '@lucide/angular';
import {
  BadgeComponent,
  BreadcrumbComponent,
  ButtonComponent,
  CardComponent,
  ConfirmDialogService,
  DescriptionListComponent,
  type DescriptionItem,
  IconComponent,
  SearchInputComponent,
  SelectComponent,
  type SelectOption,
  ToastService,
} from '@/shared/ui';
import { findCustomer } from '@/features/customer/customer.mock';
import { CampaignStore } from './campaign.store';
import { VoucherStore } from './voucher.store';
import {
  VOUCHER_STATUS_META,
  VOUCHER_TYPE_META,
  type IVoucherCode,
  type VoucherStatus,
  type VoucherType,
} from './marketing.types';

const PRICE_FORMATTER = new Intl.NumberFormat('vi-VN');

const USAGE_FILTER_OPTIONS: SelectOption<string>[] = [
  { value: 'all', label: 'Tất cả mã' },
  { value: 'unused', label: 'Chưa dùng' },
  { value: 'used', label: 'Đã dùng' },
];

@Component({
  selector: 'app-voucher-detail',
  imports: [
    BadgeComponent,
    BreadcrumbComponent,
    ButtonComponent,
    CardComponent,
    DatePipe,
    DescriptionListComponent,
    FormsModule,
    IconComponent,
    RouterLink,
    SearchInputComponent,
    SelectComponent,
  ],
  template: `
    @if (batch(); as b) {
      <div class="space-y-6">
        <app-breadcrumb [items]="breadcrumb()" />

        <app-card padding="lg">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div class="flex items-start gap-4 min-w-0">
              <span
                class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700"
              >
                <app-icon [icon]="ticketIcon" size="lg" />
              </span>
              <div class="min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <h1 class="text-2xl font-bold text-slate-900">{{ b.name }}</h1>
                  <app-badge [variant]="statusVariant(b.status)" [dot]="true">
                    {{ statusLabel(b.status) }}
                  </app-badge>
                  <app-badge [variant]="b.voucherType === 'single_use' ? 'info' : 'neutral'">
                    {{ typeLabel(b.voucherType) }}
                  </app-badge>
                </div>
                <p class="mt-1 font-mono text-xs text-slate-500">{{ b.code }}</p>
                @if (b.description) {
                  <p class="mt-2 text-sm text-slate-600 max-w-2xl">{{ b.description }}</p>
                }
              </div>
            </div>

            <div class="flex gap-2 shrink-0 flex-wrap justify-end">
              @if (b.status === 'active') {
                <app-button variant="secondary" (click)="onPause()">
                  <app-icon [icon]="pauseIcon" size="md" />
                  Tạm dừng
                </app-button>
              } @else if (b.status === 'paused') {
                <app-button variant="primary" (click)="onActivate()">
                  <app-icon [icon]="playIcon" size="md" />
                  Kích hoạt
                </app-button>
              }
            </div>
          </div>
        </app-card>

        <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
          <div class="space-y-4">
            <app-card padding="lg">
              <h2 class="text-sm font-semibold text-slate-700 mb-3">Cấu hình giảm giá</h2>
              <app-description-list [items]="configItems()" [columns]="1" />
              @if (campaignName(); as cn) {
                <div class="mt-4 border-t border-slate-100 pt-3">
                  <p class="text-xs uppercase text-slate-500 mb-1">Chiến dịch</p>
                  <a
                    [routerLink]="['/marketing/campaigns', b.campaignId]"
                    class="text-sm font-medium text-slate-900 hover:text-indigo-600"
                  >
                    {{ cn }}
                  </a>
                </div>
              }
            </app-card>

            <app-card padding="lg">
              <h2 class="text-sm font-semibold text-slate-700 mb-3">Tỉ lệ sử dụng</h2>
              <div class="text-center">
                <p class="text-3xl font-bold text-slate-900">
                  {{ b.usedCount.toLocaleString('vi-VN') }} /
                  {{ b.totalCodes.toLocaleString('vi-VN') }}
                </p>
                <p class="text-sm text-slate-500">{{ usagePercent() }}% đã dùng</p>
                <div class="mt-3 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    class="h-full bg-indigo-500 transition-all"
                    [style.width.%]="usagePercent()"
                  ></div>
                </div>
              </div>
            </app-card>
          </div>

          <app-card padding="none">
            <div
              class="border-b border-slate-200 px-5 py-3 flex items-center justify-between gap-3"
            >
              <div>
                <h2 class="text-sm font-semibold text-slate-700">
                  Danh sách mã ({{ filteredCodes().length }})
                </h2>
                @if (b.voucherType === 'multi_use') {
                  <p class="text-xs text-slate-500 mt-0.5">Voucher dùng chung — chỉ 1 mã shared.</p>
                }
              </div>
              @if (b.voucherType === 'single_use') {
                <app-button variant="secondary" size="sm" (click)="copyAllCodes()">
                  <app-icon [icon]="copyIcon" size="sm" />
                  Copy tất cả mã chưa dùng
                </app-button>
              }
            </div>

            @if (b.voucherType === 'single_use') {
              <div class="border-b border-slate-100 px-5 py-3 grid gap-2 sm:grid-cols-2">
                <app-search-input
                  id="vch-code-search"
                  placeholder="Tìm mã..."
                  [(ngModel)]="codeSearch"
                />
                <app-select
                  id="vch-code-usage"
                  [options]="usageFilterOptions"
                  [(ngModel)]="usageFilter"
                />
              </div>
            }

            <div class="overflow-x-auto max-h-[500px]">
              <table class="w-full text-sm">
                <thead
                  class="sticky top-0 bg-slate-50 text-xs uppercase tracking-wide text-slate-500"
                >
                  <tr>
                    <th class="px-4 py-2 text-left font-medium">Mã</th>
                    <th class="px-4 py-2 text-left font-medium">Trạng thái</th>
                    <th class="px-4 py-2 text-left font-medium">Khách hàng</th>
                    <th class="px-4 py-2 text-left font-medium">Dùng lúc</th>
                    <th class="px-4 py-2 text-right font-medium">Đơn</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  @for (code of pagedCodes(); track code.id) {
                    <tr class="hover:bg-slate-50">
                      <td class="px-4 py-2">
                        <button
                          type="button"
                          class="inline-flex items-center gap-1.5 font-mono text-xs text-slate-700 hover:text-indigo-600"
                          [attr.aria-label]="'Copy ' + code.code"
                          (click)="copyCode(code.code)"
                        >
                          <app-icon [icon]="copyIcon" size="xs" />
                          {{ code.code }}
                        </button>
                      </td>
                      <td class="px-4 py-2">
                        @if (code.usedAt) {
                          <app-badge variant="success" [dot]="true">Đã dùng</app-badge>
                        } @else {
                          <app-badge variant="neutral" [dot]="true">Chưa dùng</app-badge>
                        }
                      </td>
                      <td class="px-4 py-2 text-slate-700">
                        @if (code.usedByCustomerId) {
                          {{ customerName(code.usedByCustomerId) }}
                        } @else {
                          <span class="text-slate-400">—</span>
                        }
                      </td>
                      <td class="px-4 py-2 text-xs text-slate-500">
                        @if (code.usedAt) {
                          {{ code.usedAt | date: 'dd/MM/yyyy HH:mm' }}
                        } @else {
                          —
                        }
                      </td>
                      <td class="px-4 py-2 text-right">
                        @if (code.orderId) {
                          <a
                            [routerLink]="['/orders', code.orderId]"
                            class="text-xs font-mono text-slate-600 hover:text-indigo-600"
                          >
                            View
                          </a>
                        } @else {
                          <span class="text-xs text-slate-400">—</span>
                        }
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="5" class="px-4 py-8 text-center text-sm text-slate-500">
                        Không có mã nào khớp bộ lọc.
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
            @if (filteredCodes().length > pageSize) {
              <div
                class="border-t border-slate-100 px-5 py-3 flex items-center justify-between text-xs text-slate-500"
              >
                <span> Hiển thị {{ pagedCodes().length }} / {{ filteredCodes().length }} mã </span>
                <div class="flex gap-2">
                  <app-button
                    variant="secondary"
                    size="sm"
                    [disabled]="page() === 1"
                    (click)="page.set(page() - 1)"
                  >
                    Trước
                  </app-button>
                  <app-button
                    variant="secondary"
                    size="sm"
                    [disabled]="page() * pageSize >= filteredCodes().length"
                    (click)="page.set(page() + 1)"
                  >
                    Sau
                  </app-button>
                </div>
              </div>
            }
          </app-card>
        </div>
      </div>
    } @else {
      <div class="rounded-lg border border-slate-200 bg-white p-8 text-center">
        <h2 class="text-lg font-semibold text-slate-900">Không tìm thấy batch voucher</h2>
        <a routerLink="/marketing/vouchers" class="mt-4 inline-block">
          <app-button variant="primary">Quay lại danh sách</app-button>
        </a>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VoucherDetailComponent {
  private readonly voucherStore = inject(VoucherStore);
  private readonly campaignStore = inject(CampaignStore);
  private readonly toast = inject(ToastService);
  private readonly confirmDialog = inject(ConfirmDialogService);

  readonly id = input.required<string>();

  protected readonly ticketIcon = LucideTicket.icon;
  protected readonly copyIcon = LucideCopy.icon;
  protected readonly checkIcon = LucideCheck.icon;
  protected readonly pauseIcon = LucidePauseCircle.icon;
  protected readonly playIcon = LucidePlayCircle.icon;

  protected readonly usageFilterOptions = USAGE_FILTER_OPTIONS;

  protected readonly codeSearch = signal('');
  protected readonly usageFilter = signal<string>('all');
  protected readonly page = signal(1);
  protected readonly pageSize = 50;

  protected readonly batch = computed(() => this.voucherStore.findBatchById(this.id()));

  protected readonly codes = computed<IVoucherCode[]>(() =>
    this.voucherStore.findCodesByBatch(this.id()),
  );

  protected readonly filteredCodes = computed(() => {
    const term = this.codeSearch().trim().toLowerCase();
    const usage = this.usageFilter();
    return this.codes().filter((c) => {
      if (usage === 'used' && !c.usedAt) return false;
      if (usage === 'unused' && c.usedAt) return false;
      if (!term) return true;
      return c.code.toLowerCase().includes(term);
    });
  });

  protected readonly pagedCodes = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filteredCodes().slice(start, start + this.pageSize);
  });

  protected readonly campaignName = computed(() => {
    const cid = this.batch()?.campaignId;
    if (!cid) return null;
    return this.campaignStore.findById(cid)?.name ?? null;
  });

  protected readonly breadcrumb = computed(() => [
    { label: 'Trang chủ', to: '/dashboard' },
    { label: 'Marketing' },
    { label: 'Voucher', to: '/marketing/vouchers' },
    { label: this.batch()?.name ?? this.id() },
  ]);

  protected readonly configItems = computed<DescriptionItem[]>(() => {
    const b = this.batch();
    if (!b) return [];
    const discount =
      b.discountPercent !== null
        ? `${b.discountPercent}%`
        : b.discountAmount !== null
          ? `${PRICE_FORMATTER.format(b.discountAmount)}₫`
          : '—';
    return [
      { label: 'Mã batch', value: b.code },
      { label: 'Loại voucher', value: VOUCHER_TYPE_META[b.voucherType].label },
      { label: 'Giảm', value: discount },
      {
        label: 'Đơn tối thiểu',
        value:
          b.minOrderValue === 0 ? 'Không yêu cầu' : `${PRICE_FORMATTER.format(b.minOrderValue)}₫`,
      },
      {
        label: 'Giảm tối đa',
        value: b.maxDiscount ? `${PRICE_FORMATTER.format(b.maxDiscount)}₫` : 'Không giới hạn',
      },
      { label: 'Bắt đầu', value: new Date(b.startAt).toLocaleDateString('vi-VN') },
      { label: 'Kết thúc', value: new Date(b.endAt).toLocaleDateString('vi-VN') },
    ];
  });

  protected readonly usagePercent = computed(() => {
    const b = this.batch();
    if (!b || b.totalCodes === 0) return 0;
    return Math.round((b.usedCount / b.totalCodes) * 100);
  });

  protected typeLabel(t: VoucherType): string {
    return VOUCHER_TYPE_META[t].label;
  }

  protected statusLabel(s: VoucherStatus): string {
    return VOUCHER_STATUS_META[s].label;
  }

  protected statusVariant(s: VoucherStatus) {
    return VOUCHER_STATUS_META[s].badgeVariant;
  }

  protected customerName(id: string): string {
    return findCustomer(id)?.fullName ?? id;
  }

  protected async copyCode(code: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(code);
      this.toast.success(`Đã copy mã ${code}`);
    } catch {
      this.toast.warning('Không copy được mã — thử thủ công');
    }
  }

  protected async copyAllCodes(): Promise<void> {
    const unused = this.codes().filter((c) => !c.usedAt);
    if (unused.length === 0) {
      this.toast.warning('Tất cả mã đã được sử dụng');
      return;
    }
    const text = unused.map((c) => c.code).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      this.toast.success(`Đã copy ${unused.length} mã chưa dùng`);
    } catch {
      this.toast.warning('Không copy được — thử thủ công');
    }
  }

  protected async onPause(): Promise<void> {
    const ok = await this.confirmDialog.confirm({
      title: 'Tạm dừng batch voucher',
      message: 'Tạm dừng sẽ chặn việc sử dụng mã mới. Bạn có chắc?',
      confirmText: 'Tạm dừng',
      variant: 'danger',
    });
    if (!ok) return;
    await this.voucherStore.setStatus(this.id(), 'paused');
    this.toast.success('Đã tạm dừng batch');
  }

  protected async onActivate(): Promise<void> {
    await this.voucherStore.setStatus(this.id(), 'active');
    this.toast.success('Đã kích hoạt batch');
  }
}
