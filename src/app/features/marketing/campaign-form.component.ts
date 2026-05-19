import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideArrowLeft, LucideSave } from '@lucide/angular';
import {
  BreadcrumbComponent,
  ButtonComponent,
  CardComponent,
  DatePickerComponent,
  FormFieldComponent,
  IconComponent,
  InputComponent,
  MultiSelectComponent,
  type SelectOption,
  TextareaComponent,
  ToastService,
} from '@/shared/ui';
import { MOCK_TENANTS } from '@/core/tenant/tenant.mock';
import { CampaignStore } from './campaign.store';
import { CAMPAIGN_CHANNEL_META, type CampaignChannel, type ICampaign } from './marketing.types';

const CHANNEL_OPTIONS: SelectOption<CampaignChannel>[] = (
  Object.entries(CAMPAIGN_CHANNEL_META) as [
    CampaignChannel,
    (typeof CAMPAIGN_CHANNEL_META)[CampaignChannel],
  ][]
).map(([value, meta]) => ({ value, label: meta.label }));

const TENANT_OPTIONS: SelectOption<string>[] = MOCK_TENANTS.map((t) => ({
  value: t.id,
  label: t.name,
}));

type BannerMode = 'upload' | 'url';

@Component({
  selector: 'app-campaign-form',
  imports: [
    BreadcrumbComponent,
    ButtonComponent,
    CardComponent,
    DatePickerComponent,
    FormFieldComponent,
    FormsModule,
    IconComponent,
    InputComponent,
    MultiSelectComponent,
    RouterLink,
    TextareaComponent,
  ],
  template: `
    <div class="space-y-6">
      <div>
        <app-breadcrumb [items]="breadcrumb()" />
        <h1 class="mt-2 text-2xl font-bold text-slate-900">{{ pageTitle() }}</h1>
        <p class="mt-1 text-sm text-slate-500">
          Khai báo thông tin chiến dịch, banner và phạm vi áp dụng.
        </p>
      </div>

      <app-card padding="lg">
        <div class="grid gap-4 sm:grid-cols-2">
          <app-form-field for="cf-name" label="Tên chiến dịch" [required]="true">
            <app-input
              id="cf-name"
              [ngModel]="name()"
              (ngModelChange)="name.set($event)"
              placeholder="VD: Tết 2026"
            />
          </app-form-field>

          <app-form-field for="cf-code" label="Mã chiến dịch" [required]="true">
            <app-input
              id="cf-code"
              [ngModel]="code()"
              (ngModelChange)="code.set($event.toUpperCase())"
              placeholder="VD: TET2026"
            />
          </app-form-field>

          <app-form-field for="cf-start" label="Bắt đầu" [required]="true">
            <app-date-picker
              id="cf-start"
              [ngModel]="startAt()"
              (ngModelChange)="startAt.set($event)"
            />
          </app-form-field>

          <app-form-field for="cf-end" label="Kết thúc" [required]="true">
            <app-date-picker
              id="cf-end"
              [ngModel]="endAt()"
              (ngModelChange)="endAt.set($event)"
              [min]="startAt()"
            />
          </app-form-field>

          <app-form-field for="cf-channels" label="Kênh áp dụng">
            <app-multi-select
              id="cf-channels"
              [options]="channelOptions"
              [ngModel]="channels()"
              (ngModelChange)="channels.set($event)"
              placeholder="Chọn kênh"
            />
          </app-form-field>

          <app-form-field
            for="cf-tenants"
            label="Phạm vi chi nhánh"
            helpText="Để trống nếu áp dụng toàn hệ thống"
          >
            <app-multi-select
              id="cf-tenants"
              [options]="tenantOptions"
              [ngModel]="tenantIds()"
              (ngModelChange)="tenantIds.set($event)"
              [searchable]="true"
              placeholder="Toàn hệ thống"
            />
          </app-form-field>

          <div class="sm:col-span-2">
            <app-form-field for="cf-desc" label="Mô tả">
              <app-textarea
                id="cf-desc"
                [ngModel]="description()"
                (ngModelChange)="description.set($event)"
                [rows]="3"
                placeholder="Mô tả mục tiêu, target khách hàng..."
              />
            </app-form-field>
          </div>
        </div>

        <div class="mt-6 border-t border-slate-100 pt-4 space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold text-slate-700">Banner</h3>
            <div
              role="radiogroup"
              aria-label="Nguồn banner"
              class="inline-flex rounded-md border border-slate-200 bg-slate-50 p-0.5 text-xs"
            >
              <button
                type="button"
                role="radio"
                [attr.aria-checked]="bannerMode() === 'upload'"
                [class]="modeBtn(bannerMode() === 'upload')"
                (click)="bannerMode.set('upload')"
              >
                Upload
              </button>
              <button
                type="button"
                role="radio"
                [attr.aria-checked]="bannerMode() === 'url'"
                [class]="modeBtn(bannerMode() === 'url')"
                (click)="bannerMode.set('url')"
              >
                Dán URL
              </button>
            </div>
          </div>

          @if (bannerMode() === 'upload') {
            <div
              class="rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500"
            >
              <p>Drop ảnh banner vào đây (kéo thả) hoặc click để chọn.</p>
              <p class="mt-1 text-xs">
                Mock mode — chưa có backend upload. Dùng tab 'Dán URL' để test preview.
              </p>
            </div>
          } @else {
            <app-form-field for="cf-banner-url" label="URL ảnh">
              <app-input
                id="cf-banner-url"
                [ngModel]="bannerUrl()"
                (ngModelChange)="bannerUrl.set($event)"
                placeholder="https://..."
              />
            </app-form-field>
            @if (bannerUrl()) {
              <div class="mt-2">
                <p class="text-xs uppercase text-slate-500 mb-1">Preview</p>
                <img
                  [src]="bannerUrl()"
                  alt="Banner preview"
                  class="w-full max-w-md rounded-md border border-slate-200 object-cover"
                />
              </div>
            }
          }
        </div>

        <div class="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
          <a routerLink="/marketing/campaigns">
            <app-button variant="secondary">
              <app-icon [icon]="backIcon" size="md" />
              Huỷ
            </app-button>
          </a>
          <app-button
            variant="primary"
            [disabled]="!canSubmit() || saving()"
            [loading]="saving()"
            (click)="onSave()"
          >
            <app-icon [icon]="saveIcon" size="md" />
            {{ isEditMode() ? 'Lưu thay đổi' : 'Tạo chiến dịch' }}
          </app-button>
        </div>
      </app-card>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampaignFormComponent {
  private readonly campaignStore = inject(CampaignStore);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly id = input<string | null>(null);

  protected readonly backIcon = LucideArrowLeft.icon;
  protected readonly saveIcon = LucideSave.icon;

  protected readonly channelOptions = CHANNEL_OPTIONS;
  protected readonly tenantOptions = TENANT_OPTIONS;

  protected readonly name = signal<string>('');
  protected readonly code = signal<string>('');
  protected readonly description = signal<string>('');
  protected readonly startAt = signal<string | null>(null);
  protected readonly endAt = signal<string | null>(null);
  protected readonly channels = signal<CampaignChannel[]>([]);
  protected readonly tenantIds = signal<string[]>([]);
  protected readonly bannerMode = signal<BannerMode>('url');
  protected readonly bannerUrl = signal<string>('');
  protected readonly saving = signal<boolean>(false);

  protected readonly isEditMode = computed(() => this.id() !== null);

  protected readonly pageTitle = computed(() =>
    this.isEditMode() ? `Chỉnh sửa chiến dịch` : `Tạo chiến dịch mới`,
  );

  protected readonly breadcrumb = computed(() => [
    { label: 'Trang chủ', to: '/dashboard' },
    { label: 'Marketing' },
    { label: 'Chiến dịch', to: '/marketing/campaigns' },
    { label: this.isEditMode() ? this.name() || 'Edit' : 'Tạo mới' },
  ]);

  protected readonly canSubmit = computed(
    () =>
      this.name().trim().length > 0 &&
      this.code().trim().length > 0 &&
      this.startAt() !== null &&
      this.endAt() !== null,
  );

  constructor() {
    effect(() => {
      const id = this.id();
      if (!id) return;
      const c = this.campaignStore.findById(id);
      if (!c) return;
      this.name.set(c.name);
      this.code.set(c.code);
      this.description.set(c.description);
      this.startAt.set(c.startAt.slice(0, 10));
      this.endAt.set(c.endAt.slice(0, 10));
      this.channels.set([...c.channels]);
      this.tenantIds.set([...c.tenantIds]);
      this.bannerUrl.set(c.bannerUrl ?? '');
      this.bannerMode.set(c.bannerUrl ? 'url' : 'url');
    });
  }

  protected modeBtn(active: boolean): string {
    const base = 'rounded px-3 py-1 transition';
    return active ? `${base} bg-white shadow-sm text-slate-900` : `${base} text-slate-500`;
  }

  protected async onSave(): Promise<void> {
    if (!this.canSubmit()) return;
    this.saving.set(true);
    try {
      const existing = this.id() ? this.campaignStore.findById(this.id() as string) : null;
      const id = existing?.id ?? `camp-local-${Date.now().toString(36)}`;
      const next: ICampaign = {
        id,
        code: this.code().trim(),
        name: this.name().trim(),
        description: this.description().trim(),
        bannerUrl: this.bannerUrl().trim() || null,
        channels: this.channels(),
        status: existing?.status ?? 'draft',
        startAt: new Date(this.startAt() as string).toISOString(),
        endAt: new Date(this.endAt() as string).toISOString(),
        tenantIds: this.tenantIds(),
        createdAt: existing?.createdAt ?? new Date().toISOString(),
        createdBy: existing?.createdBy ?? 'Bạn',
        promotionIds: existing?.promotionIds ?? [],
        voucherBatchIds: existing?.voucherBatchIds ?? [],
      };
      await this.campaignStore.upsert(next);
      this.toast.success(this.isEditMode() ? 'Đã lưu thay đổi' : 'Đã tạo chiến dịch');
      await this.router.navigate(['/marketing/campaigns', id]);
    } finally {
      this.saving.set(false);
    }
  }
}
