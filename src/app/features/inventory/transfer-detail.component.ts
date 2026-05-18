import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideArrowRight,
  LucideBox,
  LucideCheck,
  LucideClock,
  LucidePackage,
  LucideTruck,
  LucideX,
  type LucideIconData,
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
  TimelineComponent,
  type TimelineDotVariant,
  type TimelineEntry,
  ToastService,
} from '@/shared/ui';
import { MOCK_WAREHOUSES } from '@/core/warehouse/warehouse.mock';
import { findTransfer } from './inventory.mock';
import type { ITransferEvent, TransferStatus } from './inventory.types';

const STATUS_LABEL: Record<TransferStatus, string> = {
  draft: 'Nháp',
  pending: 'Chờ xuất kho',
  in_transit: 'Đang chuyển',
  received: 'Đã nhận',
  cancelled: 'Đã huỷ',
};

const STATUS_VARIANT: Record<
  TransferStatus,
  'neutral' | 'warning' | 'info' | 'success' | 'danger'
> = {
  draft: 'neutral',
  pending: 'warning',
  in_transit: 'info',
  received: 'success',
  cancelled: 'danger',
};

const STATUS_ICON: Record<TransferStatus, LucideIconData> = {
  draft: LucideBox.icon,
  pending: LucideClock.icon,
  in_transit: LucideTruck.icon,
  received: LucidePackage.icon,
  cancelled: LucideX.icon,
};

const STATUS_TIMELINE_VARIANT: Record<TransferStatus, TimelineDotVariant> = {
  draft: 'neutral',
  pending: 'warning',
  in_transit: 'info',
  received: 'success',
  cancelled: 'danger',
};

const PRICE_FORMATTER = new Intl.NumberFormat('vi-VN');

