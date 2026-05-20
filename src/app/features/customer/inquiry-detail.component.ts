import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideArchive, LucideMessageSquare, LucideReply, LucideUser } from '@lucide/angular';
import {
  BadgeComponent,
  BreadcrumbComponent,
  ButtonComponent,
  CardComponent,
  ConfirmDialogService,
  DescriptionListComponent,
  type DescriptionItem,
  FormFieldComponent,
  IconComponent,
  SelectComponent,
  type SelectOption,
  TextareaComponent,
  ToastService,
} from '@/shared/ui';
import { AuthStore } from '@/core/auth/auth.store';
import { USERS } from '@/features/iam/iam.mock';
import { InquiryStore } from './inquiry.store';
import {
  INQUIRY_SOURCE_META,
  INQUIRY_STATUS_META,
  REPLY_CHANNEL_META,
  type IInquiry,
  type IInquiryReply,
  type InquiryStatus,
} from './inquiry.types';

const CHANNEL_OPTIONS: SelectOption<IInquiryReply['channel']>[] = (
  Object.entries(REPLY_CHANNEL_META) as [
    IInquiryReply['channel'],
    (typeof REPLY_CHANNEL_META)[IInquiryReply['channel']],
  ][]
).map(([value, meta]) => ({ value, label: meta.label }));

