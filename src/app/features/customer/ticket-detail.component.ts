import { Dialog } from '@angular/cdk/dialog';
import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  LucideAlertTriangle,
  LucideCheck,
  LucideMessageSquare,
  LucideUserPlus,
  LucideX,
} from '@lucide/angular';
import {
  BadgeComponent,
  BreadcrumbComponent,
  ButtonComponent,
  CardComponent,
  CheckboxComponent,
  ConfirmDialogService,
  DescriptionListComponent,
  type DescriptionItem,
  IconComponent,
  SelectComponent,
  type SelectOption,
  TextareaComponent,
  ToastService,
} from '@/shared/ui';
import { AuthStore } from '@/core/auth/auth.store';
import { USERS } from '@/features/iam/iam.mock';
import { MOCK_TENANTS } from '@/core/tenant/tenant.mock';
import { TicketStore } from './ticket.store';
import {
  ESCALATION_LEVEL_META,
  TICKET_PRIORITY_META,
  TICKET_STATUS_META,
  TICKET_TYPE_META,
  type ITicket,
  type ITicketComment,
  type TicketPriority,
  type TicketStatus,
} from './ticket.types';
import { openTicketEscalateDialog } from './ticket-escalate-dialog.component';

const PRIORITY_OPTIONS: SelectOption<TicketPriority>[] = (
  Object.entries(TICKET_PRIORITY_META) as [
    TicketPriority,
    (typeof TICKET_PRIORITY_META)[TicketPriority],
  ][]
).map(([value, meta]) => ({ value, label: meta.label }));

