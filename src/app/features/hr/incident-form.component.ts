import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '@/core/auth/auth.store';
import { TenantStore } from '@/core/tenant/tenant.store';
import {
  ButtonComponent,
  CardComponent,
  DatePickerComponent,
  FormFieldComponent,
  ImageUploadGridComponent,
  InputComponent,
  PageHeaderComponent,
  SelectComponent,
  type SelectOption,
  TextareaComponent,
  ToastService,
  type UploadedImage,
} from '@/shared/ui';
import { IncidentStore } from './incident.store';
import {
  INCIDENT_SEVERITY_META,
  INCIDENT_TYPE_META,
  type IIncident,
  type IncidentSeverity,
  type IncidentType,
} from './incident.types';

const TYPE_OPTIONS: SelectOption<IncidentType>[] = (
  Object.keys(INCIDENT_TYPE_META) as IncidentType[]
).map((v) => ({ value: v, label: INCIDENT_TYPE_META[v].label }));

const SEVERITY_OPTIONS: SelectOption<IncidentSeverity>[] = (
  Object.keys(INCIDENT_SEVERITY_META) as IncidentSeverity[]
).map((v) => ({ value: v, label: INCIDENT_SEVERITY_META[v].label }));

@Component({
  selector: 'app-incident-form',
  imports: [
    ButtonComponent,
    CardComponent,
    DatePickerComponent,
    FormFieldComponent,
    FormsModule,
    ImageUploadGridComponent,
    InputComponent,
    PageHeaderComponent,
    RouterLink,
    SelectComponent,
    TextareaComponent,
  ],
  template: `
    <div class="space-y-4">
      <app-page-header
        title="Báo cáo sự cố"
        description="Ghi nhận sự cố vận hành xảy ra tại cửa hàng."
        [breadcrumb]="breadcrumbs"
      />

      <app-card padding="lg" class="block max-w-3xl">
        <form class="space-y-4" (ngSubmit)="submit()">
          <div class="grid gap-3 md:grid-cols-2">
            <app-form-field label="Loại sự cố" for="inc-type" [required]="true">
              <app-select id="inc-type" [options]="typeOptions" [(ngModel)]="type" name="type" />
            </app-form-field>
            <app-form-field label="Mức độ" for="inc-severity" [required]="true">
              <app-select
                id="inc-severity"
                [options]="severityOptions"
                [(ngModel)]="severity"
                name="severity"
              />
            </app-form-field>
          </div>

          <app-form-field label="Tiêu đề" for="inc-title" [required]="true">
            <app-input
              id="inc-title"
              placeholder="Ngắn gọn về sự cố"
              [(ngModel)]="title"
              name="title"
            />
          </app-form-field>

          <app-form-field label="Mô tả chi tiết" for="inc-desc" [required]="true">
            <app-textarea
              id="inc-desc"
              placeholder="Diễn biến, ai liên quan, đã xử lý ngay tại chỗ chưa..."
              [rows]="5"
              [(ngModel)]="description"
              name="description"
            />
          </app-form-field>

          <div class="grid gap-3 md:grid-cols-2">
            <app-form-field label="Thời gian xảy ra" for="inc-occurred" [required]="true">
              <app-date-picker id="inc-occurred" [(ngModel)]="occurredDate" name="occurredDate" />
            </app-form-field>
            <app-form-field label="Vị trí (tuỳ chọn)" for="inc-location">
              <app-input
                id="inc-location"
                placeholder="VD: Quầy thu ngân 2, Khu thử đồ..."
                [(ngModel)]="location"
                name="location"
              />
            </app-form-field>
          </div>

          <app-form-field label="Ảnh hiện trường (tuỳ chọn)" for="inc-photos">
            <app-image-upload-grid
              id="inc-photos"
              [ngModel]="photos()"
              (ngModelChange)="photos.set($event)"
              name="photos"
            />
          </app-form-field>

          <div class="flex justify-end gap-2 border-t border-slate-200 pt-4">
            <a routerLink="/hr/incidents" class="text-sm text-slate-600 hover:underline">Huỷ</a>
            <app-button type="submit" [disabled]="!canSubmit()">Gửi báo cáo</app-button>
          </div>
        </form>
      </app-card>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncidentFormComponent {
  private readonly store = inject(IncidentStore);
  private readonly authStore = inject(AuthStore);
  private readonly tenantStore = inject(TenantStore);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly breadcrumbs = [
    { label: 'Nhân sự', to: '/hr/attendance' },
    { label: 'Sự cố', to: '/hr/incidents' },
    { label: 'Báo cáo mới' },
  ];

  protected readonly typeOptions = TYPE_OPTIONS;
  protected readonly severityOptions = SEVERITY_OPTIONS;

  protected readonly type = signal<IncidentType>('equipment_failure');
  protected readonly severity = signal<IncidentSeverity>('medium');
  protected readonly title = signal<string>('');
  protected readonly description = signal<string>('');
  protected readonly occurredDate = signal<string | null>(new Date().toISOString().split('T')[0]);
  protected readonly location = signal<string>('');
  protected readonly photos = signal<UploadedImage[]>([]);

  protected readonly canSubmit = computed(
    () => this.title().trim().length > 3 && this.description().trim().length > 5,
  );

  protected async submit(): Promise<void> {
    if (!this.canSubmit()) return;
    const user = this.authStore.currentUser();
    if (!user) return;
    const tenant = this.tenantStore.currentTenant();
    const now = new Date().toISOString();
    const occurredDate = this.occurredDate();
    const occurredIso = occurredDate ? new Date(occurredDate).toISOString() : now;
    const incident: IIncident = {
      id: `inc-new-${Date.now()}`,
      code: this.store.nextCode(),
      tenantId: tenant?.id ?? 'tenant-hq',
      type: this.type(),
      severity: this.severity(),
      status: 'reported',
      title: this.title().trim(),
      description: this.description().trim(),
      occurredAt: occurredIso,
      location: this.location().trim() || null,
      reporterId: user.id,
      assigneeId: null,
      escalationLevel: this.severity() === 'critical' ? 2 : 1,
      attachments: this.photos().map((p) => p.url),
      resolutionNote: null,
      resolvedAt: null,
      resolvedBy: null,
      createdAt: now,
      updatedAt: now,
      comments: [],
      events: [
        {
          id: `evt-${Date.now()}`,
          occurredAt: now,
          actorId: user.id,
          kind: 'created',
        },
      ],
    };
    await this.store.createIncident(incident);
    this.toast.success(`Đã gửi báo cáo ${incident.code}`);
    void this.router.navigate(['/hr/incidents', incident.id]);
  }
}
