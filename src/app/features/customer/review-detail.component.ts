import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideCheck,
  LucideEye,
  LucideEyeOff,
  LucideStar,
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
  type TimelineDotVariant,
  type TimelineEntry,
  TimelineComponent,
  ToastService,
} from '@/shared/ui';
import { AuthStore } from '@/core/auth/auth.store';
import { ReviewStore } from './review.store';
import { REVIEW_STATUS_META, type IReviewModerationEvent, type ReviewStatus } from './review.types';
import { openReviewRejectDialog } from './review-reject-dialog.component';

const EVENT_ICON: Record<IReviewModerationEvent['action'], LucideIconData> = {
  submitted: LucideStar.icon,
  approved: LucideCheck.icon,
  rejected: LucideX.icon,
  hidden: LucideEyeOff.icon,
  unhidden: LucideEye.icon,
};

const EVENT_VARIANT: Record<IReviewModerationEvent['action'], TimelineDotVariant> = {
  submitted: 'neutral',
  approved: 'success',
  rejected: 'danger',
  hidden: 'warning',
  unhidden: 'info',
};

const EVENT_LABEL: Record<IReviewModerationEvent['action'], string> = {
  submitted: 'Khách gửi đánh giá',
  approved: 'Đã duyệt',
  rejected: 'Đã từ chối',
  hidden: 'Đã ẩn',
  unhidden: 'Đã bỏ ẩn',
};