@Component({
  selector: 'app-ticket-detail',
  imports: [
    BadgeComponent,
    BreadcrumbComponent,
    ButtonComponent,
    CardComponent,
    CheckboxComponent,
    DatePipe,
    DescriptionListComponent,
    FormsModule,
    IconComponent,
    RouterLink,
    SelectComponent,
    TextareaComponent,
  ],
  template: `
    @if (ticket(); as t) {
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
                  <h1 class="text-xl font-bold text-slate-900 truncate">{{ t.subject }}</h1>
                  <app-badge [variant]="statusVariant(t.status)" [dot]="true">
                    {{ statusLabel(t.status) }}
                  </app-badge>
                  @if (t.escalationLevel > 1) {
                    <app-badge variant="warning">{{
                      escalationLabel(t.escalationLevel)
                    }}</app-badge>
                  }
                </div>
                <p class="mt-1 text-xs text-slate-500">
                  <span class="font-mono">{{ t.code }}</span> · {{ typeLabel(t.type) }} · Tạo
                  {{ t.createdAt | date: 'dd/MM/yyyy HH:mm' }} bởi {{ t.createdBy }}
                </p>
              </div>
            </div>

            <div class="flex gap-2 shrink-0 flex-wrap justify-end">
              @if (canEscalate(t)) {
                <app-button variant="secondary" (click)="onEscalate()">
                  <app-icon [icon]="warningIcon" size="md" />
                  Escalate
                </app-button>
              }
              @for (action of nextActions(); track action.next) {
                <app-button
                  [variant]="action.variant"
                  (click)="onTransition(action.next, action.note)"
                >
                  {{ action.label }}
                </app-button>
              }
            </div>
          </div>
        </app-card>

        <div class="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <!-- LEFT: Description + comment thread + reply box -->
          <div class="space-y-4">
            <app-card padding="lg">
              <h2 class="text-sm font-semibold text-slate-700 mb-2">Nội dung yêu cầu</h2>
              <p class="text-sm text-slate-700 whitespace-pre-line">{{ t.description }}</p>

              @if (t.items.length > 0) {
                <div class="mt-4 border-t border-slate-100 pt-3">
                  <p class="text-xs uppercase text-slate-500 mb-2">Sản phẩm liên quan</p>
                  <ul class="space-y-2">
                    @for (item of t.items; track item.orderItemId) {
                      <li class="rounded-md border border-slate-200 px-3 py-2 text-sm">
                        <p class="font-medium text-slate-900">{{ item.productName }}</p>
                        <p class="text-xs text-slate-500">
                          {{ item.variantLabel }} · {{ item.variantSku }} · SL
                          {{ item.quantity }}
                        </p>
                        @if (item.targetVariantSku) {
                          <p class="text-xs text-amber-700 mt-1">
                            Đổi sang: <span class="font-mono">{{ item.targetVariantSku }}</span>
                          </p>
                        }
                        @if (item.reason) {
                          <p class="text-xs text-slate-600 italic mt-1">Lý do: {{ item.reason }}</p>
                        }
                      </li>
                    }
                  </ul>
                </div>
              }
            </app-card>

            <app-card padding="lg">
              <div class="flex items-center justify-between mb-3">
                <h2 class="text-sm font-semibold text-slate-700">
                  Trao đổi ({{ visibleComments().length }})
                </h2>
                <span class="text-xs text-slate-500">
                  {{ t.comments.length - visibleComments().length }} note nội bộ
                </span>
              </div>

              @if (visibleComments().length === 0 && !showInternal()) {
                <p class="py-6 text-center text-sm text-slate-500">
                  Chưa có trao đổi nào. Bắt đầu reply bên dưới.
                </p>
              } @else {
                <ul class="space-y-3">
                  @for (c of visibleComments(); track c.id) {
                    <li [class]="commentClasses(c)">
                      <div class="flex items-baseline justify-between gap-2 mb-1">
                        <p class="text-sm font-medium" [class]="authorClasses(c)">
                          {{ c.authorName }}
                          @if (c.authorType === 'staff') {
                            <app-badge variant="info" class="ml-1">Staff</app-badge>
                          }
                          @if (c.internal) {
                            <app-badge variant="warning" class="ml-1">Nội bộ</app-badge>
                          }
                        </p>
                        <p class="text-xs text-slate-500">
                          {{ c.occurredAt | date: 'dd/MM HH:mm' }}
                        </p>
                      </div>
                      <p class="text-sm text-slate-700 whitespace-pre-line">{{ c.body }}</p>
                    </li>
                  }
                </ul>
              }

              <div class="mt-4 border-t border-slate-100 pt-4 space-y-2">
                <app-checkbox
                  id="cmt-internal"
                  [ngModel]="composeInternal()"
                  (ngModelChange)="composeInternal.set($event)"
                >
                  Ghi chú nội bộ (chỉ staff thấy)
                </app-checkbox>
                <app-textarea
                  id="cmt-body"
                  [ngModel]="composeBody()"
                  (ngModelChange)="composeBody.set($event)"
                  [rows]="3"
                  [placeholder]="composeInternal() ? 'Ghi chú nội bộ...' : 'Trả lời khách hàng...'"
                />
                <div class="flex justify-end">
                  <app-button
                    variant="primary"
                    [disabled]="composeBody().trim().length === 0 || saving()"
                    [loading]="saving()"
                    (click)="onSendComment()"
                  >
                    <app-icon [icon]="commentIcon" size="md" />
                    Gửi
                  </app-button>
                </div>
              </div>
            </app-card>
          </div>

          <!-- RIGHT: info, assignee, customer/order, events -->
          <div class="space-y-4">
            <app-card padding="lg">
              <h2 class="text-sm font-semibold text-slate-700 mb-3">Thông tin</h2>
              <app-description-list [items]="infoItems()" [columns]="1" />
            </app-card>

            <app-card padding="lg">
              <h2 class="text-sm font-semibold text-slate-700 mb-3">Phụ trách</h2>
              @if (t.assigneeName) {
                <p class="text-sm font-medium text-slate-900">{{ t.assigneeName }}</p>
                <p class="text-xs text-slate-500">{{ escalationLabel(t.escalationLevel) }}</p>
              } @else {
                <p class="text-sm text-slate-500 italic">Chưa được giao</p>
              }
              <div class="mt-3 space-y-2">
                <app-select
                  id="tk-assignee"
                  [options]="assigneeOptions()"
                  [ngModel]="t.assigneeId ?? ''"
                  (ngModelChange)="onAssign($event)"
                  [searchable]="true"
                  placeholder="Chọn nhân viên"
                />
                <app-select
                  id="tk-priority"
                  [options]="priorityOptions"
                  [ngModel]="t.priority"
                  (ngModelChange)="onPriorityChange($event)"
                />
              </div>
            </app-card>

            <app-card padding="lg">
              <h2 class="text-sm font-semibold text-slate-700 mb-2">Khách hàng</h2>
              <a
                [routerLink]="['/customers', t.customerId]"
                class="text-sm font-medium text-slate-900 hover:text-indigo-600"
              >
                {{ t.customerName }}
              </a>
              <p class="text-xs text-slate-500">{{ t.customerPhone }}</p>
              <p class="text-xs text-slate-500">{{ t.customerEmail }}</p>
              @if (t.orderCode) {
                <div class="mt-3 border-t border-slate-100 pt-3">
                  <p class="text-xs uppercase text-slate-500 mb-1">Đơn liên quan</p>
                  <a
                    [routerLink]="['/orders', t.orderId]"
                    class="font-mono text-sm text-slate-900 hover:text-indigo-600"
                  >
                    {{ t.orderCode }}
                  </a>
                </div>
              }
            </app-card>

            <app-card padding="lg">
              <h2 class="text-sm font-semibold text-slate-700 mb-3">Lịch sử</h2>
              <ol class="space-y-2.5">
                @for (e of sortedEvents(); track e.id) {
                  <li class="text-xs">
                    <p class="text-slate-700">
                      <span class="font-medium text-slate-900">{{ e.actor }}</span>
                      — {{ e.details }}
                    </p>
                    <p class="text-slate-400">{{ e.occurredAt | date: 'dd/MM HH:mm' }}</p>
                  </li>
                }
              </ol>
            </app-card>
          </div>
        </div>
      </div>
    } @else {
      <div class="rounded-lg border border-slate-200 bg-white p-8 text-center">
        <h2 class="text-lg font-semibold text-slate-900">Không tìm thấy ticket</h2>
        <a routerLink="/crm/tickets" class="mt-4 inline-block">
          <app-button variant="primary">Quay lại danh sách</app-button>
        </a>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketDetailComponent {
  private readonly ticketStore = inject(TicketStore);
  private readonly authStore = inject(AuthStore);
  private readonly toast = inject(ToastService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly dialog = inject(Dialog);

  readonly id = input.required<string>();

  protected readonly ticketIcon = LucideMessageSquare.icon;
  protected readonly warningIcon = LucideAlertTriangle.icon;
  protected readonly commentIcon = LucideMessageSquare.icon;
  protected readonly checkIcon = LucideCheck.icon;
  protected readonly cancelIcon = LucideX.icon;
  protected readonly assignIcon = LucideUserPlus.icon;

  protected readonly priorityOptions = PRIORITY_OPTIONS;

  protected readonly composeBody = signal<string>('');
  protected readonly composeInternal = signal<boolean>(false);
  protected readonly showInternal = signal<boolean>(true);

  protected readonly ticket = computed(() => this.ticketStore.findById(this.id()));
  protected readonly saving = this.ticketStore.saving;

  protected readonly breadcrumb = computed(() => [
    { label: 'Trang chủ', to: '/dashboard' },
    { label: 'CRM' },
    { label: 'Yêu cầu hỗ trợ', to: '/crm/tickets' },
    { label: this.ticket()?.code ?? this.id() },
  ]);

  protected readonly visibleComments = computed(() => {
    const t = this.ticket();
    if (!t) return [];
    if (this.showInternal()) return t.comments;
    return t.comments.filter((c) => !c.internal);
  });

  protected readonly sortedEvents = computed(() => {
    const t = this.ticket();
    if (!t) return [];
    return [...t.events].sort((a, b) => (a.occurredAt < b.occurredAt ? 1 : -1));
  });

  protected readonly assigneeOptions = computed<SelectOption<string>[]>(() => {
    const t = this.ticket();
    if (!t) return [];
    // Filter staff users with assignment to the ticket tenant or HQ.
    const candidates = USERS.filter((u) =>
      u.assignments.some((a) => a.tenantId === t.tenantId || a.tenantId === 't-hq'),
    );
    return [
      { value: '', label: 'Bỏ assign' },
      ...candidates.map((u) => ({ value: u.id, label: u.fullName })),
    ];
  });

  protected readonly infoItems = computed<DescriptionItem[]>(() => {
    const t = this.ticket();
    if (!t) return [];
    const tenant = MOCK_TENANTS.find((x) => x.id === t.tenantId)?.name ?? t.tenantId;
    return [
      { label: 'Loại', value: TICKET_TYPE_META[t.type].label },
      { label: 'Chi nhánh', value: tenant },
      { label: 'Ưu tiên', value: TICKET_PRIORITY_META[t.priority].label },
      { label: 'Cập nhật', value: new Date(t.updatedAt).toLocaleString('vi-VN') },
      {
        label: 'Đã xử lý',
        value: t.resolvedAt ? new Date(t.resolvedAt).toLocaleString('vi-VN') : '—',
      },
      {
        label: 'Đã đóng',
        value: t.closedAt ? new Date(t.closedAt).toLocaleString('vi-VN') : '—',
      },
    ];
  });

  protected readonly nextActions = computed<
    {
      next: TicketStatus;
      label: string;
      variant: 'primary' | 'secondary' | 'danger';
      note: string;
    }[]
  >(() => {
    const t = this.ticket();
    if (!t) return [];
    switch (t.status) {
      case 'open':
        return [
          { next: 'in_progress', label: 'Bắt đầu xử lý', variant: 'primary', note: 'Tiếp nhận' },
          { next: 'cancelled', label: 'Huỷ', variant: 'danger', note: 'Huỷ yêu cầu' },
        ];
      case 'in_progress':
        return [
          {
            next: 'pending_customer',
            label: 'Chờ khách',
            variant: 'secondary',
            note: 'Đợi khách phản hồi',
          },
          { next: 'resolved', label: 'Đã xử lý xong', variant: 'primary', note: 'Hoàn tất xử lý' },
        ];
      case 'pending_customer':
        return [
          {
            next: 'in_progress',
            label: 'Tiếp tục xử lý',
            variant: 'primary',
            note: 'Khách đã phản hồi',
          },
        ];
      case 'resolved':
        return [
          { next: 'closed', label: 'Đóng ticket', variant: 'primary', note: 'Khách xác nhận' },
          {
            next: 'in_progress',
            label: 'Mở lại',
            variant: 'secondary',
            note: 'Khách phản hồi vấn đề chưa xong',
          },
        ];
      default:
        return [];
    }
  });

  protected typeLabel = (t: ITicket['type']) => TICKET_TYPE_META[t].label;
  protected statusLabel = (s: TicketStatus) => TICKET_STATUS_META[s].label;
  protected statusVariant = (s: TicketStatus) => TICKET_STATUS_META[s].badgeVariant;
  protected escalationLabel = (l: 1 | 2 | 3) => ESCALATION_LEVEL_META[l].label;

  protected canEscalate(t: ITicket): boolean {
    return t.escalationLevel < 3 && ['open', 'in_progress', 'pending_customer'].includes(t.status);
  }

  protected commentClasses(c: ITicketComment): string {
    const base = 'rounded-md border px-3 py-2.5';
    if (c.internal) return `${base} border-amber-200 bg-amber-50`;
    if (c.authorType === 'staff') return `${base} border-indigo-100 bg-indigo-50`;
    return `${base} border-slate-200 bg-white`;
  }

  protected authorClasses(c: ITicketComment): string {
    if (c.internal) return 'text-amber-800';
    if (c.authorType === 'staff') return 'text-indigo-800';
    return 'text-slate-900';
  }

  private actor(): string {
    return this.authStore.currentUser()?.fullName ?? 'Bạn';
  }

  protected async onTransition(next: TicketStatus, note: string): Promise<void> {
    if (next === 'cancelled') {
      const ok = await this.confirmDialog.confirm({
        title: 'Huỷ ticket',
        message: 'Ticket sẽ bị huỷ và không thể tiếp tục xử lý. Bạn có chắc?',
        confirmText: 'Huỷ ticket',
        variant: 'danger',
      });
      if (!ok) return;
    }
    await this.ticketStore.transition(this.id(), next, this.actor(), note);
    this.toast.success(`Đã chuyển sang "${TICKET_STATUS_META[next].label}"`);
  }

  protected async onAssign(userId: string): Promise<void> {
    const t = this.ticket();
    if (!t) return;
    const trimmed = userId || null;
    if (trimmed === t.assigneeId) return;
    const user = trimmed ? USERS.find((u) => u.id === trimmed) : null;
    await this.ticketStore.assign(
      this.id(),
      user ? { id: user.id, name: user.fullName } : null,
      this.actor(),
    );
    this.toast.success(user ? `Đã giao cho ${user.fullName}` : 'Đã bỏ assign');
  }

  protected async onPriorityChange(p: TicketPriority): Promise<void> {
    const t = this.ticket();
    if (!t || t.priority === p) return;
    await this.ticketStore.setPriority(this.id(), p, this.actor());
    this.toast.success('Đã cập nhật ưu tiên');
  }

  protected async onSendComment(): Promise<void> {
    const body = this.composeBody().trim();
    if (!body) return;
    const user = this.authStore.currentUser();
    await this.ticketStore.addComment(this.id(), {
      authorId: user?.id ?? 'me',
      authorName: user?.fullName ?? 'Bạn',
      authorType: 'staff',
      body,
      internal: this.composeInternal(),
    });
    this.composeBody.set('');
    this.composeInternal.set(false);
    this.toast.success('Đã gửi');
  }

  protected async onEscalate(): Promise<void> {
    const t = this.ticket();
    if (!t) return;
    const result = await openTicketEscalateDialog(this.dialog, {
      ticketCode: t.code,
      currentLevel: t.escalationLevel,
    });
    if (!result) return;
    await this.ticketStore.escalate(this.id(), result.level, this.actor(), result.reason);
    this.toast.success(`Đã escalate lên cấp ${result.level}`);
  }
}
