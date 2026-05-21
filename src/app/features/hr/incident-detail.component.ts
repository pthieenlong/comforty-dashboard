import { Dialog } from '@angular/cdk/dialog';
import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  LucideTriangleAlert,
  LucideCheck,
  LucideMessageCircle,
  LucideShieldAlert,
  LucideUserPlus,
  LucideX,
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
  SelectComponent,
  type SelectOption,
  TextareaComponent,
  TimelineComponent,
  type TimelineEntry,
  ToastService,
} from '@/shared/ui';
import { openIncidentEscalateDialog } from './incident-escalate-dialog.component';
import { openIncidentResolveDialog } from './incident-resolve-dialog.component';
import { IncidentStore } from './incident.store';
import {
  INCIDENT_SEVERITY_META,
  INCIDENT_STATUS_META,
  INCIDENT_TYPE_META,
  type IIncident,
  type IncidentSeverity,
  type IncidentStatus,
} from './incident.types';

const SEVERITY_OPTIONS: SelectOption<IncidentSeverity>[] = (
  Object.keys(INCIDENT_SEVERITY_META) as IncidentSeverity[]
).map((v) => ({ value: v, label: INCIDENT_SEVERITY_META[v].label }));

@Component({
  selector: 'app-incident-detail',
  imports: [
    ButtonComponent,
    CardComponent,
    DatePipe,
    DescriptionListComponent,
    FormsModule,
    PageHeaderComponent,
    RouterLink,
    SelectComponent,
    TextareaComponent,
    TimelineComponent,
  ],
  template: `
    @if (incident(); as i) {
      <div class="space-y-4">
        <app-page-header [title]="i.code" [description]="i.title" [breadcrumb]="breadcrumbs()">
          <div page-actions class="flex flex-wrap items-center gap-2">
            @for (a of stateActions(); track a.kind) {
              <app-button [variant]="a.variant" (click)="runAction(a.kind, i)">
                {{ a.label }}
              </app-button>
            }
          </div>
        </app-page-header>

        <div class="grid gap-4 lg:grid-cols-[1fr_360px]">
          <div class="space-y-4">
            <app-card padding="lg">
              <div class="mb-3 flex items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  <span
                    class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium"
                    [class]="statusBadge(i)"
                  >
                    {{ statusLabel(i) }}
                  </span>
                  <span
                    class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium"
                    [class]="typeBadge(i)"
                  >
                    {{ typeLabel(i) }}
                  </span>
                  <span class="inline-flex items-center gap-1.5 text-xs">
                    <span class="h-2 w-2 rounded-full" [class]="severityDot(i)"></span>
                    {{ severityLabel(i) }}
                  </span>
                  @if (i.escalationLevel > 1) {
                    <span
                      class="inline-flex items-center gap-1 rounded-md bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700"
                    >
                      Escalate cấp {{ i.escalationLevel }}
                    </span>
                  }
                </div>
              </div>
              <h3 class="mb-2 text-sm font-semibold text-slate-700">Mô tả</h3>
              <p class="whitespace-pre-line text-sm text-slate-700">{{ i.description }}</p>

              @if (i.attachments.length > 0) {
                <div class="mt-4">
                  <h4 class="mb-2 text-xs font-medium uppercase text-slate-500">Ảnh hiện trường</h4>
                  <div class="grid grid-cols-3 gap-2 md:grid-cols-4">
                    @for (a of i.attachments; track a) {
                      <a [href]="a" target="_blank" rel="noopener">
                        <img
                          [src]="a"
                          alt="Hiện trường"
                          class="h-24 w-full rounded-md border border-slate-200 object-cover"
                        />
                      </a>
                    }
                  </div>
                </div>
              }

              @if (i.resolutionNote) {
                <div class="mt-4 rounded-md border border-emerald-200 bg-emerald-50 p-3">
                  <p class="text-xs font-medium text-emerald-700">Kết luận xử lý</p>
                  <p class="mt-1 text-sm text-emerald-900">{{ i.resolutionNote }}</p>
                  @if (i.resolvedAt) {
                    <p class="mt-1 text-xs text-emerald-700">
                      Bởi {{ resolverName() }} · {{ i.resolvedAt | date: 'dd/MM/yy HH:mm' }}
                    </p>
                  }
                </div>
              }
            </app-card>

            <app-card padding="lg">
              <h3 class="mb-3 text-sm font-semibold text-slate-700">
                Thảo luận ({{ i.comments.length }})
              </h3>

              <div class="space-y-2.5">
                @for (c of i.comments; track c.id) {
                  <div class="rounded-md border border-slate-200 bg-slate-50 p-3">
                    <div class="mb-1 flex items-center justify-between text-xs">
                      <span class="font-medium text-slate-700">{{
                        commentAuthor(c.authorId)
                      }}</span>
                      <span class="text-slate-500">{{ c.createdAt | date: 'dd/MM HH:mm' }}</span>
                    </div>
                    <p class="text-sm text-slate-700">{{ c.body }}</p>
                  </div>
                } @empty {
                  <p class="text-sm text-slate-400">Chưa có bình luận.</p>
                }
              </div>

              <div class="mt-3 space-y-2 border-t border-slate-200 pt-3">
                <app-textarea
                  id="inc-comment"
                  placeholder="Thêm cập nhật..."
                  [rows]="3"
                  [(ngModel)]="commentBody"
                />
                <div class="flex justify-end">
                  <app-button
                    size="sm"
                    [disabled]="commentBody().trim().length < 2"
                    (click)="postComment(i)"
                  >
                    Gửi
                  </app-button>
                </div>
              </div>
            </app-card>
          </div>

          <div class="space-y-4">
            <app-card padding="lg">
              <h3 class="mb-3 text-sm font-semibold text-slate-700">Thông tin</h3>
              <app-description-list [items]="infoItems()" [columns]="1" />
            </app-card>

            <app-card padding="lg">
              <h3 class="mb-2 text-sm font-semibold text-slate-700">Người phụ trách</h3>
              <app-select
                id="inc-assignee"
                [options]="assigneeOptions()"
                [ngModel]="i.assigneeId"
                (ngModelChange)="onAssigneeChange($event, i)"
              />
            </app-card>

            <app-card padding="lg">
              <h3 class="mb-2 text-sm font-semibold text-slate-700">Mức độ</h3>
              <app-select
                id="inc-severity-edit"
                [options]="severityOptions"
                [ngModel]="i.severity"
                (ngModelChange)="onSeverityChange($event, i)"
              />
            </app-card>

            <app-card padding="lg">
              <h3 class="mb-3 text-sm font-semibold text-slate-700">Lịch sử</h3>
              <app-timeline [entries]="timeline()" />
            </app-card>
          </div>
        </div>
      </div>
    } @else {
      <app-card padding="lg">
        <p class="text-sm text-slate-500">Không tìm thấy sự cố.</p>
        <a routerLink="/hr/incidents" class="mt-2 inline-block text-sm text-indigo-600">
          ← Quay lại danh sách
        </a>
      </app-card>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncidentDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(IncidentStore);
  private readonly authStore = inject(AuthStore);
  private readonly tenantStore = inject(TenantStore);
  private readonly toast = inject(ToastService);
  private readonly confirmSvc = inject(ConfirmDialogService);
  private readonly dialog = inject(Dialog);

  protected readonly severityOptions = SEVERITY_OPTIONS;
  protected readonly commentBody = signal<string>('');

  private readonly idSignal = toSignal(this.route.paramMap, { requireSync: true });

  protected readonly incident = computed<IIncident | null>(() => {
    const id = this.idSignal()?.get('id');
    if (!id) return null;
    void this.store.items();
    return this.store.findById(id) ?? null;
  });

  protected readonly breadcrumbs = computed(() => [
    { label: 'Nhân sự', to: '/hr/attendance' },
    { label: 'Sự cố', to: '/hr/incidents' },
    { label: this.incident()?.code ?? '...' },
  ]);

  protected readonly assigneeOptions = computed<SelectOption<string>[]>(() => {
    const tenantId = this.incident()?.tenantId;
    return USERS.filter((u) =>
      u.assignments.some((a) => a.tenantId === tenantId || a.tenantId === 'tenant-hq'),
    ).map((u) => ({ value: u.id, label: u.fullName }));
  });

  protected readonly resolverName = computed(() => {
    const i = this.incident();
    if (!i?.resolvedBy) return '';
    return USERS.find((u) => u.id === i.resolvedBy)?.fullName ?? i.resolvedBy;
  });

  protected readonly infoItems = computed<DescriptionItem[]>(() => {
    const i = this.incident();
    if (!i) return [];
    const tenant = this.tenantStore.tenants().find((t) => t.id === i.tenantId);
    const reporter = USERS.find((u) => u.id === i.reporterId);
    return [
      { label: 'Chi nhánh', value: tenant?.name ?? i.tenantId },
      { label: 'Vị trí', value: i.location ?? '—' },
      { label: 'Xảy ra lúc', value: this.fmtDateTime(i.occurredAt) },
      { label: 'Báo cáo bởi', value: reporter?.fullName ?? i.reporterId },
      { label: 'Cấp escalate', value: `Cấp ${i.escalationLevel}` },
      { label: 'Tạo lúc', value: this.fmtDateTime(i.createdAt) },
    ];
  });

  protected readonly stateActions = computed<
    {
      kind: IncidentStatus | 'escalate';
      label: string;
      variant: 'primary' | 'secondary' | 'danger';
    }[]
  >(() => {
    const i = this.incident();
    if (!i) return [];
    const out: {
      kind: IncidentStatus | 'escalate';
      label: string;
      variant: 'primary' | 'secondary' | 'danger';
    }[] = [];
    switch (i.status) {
      case 'reported':
        out.push({ kind: 'acknowledged', label: 'Ghi nhận', variant: 'primary' });
        out.push({ kind: 'cancelled', label: 'Huỷ báo cáo', variant: 'secondary' });
        break;
      case 'acknowledged':
        out.push({ kind: 'investigating', label: 'Bắt đầu điều tra', variant: 'primary' });
        out.push({ kind: 'cancelled', label: 'Huỷ', variant: 'secondary' });
        break;
      case 'investigating':
        out.push({ kind: 'resolved', label: 'Đánh dấu giải quyết', variant: 'primary' });
        break;
      case 'resolved':
        out.push({ kind: 'closed', label: 'Đóng', variant: 'primary' });
        break;
      default:
        break;
    }
    if (i.escalationLevel < 3 && i.status !== 'closed' && i.status !== 'cancelled') {
      out.push({ kind: 'escalate', label: 'Escalate', variant: 'secondary' });
    }
    return out;
  });

  protected readonly timeline = computed<TimelineEntry[]>(() => {
    const i = this.incident();
    if (!i) return [];
    const variantMap: Record<string, TimelineEntry['variant']> = {
      created: 'primary',
      acknowledged: 'info',
      investigating: 'warning',
      resolved: 'success',
      closed: 'neutral',
      cancelled: 'neutral',
      assigned: 'info',
      escalated: 'danger',
      severity_changed: 'warning',
      commented: 'neutral',
    };
    const iconMap: Record<string, TimelineEntry['icon']> = {
      created: LucideMessageCircle.icon,
      acknowledged: LucideCheck.icon,
      investigating: LucideTriangleAlert.icon,
      resolved: LucideCheck.icon,
      closed: LucideCheck.icon,
      cancelled: LucideX.icon,
      assigned: LucideUserPlus.icon,
      escalated: LucideShieldAlert.icon,
      severity_changed: LucideTriangleAlert.icon,
      commented: LucideMessageCircle.icon,
    };
    const titleMap: Record<string, string> = {
      created: 'Tạo báo cáo',
      acknowledged: 'Ghi nhận',
      investigating: 'Bắt đầu điều tra',
      resolved: 'Đánh dấu giải quyết',
      closed: 'Đóng',
      cancelled: 'Huỷ',
      assigned: 'Phân công',
      escalated: 'Escalate',
      severity_changed: 'Thay đổi mức độ',
      commented: 'Bình luận',
    };
    return i.events.map((e) => ({
      id: e.id,
      title: titleMap[e.kind] ?? e.kind,
      timestamp: e.occurredAt,
      description: `${this.actorName(e.actorId)}${e.note ? ' · ' + e.note : ''}`,
      icon: iconMap[e.kind],
      variant: variantMap[e.kind] ?? 'neutral',
    }));
  });

  protected commentAuthor(id: string): string {
    return USERS.find((u) => u.id === id)?.fullName ?? id;
  }

  protected actorName(id: string): string {
    return USERS.find((u) => u.id === id)?.fullName ?? id;
  }

  protected typeBadge(i: IIncident): string {
    return INCIDENT_TYPE_META[i.type].badgeClass;
  }
  protected typeLabel(i: IIncident): string {
    return INCIDENT_TYPE_META[i.type].label;
  }
  protected severityDot(i: IIncident): string {
    return INCIDENT_SEVERITY_META[i.severity].dotClass;
  }
  protected severityLabel(i: IIncident): string {
    return INCIDENT_SEVERITY_META[i.severity].label;
  }
  protected statusBadge(i: IIncident): string {
    return INCIDENT_STATUS_META[i.status].badgeClass;
  }
  protected statusLabel(i: IIncident): string {
    return INCIDENT_STATUS_META[i.status].label;
  }

  protected async runAction(kind: IncidentStatus | 'escalate', i: IIncident): Promise<void> {
    const actorId = this.authStore.currentUser()?.id ?? 'system';
    if (kind === 'escalate') {
      const result = await openIncidentEscalateDialog(this.dialog, i.code, i.escalationLevel);
      if (!result) return;
      await this.store.escalate(i.id, result.level, actorId, result.reason);
      this.toast.warning(`Đã escalate ${i.code} lên cấp ${result.level}`);
      return;
    }
    if (kind === 'resolved') {
      const result = await openIncidentResolveDialog(this.dialog, i.code);
      if (!result) return;
      await this.store.transition(i.id, 'resolved', actorId, result.note);
      this.toast.success(`Đã đánh dấu ${i.code} là đã giải quyết`);
      return;
    }
    if (kind === 'cancelled') {
      const ok = await this.confirmSvc.confirm({
        title: 'Huỷ báo cáo',
        message: `Huỷ báo cáo ${i.code}?`,
        confirmText: 'Huỷ báo cáo',
        variant: 'danger',
      });
      if (!ok) return;
    }
    await this.store.transition(i.id, kind, actorId);
    this.toast.info(`Đã cập nhật ${i.code}`);
  }

  protected async onAssigneeChange(value: string, i: IIncident): Promise<void> {
    if (value === i.assigneeId) return;
    const actorId = this.authStore.currentUser()?.id ?? 'system';
    await this.store.assign(i.id, value, actorId);
    this.toast.success('Đã phân công lại sự cố');
  }

  protected async onSeverityChange(value: IncidentSeverity, i: IIncident): Promise<void> {
    if (value === i.severity) return;
    const actorId = this.authStore.currentUser()?.id ?? 'system';
    await this.store.setSeverity(i.id, value, actorId);
    this.toast.info(`Mức độ → ${INCIDENT_SEVERITY_META[value].label}`);
  }

  protected async postComment(i: IIncident): Promise<void> {
    const body = this.commentBody().trim();
    if (body.length < 2) return;
    const actorId = this.authStore.currentUser()?.id ?? 'system';
    await this.store.addComment(i.id, actorId, body);
    this.commentBody.set('');
    this.toast.success('Đã thêm bình luận');
  }

  private fmtDateTime(iso: string): string {
    const d = new Date(iso);
    const pad = (n: number): string => n.toString().padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
}