@Component({
  selector: 'app-inquiry-detail',
  imports: [
    BadgeComponent,
    BreadcrumbComponent,
    ButtonComponent,
    CardComponent,
    DatePipe,
    DescriptionListComponent,
    FormFieldComponent,
    FormsModule,
    IconComponent,
    RouterLink,
    SelectComponent,
    TextareaComponent,
  ],
  template: `
    @if (inquiry(); as i) {
      <div class="space-y-6">
        <app-breadcrumb [items]="breadcrumb()" />

        <app-card padding="lg">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div class="flex items-start gap-4 min-w-0">
              <span
                class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700"
              >
                <app-icon [icon]="messageIcon" size="lg" />
              </span>
              <div class="min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <h1 class="text-xl font-bold text-slate-900">{{ i.subject }}</h1>
                  <app-badge [variant]="statusVariant(i.status)" [dot]="true">
                    {{ statusLabel(i.status) }}
                  </app-badge>
                  <app-badge variant="neutral">{{ sourceLabel(i.source) }}</app-badge>
                </div>
                <p class="mt-1 text-xs text-slate-500">
                  <span class="font-mono">{{ i.code }}</span> · Gửi
                  {{ i.createdAt | date: 'dd/MM/yyyy HH:mm' }}
                </p>
              </div>
            </div>

            <div class="flex gap-2 shrink-0 flex-wrap justify-end">
              @if (i.status !== 'archived') {
                <app-button variant="secondary" (click)="onArchive()">
                  <app-icon [icon]="archiveIcon" size="md" />
                  Lưu trữ
                </app-button>
              } @else {
                <app-button variant="secondary" (click)="onUnarchive()">Mở lại</app-button>
              }
            </div>
          </div>
        </app-card>

        <div class="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <!-- LEFT: Original message + replies + compose -->
          <div class="space-y-4">
            <app-card padding="lg">
              <h2 class="text-sm font-semibold text-slate-700 mb-2">Nội dung yêu cầu</h2>
              <p class="text-sm text-slate-700 whitespace-pre-line">{{ i.message }}</p>
            </app-card>

            <app-card padding="lg">
              <h2 class="text-sm font-semibold text-slate-700 mb-3">
                Phản hồi ({{ i.replies.length }})
              </h2>

              @if (i.replies.length === 0) {
                <p class="py-6 text-center text-sm text-slate-500">
                  Chưa có phản hồi nào. Sử dụng form bên dưới để trả lời.
                </p>
              } @else {
                <ul class="space-y-3">
                  @for (r of i.replies; track r.id) {
                    <li [class]="replyClasses(r)">
                      <div class="flex items-baseline justify-between gap-2 mb-1">
                        <p class="text-sm font-medium text-slate-900">
                          {{ r.authorName }}
                          <app-badge
                            [variant]="r.channel === 'note' ? 'warning' : 'info'"
                            class="ml-1"
                          >
                            {{ channelLabel(r.channel) }}
                          </app-badge>
                        </p>
                        <p class="text-xs text-slate-500">
                          {{ r.occurredAt | date: 'dd/MM HH:mm' }}
                        </p>
                      </div>
                      <p class="text-sm text-slate-700 whitespace-pre-line">{{ r.body }}</p>
                    </li>
                  }
                </ul>
              }

              <div class="mt-4 border-t border-slate-100 pt-4 space-y-3">
                <app-form-field for="rp-channel" label="Kênh phản hồi">
                  <app-select
                    id="rp-channel"
                    [options]="channelOptions"
                    [ngModel]="replyChannel()"
                    (ngModelChange)="replyChannel.set($event)"
                  />
                </app-form-field>
                <app-form-field for="rp-body" label="Nội dung" [required]="true">
                  <app-textarea
                    id="rp-body"
                    [ngModel]="replyBody()"
                    (ngModelChange)="replyBody.set($event)"
                    [rows]="4"
                    [placeholder]="
                      replyChannel() === 'note' ? 'Ghi chú nội bộ...' : 'Trả lời cho khách...'
                    "
                  />
                </app-form-field>
                <div class="flex justify-end">
                  <app-button
                    variant="primary"
                    [disabled]="replyBody().trim().length === 0 || saving()"
                    [loading]="saving()"
                    (click)="onSendReply()"
                  >
                    <app-icon [icon]="replyIcon" size="md" />
                    {{ replyChannel() === 'note' ? 'Lưu ghi chú' : 'Gửi phản hồi' }}
                  </app-button>
                </div>
              </div>
            </app-card>
          </div>

          <!-- RIGHT: sender info, assignee -->
          <div class="space-y-4">
            <app-card padding="lg">
              <div class="flex items-center gap-2 mb-3">
                <app-icon [icon]="userIcon" size="sm" />
                <h2 class="text-sm font-semibold text-slate-700">Người gửi</h2>
              </div>
              <p class="text-sm font-medium text-slate-900">{{ i.senderName }}</p>
              <p class="text-xs text-slate-500">{{ i.senderEmail }}</p>
              <p class="text-xs text-slate-500">{{ i.senderPhone }}</p>
              @if (i.matchedCustomerId) {
                <a
                  [routerLink]="['/customers', i.matchedCustomerId]"
                  class="mt-3 inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700"
                >
                  → Xem hồ sơ khách hàng
                </a>
              } @else {
                <p class="mt-3 text-xs text-slate-400 italic">Chưa có tài khoản khách hàng</p>
              }
            </app-card>

            <app-card padding="lg">
              <h2 class="text-sm font-semibold text-slate-700 mb-3">Phụ trách</h2>
              @if (i.assigneeName) {
                <p class="text-sm font-medium text-slate-900">{{ i.assigneeName }}</p>
              } @else {
                <p class="text-sm text-slate-500 italic">Chưa được giao</p>
              }
              <div class="mt-3">
                <app-select
                  id="iq-assignee"
                  [options]="assigneeOptions"
                  [ngModel]="i.assigneeId ?? ''"
                  (ngModelChange)="onAssign($event)"
                  [searchable]="true"
                  placeholder="Chọn nhân viên"
                />
              </div>
            </app-card>

            <app-card padding="lg">
              <h2 class="text-sm font-semibold text-slate-700 mb-3">Thông tin</h2>
              <app-description-list [items]="infoItems()" [columns]="1" />
            </app-card>
          </div>
        </div>
      </div>
    } @else {
      <div class="rounded-lg border border-slate-200 bg-white p-8 text-center">
        <h2 class="text-lg font-semibold text-slate-900">Không tìm thấy yêu cầu liên hệ</h2>
        <a routerLink="/crm/inquiries" class="mt-4 inline-block">
          <app-button variant="primary">Quay lại danh sách</app-button>
        </a>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InquiryDetailComponent {
  private readonly inquiryStore = inject(InquiryStore);
  private readonly authStore = inject(AuthStore);
  private readonly toast = inject(ToastService);
  private readonly confirmDialog = inject(ConfirmDialogService);

  readonly id = input.required<string>();

  protected readonly messageIcon = LucideMessageSquare.icon;
  protected readonly archiveIcon = LucideArchive.icon;
  protected readonly replyIcon = LucideReply.icon;
  protected readonly userIcon = LucideUser.icon;

  protected readonly channelOptions = CHANNEL_OPTIONS;

  protected readonly assigneeOptions: SelectOption<string>[] = [
    { value: '', label: 'Bỏ assign' },
    ...USERS.filter((u) => u.assignments.some((a) => a.tenantId === 't-hq')).map((u) => ({
      value: u.id,
      label: u.fullName,
    })),
  ];

  protected readonly replyBody = signal<string>('');
  protected readonly replyChannel = signal<IInquiryReply['channel']>('email');

  protected readonly inquiry = computed(() => this.inquiryStore.findById(this.id()));
  protected readonly saving = this.inquiryStore.saving;

  protected readonly breadcrumb = computed(() => [
    { label: 'Trang chủ', to: '/dashboard' },
    { label: 'CRM' },
    { label: 'Liên hệ', to: '/crm/inquiries' },
    { label: this.inquiry()?.code ?? this.id() },
  ]);

  protected readonly infoItems = computed<DescriptionItem[]>(() => {
    const i = this.inquiry();
    if (!i) return [];
    return [
      { label: 'Mã', value: i.code },
      { label: 'Nguồn', value: INQUIRY_SOURCE_META[i.source].label },
      { label: 'Trạng thái', value: INQUIRY_STATUS_META[i.status].label },
      { label: 'Gửi lúc', value: new Date(i.createdAt).toLocaleString('vi-VN') },
      {
        label: 'Phản hồi cuối',
        value: i.repliedAt ? new Date(i.repliedAt).toLocaleString('vi-VN') : '—',
      },
      { label: 'Cập nhật', value: new Date(i.updatedAt).toLocaleString('vi-VN') },
    ];
  });

  protected statusLabel(s: InquiryStatus): string {
    return INQUIRY_STATUS_META[s].label;
  }

  protected statusVariant(s: InquiryStatus) {
    return INQUIRY_STATUS_META[s].badgeVariant;
  }

  protected sourceLabel(s: IInquiry['source']): string {
    return INQUIRY_SOURCE_META[s].label;
  }

  protected channelLabel(c: IInquiryReply['channel']): string {
    return REPLY_CHANNEL_META[c].label;
  }

  protected replyClasses(r: IInquiryReply): string {
    const base = 'rounded-md border px-3 py-2.5';
    if (r.channel === 'note') return `${base} border-amber-200 bg-amber-50`;
    return `${base} border-indigo-100 bg-indigo-50`;
  }

  private actor(): { id: string; name: string } {
    const user = this.authStore.currentUser();
    return { id: user?.id ?? 'me', name: user?.fullName ?? 'Bạn' };
  }

  protected async onAssign(userId: string): Promise<void> {
    const i = this.inquiry();
    if (!i) return;
    const trimmed = userId || null;
    if (trimmed === i.assigneeId) return;
    const user = trimmed ? USERS.find((u) => u.id === trimmed) : null;
    await this.inquiryStore.assign(this.id(), user ? { id: user.id, name: user.fullName } : null);
    this.toast.success(user ? `Đã giao cho ${user.fullName}` : 'Đã bỏ assign');
  }

  protected async onArchive(): Promise<void> {
    const ok = await this.confirmDialog.confirm({
      title: 'Lưu trữ yêu cầu',
      message: 'Yêu cầu sẽ ẩn khỏi inbox mặc định. Bạn có chắc?',
      confirmText: 'Lưu trữ',
      variant: 'danger',
    });
    if (!ok) return;
    await this.inquiryStore.setStatus(this.id(), 'archived');
    this.toast.success('Đã lưu trữ');
  }

  protected async onUnarchive(): Promise<void> {
    await this.inquiryStore.setStatus(this.id(), 'new');
    this.toast.success('Đã mở lại');
  }

  protected async onSendReply(): Promise<void> {
    const body = this.replyBody().trim();
    if (!body) return;
    const author = this.actor();
    await this.inquiryStore.addReply(this.id(), {
      authorId: author.id,
      authorName: author.name,
      body,
      channel: this.replyChannel(),
    });
    this.replyBody.set('');
    this.toast.success(this.replyChannel() === 'note' ? 'Đã lưu ghi chú' : 'Đã gửi phản hồi');
  }
}
