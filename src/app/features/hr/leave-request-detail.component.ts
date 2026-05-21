import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  LucideCheck,
  LucideClock,
  LucideMessageCircle,
  LucideX,
  LucideXCircle,
} from '@lucide/angular';
import { AuthStore } from '@/core/auth/auth.store';
import { TenantStore } from '@/core/tenant/tenant.store';
import { USERS } from '@/features/iam/iam.mock';
import {
  ButtonComponent,
  CardComponent,
  ConfirmDialogService,
  type DescriptionItem,
  DescriptionListComponent,
  PageHeaderComponent,
  TimelineComponent,
  type TimelineEntry,
  ToastService,
} from '@/shared/ui';
import { LeaveRequestStore } from './leave-request.store';
import { LEAVE_STATUS_META, LEAVE_TYPE_META, type ILeaveRequest } from './hr.types';

@Component({
  selector: 'app-leave-request-detail',
  imports: [
    ButtonComponent,
    CardComponent,
    DescriptionListComponent,
    PageHeaderComponent,
    RouterLink,
    TimelineComponent,
  ],
  template: `
    @if (request(); as r) {
      <div class="space-y-4">
        <app-page-header
          [title]="r.code"
          [description]="typeMeta[r.type].label + ' · ' + userLabel()"
          [breadcrumb]="breadcrumbs()"
        >
          @if (r.status === 'pending') {
            <div page-actions class="flex gap-2">
              <app-button variant="secondary" (click)="cancel(r)">Huỷ đơn</app-button>
              <app-button variant="secondary" (click)="reject(r)">Từ chối</app-button>
              <app-button (click)="approve(r)">Duyệt</app-button>
            </div>
          }
        </app-page-header>

        <div class="grid gap-4 lg:grid-cols-[1fr_360px]">
          <div class="space-y-4">
            <app-card padding="lg">
              <div class="mb-3 flex items-center justify-between">
                <h3 class="text-sm font-semibold text-slate-700">Thông tin đơn</h3>
                <span
                  class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium"
                  [class]="statusMeta[r.status].badgeClass"
                >
                  {{ statusMeta[r.status].label }}
                </span>
              </div>
              <app-description-list [items]="infoItems()" [columns]="2" />
            </app-card>

            <app-card padding="lg">
              <h3 class="mb-2 text-sm font-semibold text-slate-700">Lý do</h3>
              <p class="whitespace-pre-line text-sm text-slate-700">{{ r.reason }}</p>
              @if (r.attachmentUrl) {
                <a
                  [href]="r.attachmentUrl"
                  target="_blank"
                  rel="noopener"
                  class="mt-3 inline-block text-sm text-indigo-600 hover:underline"
                >
                  Xem tệp đính kèm →
                </a>
              }
              @if (r.decisionNote) {
                <div class="mt-3 rounded-md bg-slate-50 p-3">
                  <p class="text-xs font-medium text-slate-500">Phản hồi từ quản lý</p>
                  <p class="mt-1 text-sm text-slate-700">{{ r.decisionNote }}</p>
                </div>
              }
            </app-card>
          </div>

          <div class="space-y-4">
            <app-card padding="lg">
              <h3 class="mb-3 text-sm font-semibold text-slate-700">Tiến trình</h3>
              <app-timeline [entries]="timeline()" />
            </app-card>
          </div>
        </div>
      </div>
    } @else {
      <app-card padding="lg">
        <p class="text-sm text-slate-500">Không tìm thấy đơn nghỉ phép.</p>
        <a routerLink="/hr/leave-requests" class="mt-2 inline-block text-sm text-indigo-600">
          ← Quay lại danh sách
        </a>
      </app-card>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeaveRequestDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(LeaveRequestStore);
  private readonly authStore = inject(AuthStore);
  private readonly tenantStore = inject(TenantStore);
  private readonly toast = inject(ToastService);
  private readonly confirmSvc = inject(ConfirmDialogService);

  protected readonly typeMeta = LEAVE_TYPE_META;
  protected readonly statusMeta = LEAVE_STATUS_META;

  private readonly idSignal = toSignal(this.route.paramMap, { requireSync: true });

  protected readonly request = computed<ILeaveRequest | null>(() => {
    const id = this.idSignal()?.get('id');
    if (!id) return null;
    // Track store changes for reactivity.
    void this.store.items();
    return this.store.findById(id) ?? null;
  });

  protected readonly userLabel = computed(() => {
    const r = this.request();
    if (!r) return '';
    const u = USERS.find((u) => u.id === r.userId);
    return u?.fullName ?? r.userId;
  });

  protected readonly tenantLabel = computed(() => {
    const r = this.request();
    if (!r) return '';
    return this.tenantStore.tenants().find((t) => t.id === r.tenantId)?.name ?? r.tenantId;
  });

  protected readonly breadcrumbs = computed(() => [
    { label: 'Nhân sự', to: '/hr/attendance' },
    { label: 'Đơn nghỉ phép', to: '/hr/leave-requests' },
    { label: this.request()?.code ?? '...' },
  ]);

  protected readonly infoItems = computed<DescriptionItem[]>(() => {
    const r = this.request();
    if (!r) return [];
    return [
      { label: 'Nhân viên', value: this.userLabel() },
      { label: 'Chi nhánh', value: this.tenantLabel() },
      { label: 'Loại nghỉ', value: LEAVE_TYPE_META[r.type].label },
      {
        label: 'Khoảng thời gian',
        value: r.halfDay
          ? `${this.fmtDate(r.fromDate)} (${r.halfDay === 'morning' ? 'sáng' : 'chiều'})`
          : `${this.fmtDate(r.fromDate)} → ${this.fmtDate(r.toDate)}`,
      },
      { label: 'Tạo lúc', value: this.fmtDateTime(r.requestedAt) },
      {
        label: 'Quyết định bởi',
        value: r.decidedBy
          ? (USERS.find((u) => u.id === r.decidedBy)?.fullName ?? r.decidedBy)
          : '—',
      },
    ];
  });

  protected readonly timeline = computed<TimelineEntry[]>(() => {
    const r = this.request();
    if (!r) return [];
    const entries: TimelineEntry[] = [
      {
        id: 'created',
        title: 'Tạo đơn',
        timestamp: r.requestedAt,
        description: `Bởi ${this.userLabel()}`,
        icon: LucideMessageCircle.icon,
        variant: 'primary',
      },
    ];
    if (r.status === 'approved' && r.decidedAt) {
      entries.push({
        id: 'approved',
        title: 'Đã duyệt',
        timestamp: r.decidedAt,
        description: USERS.find((u) => u.id === r.decidedBy)?.fullName,
        icon: LucideCheck.icon,
        variant: 'success',
      });
    } else if (r.status === 'rejected' && r.decidedAt) {
      entries.push({
        id: 'rejected',
        title: 'Từ chối',
        timestamp: r.decidedAt,
        description: r.decisionNote ?? undefined,
        icon: LucideXCircle.icon,
        variant: 'danger',
      });
    } else if (r.status === 'cancelled') {
      entries.push({
        id: 'cancelled',
        title: 'Đã huỷ',
        timestamp: r.requestedAt,
        icon: LucideX.icon,
        variant: 'neutral',
      });
    } else if (r.status === 'pending') {
      entries.push({
        id: 'pending',
        title: 'Đang chờ duyệt',
        timestamp: r.requestedAt,
        icon: LucideClock.icon,
        variant: 'warning',
      });
    }
    return entries;
  });

  protected async approve(r: ILeaveRequest): Promise<void> {
    const editorId = this.authStore.currentUser()?.id ?? 'system';
    await this.store.decide(r.id, true, editorId, null);
    this.toast.success(`Đã duyệt ${r.code}`);
  }

  protected async reject(r: ILeaveRequest): Promise<void> {
    const ok = await this.confirmSvc.confirm({
      title: 'Từ chối đơn',
      message: `Từ chối đơn ${r.code} của ${this.userLabel()}?`,
      confirmText: 'Từ chối',
      variant: 'danger',
    });
    if (!ok) return;
    const editorId = this.authStore.currentUser()?.id ?? 'system';
    await this.store.decide(r.id, false, editorId, 'Từ chối từ trang chi tiết');
    this.toast.warning(`Đã từ chối ${r.code}`);
  }

  protected async cancel(r: ILeaveRequest): Promise<void> {
    const ok = await this.confirmSvc.confirm({
      title: 'Huỷ đơn',
      message: `Bạn muốn huỷ đơn ${r.code}?`,
      confirmText: 'Huỷ đơn',
      variant: 'danger',
    });
    if (!ok) return;
    await this.store.cancel(r.id);
    this.toast.info(`Đã huỷ đơn ${r.code}`);
    void this.router.navigate(['/hr/leave-requests']);
  }

  private fmtDate(iso: string): string {
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  }

  private fmtDateTime(iso: string): string {
    const d = new Date(iso);
    return `${this.fmtDate(d.toISOString().split('T')[0])} ${d.getHours().toString().padStart(2, '0')}:${d
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;
  }
}