@Component({
  selector: 'app-review-detail',
  imports: [
    BadgeComponent,
    BreadcrumbComponent,
    ButtonComponent,
    CardComponent,
    DescriptionListComponent,
    IconComponent,
    RouterLink,
    TimelineComponent,
  ],
  template: `
    @if (review(); as r) {
      <div class="space-y-6">
        <app-breadcrumb [items]="breadcrumb()" />

        <app-card padding="lg">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div class="flex items-start gap-4 min-w-0">
              <div class="flex items-center gap-1">
                @for (i of [1, 2, 3, 4, 5]; track i) {
                  <app-icon
                    [icon]="starIcon"
                    size="md"
                    [class]="i <= r.rating ? 'text-amber-500' : 'text-slate-200'"
                  />
                }
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <h1 class="text-xl font-bold text-slate-900">{{ r.title }}</h1>
                  <app-badge [variant]="statusVariant(r.status)" [dot]="true">
                    {{ statusLabel(r.status) }}
                  </app-badge>
                  @if (r.verifiedPurchase) {
                    <app-badge variant="success">Đã mua hàng</app-badge>
                  }
                </div>
                <p class="mt-1 text-xs text-slate-500">
                  Gửi {{ formatDate(r.submittedAt) }} bởi
                  <a
                    [routerLink]="['/customers', r.customerId]"
                    class="hover:text-indigo-600 font-medium text-slate-700"
                  >
                    {{ r.customerName }}
                  </a>
                </p>
              </div>
            </div>

            <div class="flex gap-2 shrink-0 flex-wrap justify-end">
              @if (r.status === 'pending') {
                <app-button variant="primary" (click)="onApprove()">
                  <app-icon [icon]="checkIcon" size="md" />
                  Duyệt
                </app-button>
                <app-button variant="danger" (click)="onReject()">
                  <app-icon [icon]="rejectIcon" size="md" />
                  Từ chối
                </app-button>
              } @else if (r.status === 'approved') {
                <app-button variant="secondary" (click)="onHide()">
                  <app-icon [icon]="hideIcon" size="md" />
                  Ẩn
                </app-button>
              } @else if (r.status === 'hidden') {
                <app-button variant="primary" (click)="onUnhide()">
                  <app-icon [icon]="showIcon" size="md" />
                  Bỏ ẩn
                </app-button>
              } @else if (r.status === 'rejected') {
                <app-button variant="secondary" (click)="onApprove()">
                  <app-icon [icon]="checkIcon" size="md" />
                  Khôi phục (duyệt)
                </app-button>
              }
            </div>
          </div>
        </app-card>

        <div class="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <div class="space-y-4">
            <app-card padding="lg">
              <h2 class="text-sm font-semibold text-slate-700 mb-2">Nội dung đánh giá</h2>
              <p class="text-sm text-slate-700 whitespace-pre-line">{{ r.content }}</p>

              @if (r.media.length > 0) {
                <div class="mt-4">
                  <p class="text-xs uppercase text-slate-500 mb-2">Hình ảnh đính kèm</p>
                  <div class="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                    @for (m of r.media; track m.id) {
                      <img
                        [src]="m.url"
                        [alt]="r.title"
                        class="aspect-square w-full rounded-md object-cover border border-slate-200"
                      />
                    }
                  </div>
                </div>
              }

              <div
                class="mt-4 border-t border-slate-100 pt-3 flex items-center gap-4 text-xs text-slate-500"
              >
                <span>👍 {{ r.helpfulCount }} hữu ích</span>
                @if (r.reportedCount > 0) {
                  <span class="text-red-600">🚩 {{ r.reportedCount }} báo cáo</span>
                }
              </div>

              @if (r.rejectReason) {
                <div class="mt-4 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm">
                  <p class="font-medium text-red-800">Lý do từ chối</p>
                  <p class="mt-0.5 text-red-700">{{ r.rejectReason }}</p>
                </div>
              }
            </app-card>

            <app-card padding="lg">
              <h2 class="text-sm font-semibold text-slate-700 mb-3">Lịch sử moderation</h2>
              <app-timeline [entries]="timelineEntries()">
                <ng-template let-entry="entry">
                  @if (entry.data.reason) {
                    <p class="text-xs text-slate-600 italic">{{ entry.data.reason }}</p>
                  }
                </ng-template>
              </app-timeline>
            </app-card>
          </div>

          <div class="space-y-4">
            <app-card padding="lg">
              <h2 class="text-sm font-semibold text-slate-700 mb-3">Sản phẩm</h2>
              <a
                [routerLink]="['/catalog/products', r.productId]"
                class="text-sm font-medium text-slate-900 hover:text-indigo-600"
              >
                {{ r.productName }}
              </a>
              @if (r.variantSku) {
                <p class="font-mono text-xs text-slate-500">{{ r.variantSku }}</p>
              }
            </app-card>

            <app-card padding="lg">
              <h2 class="text-sm font-semibold text-slate-700 mb-3">Khách hàng</h2>
              <a
                [routerLink]="['/customers', r.customerId]"
                class="text-sm font-medium text-slate-900 hover:text-indigo-600"
              >
                {{ r.customerName }}
              </a>
              <app-description-list [items]="orderItems()" [columns]="1" />
            </app-card>
          </div>
        </div>
      </div>
    } @else {
      <div class="rounded-lg border border-slate-200 bg-white p-8 text-center">
        <h2 class="text-lg font-semibold text-slate-900">Không tìm thấy đánh giá</h2>
        <a routerLink="/crm/reviews" class="mt-4 inline-block">
          <app-button variant="primary">Quay lại danh sách</app-button>
        </a>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewDetailComponent {
  private readonly reviewStore = inject(ReviewStore);
  private readonly authStore = inject(AuthStore);
  private readonly toast = inject(ToastService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly dialog = inject(Dialog);

  readonly id = input.required<string>();

  protected readonly starIcon = LucideStar.icon;
  protected readonly checkIcon = LucideCheck.icon;
  protected readonly rejectIcon = LucideX.icon;
  protected readonly hideIcon = LucideEyeOff.icon;
  protected readonly showIcon = LucideEye.icon;

  protected readonly review = computed(() => this.reviewStore.findById(this.id()));

  protected readonly breadcrumb = computed(() => [
    { label: 'Trang chủ', to: '/dashboard' },
    { label: 'CRM' },
    { label: 'Đánh giá', to: '/crm/reviews' },
    { label: this.review()?.title ?? this.id() },
  ]);

  protected readonly timelineEntries = computed<TimelineEntry<IReviewModerationEvent>[]>(() => {
    const r = this.review();
    if (!r) return [];
    return [...r.events]
      .sort((a, b) => (a.occurredAt < b.occurredAt ? -1 : 1))
      .map((e) => ({
        id: e.id,
        title: EVENT_LABEL[e.action] + (e.actor !== 'Khách hàng' ? ` bởi ${e.actor}` : ''),
        timestamp: e.occurredAt,
        icon: EVENT_ICON[e.action],
        variant: EVENT_VARIANT[e.action],
        data: e,
      }));
  });

  protected readonly orderItems = computed<DescriptionItem[]>(() => {
    const r = this.review();
    if (!r) return [];
    return [
      { label: 'Đơn liên quan', value: r.orderCode ?? '—' },
      {
        label: 'Đánh giá xác thực',
        value: r.verifiedPurchase ? 'Có (đã mua)' : 'Không',
      },
    ];
  });

  protected statusLabel(s: ReviewStatus): string {
    return REVIEW_STATUS_META[s].label;
  }

  protected statusVariant(s: ReviewStatus) {
    return REVIEW_STATUS_META[s].badgeVariant;
  }

  protected formatDate(iso: string): string {
    return new Date(iso).toLocaleString('vi-VN');
  }

  private actor(): string {
    return this.authStore.currentUser()?.fullName ?? 'Bạn';
  }

  protected async onApprove(): Promise<void> {
    await this.reviewStore.transition(this.id(), 'approve', this.actor());
    this.toast.success('Đã duyệt đánh giá');
  }

  protected async onReject(): Promise<void> {
    const r = this.review();
    if (!r) return;
    const result = await openReviewRejectDialog(this.dialog, { reviewTitle: r.title });
    if (!result) return;
    const reason = result.note ? `${result.reason} — ${result.note}` : result.reason;
    await this.reviewStore.transition(this.id(), 'reject', this.actor(), reason);
    this.toast.success('Đã từ chối đánh giá');
  }

  protected async onHide(): Promise<void> {
    const ok = await this.confirmDialog.confirm({
      title: 'Ẩn đánh giá',
      message: 'Đánh giá sẽ không hiển thị công khai. Bạn có chắc?',
      confirmText: 'Ẩn',
      variant: 'danger',
    });
    if (!ok) return;
    await this.reviewStore.transition(this.id(), 'hide', this.actor(), 'Ẩn bởi moderator');
    this.toast.success('Đã ẩn đánh giá');
  }

  protected async onUnhide(): Promise<void> {
    await this.reviewStore.transition(this.id(), 'unhide', this.actor(), 'Bỏ ẩn');
    this.toast.success('Đã hiển thị lại đánh giá');
  }
}