@Component({
  selector: 'app-transfer-detail',
  imports: [
    BadgeComponent,
    BreadcrumbComponent,
    ButtonComponent,
    CardComponent,
    DatePipe,
    DescriptionListComponent,
    IconComponent,
    RouterLink,
    TimelineComponent,
  ],
  template: `
    @if (transfer(); as t) {
      <div class="space-y-6">
        <app-breadcrumb [items]="breadcrumb()" />

        <app-card padding="lg">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div class="flex items-start gap-4 min-w-0">
              <span [class]="statusIconWrap(t.status)">
                <app-icon [icon]="statusIcon(t.status)" size="lg" />
              </span>
              <div class="min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <h1 class="text-2xl font-bold text-slate-900 font-mono">{{ t.code }}</h1>
                  <app-badge [variant]="statusVariant(t.status)" [dot]="true">
                    {{ statusLabel(t.status) }}
                  </app-badge>
                </div>
                <div class="mt-2 flex items-center gap-2 text-sm text-slate-700">
                  <span>{{ fromName() }}</span>
                  <app-icon [icon]="arrowIcon" size="sm" />
                  <span>{{ toName() }}</span>
                </div>
                <p class="mt-1 text-xs text-slate-500">
                  Tạo {{ t.createdAt | date: 'dd/MM/yyyy HH:mm' }} bởi {{ t.createdBy }}
                </p>
              </div>
            </div>

            <div class="flex gap-2 shrink-0">
              @if (t.status === 'draft' || t.status === 'pending') {
                <app-button variant="secondary" (click)="onCancel()">
                  <app-icon [icon]="cancelIcon" size="md" />
                  Huỷ phiếu
                </app-button>
              }
              @if (t.status === 'draft') {
                <app-button variant="primary" (click)="onConfirm()"> Duyệt phiếu </app-button>
              } @else if (t.status === 'pending') {
                <app-button variant="primary" (click)="onShip()">
                  <app-icon [icon]="truckIcon" size="md" />
                  Xuất kho
                </app-button>
              } @else if (t.status === 'in_transit') {
                <app-button variant="primary" (click)="onReceive()">
                  <app-icon [icon]="receiveIcon" size="md" />
                  Xác nhận nhận hàng
                </app-button>
              }
            </div>
          </div>
        </app-card>

        <div class="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <div class="space-y-4">
            <app-card padding="lg">
              <h2 class="text-sm font-semibold text-slate-700 mb-3">Thông tin phiếu</h2>
              <app-description-list [items]="infoItems()" [columns]="2" />
              @if (t.note) {
                <div class="mt-4 border-t border-slate-100 pt-3">
                  <p class="text-xs uppercase text-slate-500">Ghi chú</p>
                  <p class="mt-1 text-sm text-slate-700">{{ t.note }}</p>
                </div>
              }
            </app-card>

            <app-card padding="none">
              <div class="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <h2 class="text-sm font-semibold text-slate-700">Danh sách hàng</h2>
                <p class="text-xs text-slate-500">
                  {{ t.lines.length }} dòng · {{ t.totalQuantity }} sản phẩm
                </p>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th class="px-4 py-2 text-left font-medium">Sản phẩm</th>
                      <th class="px-4 py-2 text-left font-medium">SKU</th>
                      <th class="px-4 py-2 text-right font-medium">Số lượng</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    @for (line of t.lines; track line.variantSku) {
                      <tr>
                        <td class="px-4 py-2 text-slate-700">
                          {{ line.productName }}
                          @if (line.variantLabel) {
                            <span class="text-xs text-slate-400">— {{ line.variantLabel }}</span>
                          }
                        </td>
                        <td class="px-4 py-2 font-mono text-xs text-slate-600">
                          {{ line.variantSku }}
                        </td>
                        <td class="px-4 py-2 text-right font-medium text-slate-900">
                          {{ formatQty(line.quantity) }}
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </app-card>
          </div>

          <app-card padding="lg">
            <h2 class="text-sm font-semibold text-slate-700 mb-3">Tiến trình</h2>
            <app-timeline [entries]="timelineEntries()">
              <ng-template let-entry="entry">
                <p class="text-xs text-slate-500">
                  {{ entry.data.actor }}
                </p>
              </ng-template>
            </app-timeline>
          </app-card>
        </div>
      </div>
    } @else {
      <div class="rounded-lg border border-slate-200 bg-white p-8 text-center">
        <h2 class="text-lg font-semibold text-slate-900">Không tìm thấy phiếu chuyển</h2>
        <a routerLink="/inventory/transfers" class="mt-4 inline-block">
          <app-button variant="primary">Quay lại danh sách</app-button>
        </a>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransferDetailComponent {
  private readonly toast = inject(ToastService);
  private readonly confirmDialog = inject(ConfirmDialogService);

  readonly id = input.required<string>();

  protected readonly arrowIcon = LucideArrowRight.icon;
  protected readonly truckIcon = LucideTruck.icon;
  protected readonly receiveIcon = LucidePackage.icon;
  protected readonly cancelIcon = LucideX.icon;
  protected readonly checkIcon = LucideCheck.icon;

  // Local optimistic status override after action.
  protected readonly overrideStatus = signal<TransferStatus | null>(null);
  protected readonly overrideEvents = signal<ITransferEvent[]>([]);

  protected readonly baseTransfer = computed(() => findTransfer(this.id()));

  protected readonly transfer = computed(() => {
    const base = this.baseTransfer();
    if (!base) return undefined;
    const override = this.overrideStatus();
    const extraEvents = this.overrideEvents();
    if (override === null && extraEvents.length === 0) return base;
    return {
      ...base,
      status: override ?? base.status,
      events: [...base.events, ...extraEvents],
    };
  });

  protected readonly breadcrumb = computed(() => [
    { label: 'Kho' },
    { label: 'Điều chuyển', to: '/inventory/transfers' },
    { label: this.transfer()?.code ?? this.id() },
  ]);

  protected readonly fromName = computed(() => {
    const t = this.transfer();
    return MOCK_WAREHOUSES.find((w) => w.id === t?.fromWarehouseId)?.name ?? '—';
  });

  protected readonly toName = computed(() => {
    const t = this.transfer();
    return MOCK_WAREHOUSES.find((w) => w.id === t?.toWarehouseId)?.name ?? '—';
  });

  protected readonly infoItems = computed<DescriptionItem[]>(() => {
    const t = this.transfer();
    if (!t) return [];
    return [
      { label: 'Mã phiếu', value: t.code },
      { label: 'Kho nguồn', value: this.fromName() },
      { label: 'Kho đích', value: this.toName() },
      {
        label: 'Người tạo',
        value: t.createdBy,
        hint: new Date(t.createdAt).toLocaleString('vi-VN'),
      },
      {
        label: 'Dự kiến nhận',
        value: t.expectedAt ? new Date(t.expectedAt).toLocaleDateString('vi-VN') : '—',
      },
      {
        label: 'Đã nhận',
        value: t.receivedAt ? new Date(t.receivedAt).toLocaleString('vi-VN') : '—',
      },
    ];
  });

  protected readonly timelineEntries = computed<TimelineEntry<ITransferEvent>[]>(() => {
    const t = this.transfer();
    if (!t) return [];
    return [...t.events]
      .sort((a, b) => (a.occurredAt < b.occurredAt ? -1 : 1))
      .map((e) => ({
        id: e.id,
        title: e.note || STATUS_LABEL[e.status],
        timestamp: e.occurredAt,
        icon: STATUS_ICON[e.status],
        variant: STATUS_TIMELINE_VARIANT[e.status],
        data: e,
      }));
  });

  protected statusLabel(s: TransferStatus): string {
    return STATUS_LABEL[s];
  }

  protected statusVariant(s: TransferStatus) {
    return STATUS_VARIANT[s];
  }

  protected statusIcon(s: TransferStatus): LucideIconData {
    return STATUS_ICON[s];
  }

  protected statusIconWrap(s: TransferStatus): string {
    const base = 'flex h-12 w-12 shrink-0 items-center justify-center rounded-lg';
    const map: Record<TransferStatus, string> = {
      draft: 'bg-slate-100 text-slate-600',
      pending: 'bg-amber-50 text-amber-700',
      in_transit: 'bg-sky-50 text-sky-700',
      received: 'bg-green-50 text-green-700',
      cancelled: 'bg-red-50 text-red-700',
    };
    return `${base} ${map[s]}`;
  }

  protected formatQty(n: number): string {
    return PRICE_FORMATTER.format(n);
  }

  protected onConfirm(): void {
    this.advance('pending', 'Duyệt phiếu, sẵn sàng xuất kho');
    this.toast.success('Đã duyệt phiếu chuyển');
  }

  protected onShip(): void {
    this.advance('in_transit', 'Đã xuất kho, đang vận chuyển');
    this.toast.success('Đã xuất kho');
  }

  protected onReceive(): void {
    this.advance('received', 'Xác nhận nhận đủ hàng tại kho đích');
    this.toast.success('Đã hoàn tất phiếu chuyển');
  }

  protected async onCancel(): Promise<void> {
    const ok = await this.confirmDialog.confirm({
      title: 'Huỷ phiếu chuyển',
      message: 'Phiếu sẽ bị đóng và không thể tiếp tục. Bạn có chắc?',
      confirmText: 'Huỷ phiếu',
      variant: 'danger',
    });
    if (!ok) return;
    this.advance('cancelled', 'Huỷ phiếu do thay đổi nhu cầu');
    this.toast.success('Đã huỷ phiếu chuyển');
  }

  private advance(next: TransferStatus, note: string): void {
    this.overrideStatus.set(next);
    this.overrideEvents.update((events) => [
      ...events,
      {
        id: `local-${Date.now()}`,
        occurredAt: new Date().toISOString(),
        status: next,
        actor: 'Bạn',
        note,
      },
    ]);
  }
}
