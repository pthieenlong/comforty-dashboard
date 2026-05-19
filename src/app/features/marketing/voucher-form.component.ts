import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
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
  NumberInputComponent,
  PriceInputComponent,
  SelectComponent,
  type SelectOption,
  TextareaComponent,
  ToastService,
} from '@/shared/ui';
import { CampaignStore } from './campaign.store';
import { VoucherStore } from './voucher.store';
import {
  VOUCHER_TYPE_META,
  type IVoucherBatch,
  type IVoucherCode,
  type VoucherType,
} from './marketing.types';
import { openVoucherCodesDialog } from './voucher-codes-dialog.component';

const TYPE_OPTIONS: SelectOption<VoucherType>[] = (
  Object.entries(VOUCHER_TYPE_META) as [VoucherType, (typeof VOUCHER_TYPE_META)[VoucherType]][]
).map(([value, meta]) => ({ value, label: meta.label }));

const DISCOUNT_MODE_OPTIONS: SelectOption<'percent' | 'fixed'>[] = [
  { value: 'percent', label: 'Phần trăm' },
  { value: 'fixed', label: 'Số tiền cố định' },
];

const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function randomSuffix(): string {
  let out = '';
  for (let i = 0; i < 4; i++) {
    out += CHARSET[Math.floor(Math.random() * CHARSET.length)] ?? 'A';
  }
  return out;
}

@Component({
  selector: 'app-voucher-form',
  imports: [
    BreadcrumbComponent,
    ButtonComponent,
    CardComponent,
    DatePickerComponent,
    FormFieldComponent,
    FormsModule,
    IconComponent,
    InputComponent,
    NumberInputComponent,
    PriceInputComponent,
    RouterLink,
    SelectComponent,
    TextareaComponent,
  ],
  template: `
    <div class="space-y-6">
      <div>
        <app-breadcrumb [items]="breadcrumb" />
        <h1 class="mt-2 text-2xl font-bold text-slate-900">Tạo batch voucher mới</h1>
        <p class="mt-1 text-sm text-slate-500">
          Generator tự sinh mã code theo loại voucher đã chọn.
        </p>
      </div>

      <app-card padding="lg">
        <h2 class="text-sm font-semibold text-slate-700 mb-3">Thông tin chung</h2>
        <div class="grid gap-4 sm:grid-cols-2">
          <app-form-field for="vf-name" label="Tên batch" [required]="true">
            <app-input
              id="vf-name"
              [ngModel]="name()"
              (ngModelChange)="name.set($event)"
              placeholder="VD: Voucher Tết 2026 — 100k"
            />
          </app-form-field>

          <app-form-field for="vf-code" label="Mã prefix" [required]="true">
            <app-input
              id="vf-code"
              [ngModel]="code()"
              (ngModelChange)="code.set($event.toUpperCase())"
              placeholder="VD: TET2026"
            />
            <p class="mt-1 text-xs text-slate-500">
              Single-use sẽ sinh dạng <span class="font-mono">{{ code() || 'PREFIX' }}-XXXX</span>
            </p>
          </app-form-field>

          <app-form-field for="vf-start" label="Bắt đầu" [required]="true">
            <app-date-picker
              id="vf-start"
              [ngModel]="startAt()"
              (ngModelChange)="startAt.set($event)"
            />
          </app-form-field>

          <app-form-field for="vf-end" label="Kết thúc" [required]="true">
            <app-date-picker
              id="vf-end"
              [ngModel]="endAt()"
              (ngModelChange)="endAt.set($event)"
              [min]="startAt()"
            />
          </app-form-field>

          <app-form-field for="vf-campaign" label="Gắn vào chiến dịch (tuỳ chọn)">
            <app-select
              id="vf-campaign"
              [options]="campaignOptions()"
              [ngModel]="campaignId()"
              (ngModelChange)="campaignId.set($event)"
              [searchable]="true"
              placeholder="Không gắn chiến dịch"
            />
          </app-form-field>

          <div class="sm:col-span-2">
            <app-form-field for="vf-desc" label="Mô tả">
              <app-textarea
                id="vf-desc"
                [ngModel]="description()"
                (ngModelChange)="description.set($event)"
                [rows]="2"
                placeholder="Mô tả về batch voucher, đối tượng phát hành..."
              />
            </app-form-field>
          </div>
        </div>
      </app-card>

      <app-card padding="lg">
        <h2 class="text-sm font-semibold text-slate-700 mb-3">Cấu hình voucher</h2>

        <div class="grid gap-4 sm:grid-cols-2">
          <app-form-field for="vf-type" label="Loại voucher" [required]="true">
            <app-select
              id="vf-type"
              [options]="typeOptions"
              [ngModel]="voucherType()"
              (ngModelChange)="voucherType.set($event)"
            />
            <p class="mt-1 text-xs text-slate-500">{{ typeDesc(voucherType()) }}</p>
          </app-form-field>

          <app-form-field for="vf-total" label="Số mã / số lần dùng tối đa" [required]="true">
            <app-number-input
              id="vf-total"
              [min]="1"
              [max]="10000"
              [ngModel]="totalCodes()"
              (ngModelChange)="totalCodes.set($event ?? 1)"
            />
            <p class="mt-1 text-xs text-slate-500">
              @if (voucherType() === 'single_use') {
                Sinh {{ totalCodes() }} mã duy nhất.
              } @else {
                1 mã shared, dùng tối đa {{ totalCodes() }} lần.
              }
            </p>
          </app-form-field>
        </div>

        <div class="mt-4 border-t border-slate-100 pt-4 space-y-4">
          <app-form-field for="vf-discount-mode" label="Kiểu giảm" [required]="true">
            <app-select
              id="vf-discount-mode"
              [options]="discountModeOptions"
              [ngModel]="discountMode()"
              (ngModelChange)="discountMode.set($event)"
            />
          </app-form-field>

          <div class="grid gap-4 sm:grid-cols-3">
            @if (discountMode() === 'percent') {
              <app-form-field for="vf-percent" label="Phần trăm giảm (%)" [required]="true">
                <app-number-input
                  id="vf-percent"
                  [min]="0"
                  [max]="100"
                  [ngModel]="discountPercent()"
                  (ngModelChange)="discountPercent.set($event ?? 0)"
                />
              </app-form-field>
            } @else {
              <app-form-field for="vf-amount" label="Số tiền giảm (₫)" [required]="true">
                <app-price-input
                  id="vf-amount"
                  [ngModel]="discountAmount()"
                  (ngModelChange)="discountAmount.set($event ?? 0)"
                />
              </app-form-field>
            }

            <app-form-field for="vf-min" label="Đơn tối thiểu (₫)" [required]="true">
              <app-price-input
                id="vf-min"
                [ngModel]="minOrderValue()"
                (ngModelChange)="minOrderValue.set($event ?? 0)"
              />
            </app-form-field>

            @if (discountMode() === 'percent') {
              <app-form-field for="vf-max" label="Giảm tối đa (₫)">
                <app-price-input
                  id="vf-max"
                  [ngModel]="maxDiscount()"
                  (ngModelChange)="maxDiscount.set($event)"
                  placeholder="Bỏ trống = không giới hạn"
                />
              </app-form-field>
            }
          </div>
        </div>
      </app-card>

      <div class="flex items-center justify-between">
        <a routerLink="/marketing/vouchers">
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
          Sinh {{ voucherType() === 'single_use' ? totalCodes() + ' mã' : 'mã shared' }}
        </app-button>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VoucherFormComponent {
  private readonly voucherStore = inject(VoucherStore);
  private readonly campaignStore = inject(CampaignStore);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly dialog = inject(Dialog);

  protected readonly backIcon = LucideArrowLeft.icon;
  protected readonly saveIcon = LucideSave.icon;

  protected readonly typeOptions = TYPE_OPTIONS;
  protected readonly discountModeOptions = DISCOUNT_MODE_OPTIONS;

  protected readonly campaignOptions = computed<SelectOption<string>[]>(() => [
    { value: '', label: 'Không gắn chiến dịch' },
    ...this.campaignStore.campaigns().map((c) => ({ value: c.id, label: c.name })),
  ]);

  protected readonly breadcrumb = [
    { label: 'Trang chủ', to: '/dashboard' },
    { label: 'Marketing' },
    { label: 'Voucher', to: '/marketing/vouchers' },
    { label: 'Tạo mới' },
  ];

  protected readonly name = signal<string>('');
  protected readonly code = signal<string>('');
  protected readonly description = signal<string>('');
  protected readonly startAt = signal<string | null>(null);
  protected readonly endAt = signal<string | null>(null);
  protected readonly campaignId = signal<string>('');
  protected readonly voucherType = signal<VoucherType>('single_use');
  protected readonly totalCodes = signal<number>(50);
  protected readonly discountMode = signal<'percent' | 'fixed'>('percent');
  protected readonly discountPercent = signal<number>(10);
  protected readonly discountAmount = signal<number>(100000);
  protected readonly minOrderValue = signal<number>(300000);
  protected readonly maxDiscount = signal<number | null>(null);
  protected readonly saving = signal<boolean>(false);

  protected readonly canSubmit = computed(
    () =>
      this.name().trim().length > 0 &&
      this.code().trim().length > 0 &&
      this.startAt() !== null &&
      this.endAt() !== null,
  );

  protected typeDesc(t: VoucherType): string {
    return VOUCHER_TYPE_META[t].description;
  }

  private generateCodes(batchId: string, batchCode: string): IVoucherCode[] {
    if (this.voucherType() === 'multi_use') {
      return [
        {
          id: `${batchId}-shared`,
          batchId,
          code: batchCode,
          usedAt: null,
          usedByCustomerId: null,
          orderId: null,
        },
      ];
    }
    const out: IVoucherCode[] = [];
    const seen = new Set<string>();
    for (let i = 0; i < this.totalCodes(); i++) {
      let full: string;
      do {
        full = `${batchCode}-${randomSuffix()}`;
      } while (seen.has(full));
      seen.add(full);
      out.push({
        id: `${batchId}-code-${i + 1}`,
        batchId,
        code: full,
        usedAt: null,
        usedByCustomerId: null,
        orderId: null,
      });
    }
    return out;
  }

  protected async onSave(): Promise<void> {
    if (!this.canSubmit()) return;
    this.saving.set(true);
    try {
      const id = `vb-local-${Date.now().toString(36)}`;
      const code = this.code().trim();
      const batch: IVoucherBatch = {
        id,
        code,
        name: this.name().trim(),
        description: this.description().trim(),
        voucherType: this.voucherType(),
        status: 'active',
        startAt: new Date(this.startAt() as string).toISOString(),
        endAt: new Date(this.endAt() as string).toISOString(),
        discountPercent: this.discountMode() === 'percent' ? this.discountPercent() : null,
        discountAmount: this.discountMode() === 'fixed' ? this.discountAmount() : null,
        minOrderValue: this.minOrderValue(),
        maxDiscount: this.discountMode() === 'percent' ? this.maxDiscount() : null,
        totalCodes: this.totalCodes(),
        usedCount: 0,
        campaignId: this.campaignId() || null,
        createdAt: new Date().toISOString(),
        createdBy: 'Bạn',
      };
      const codes = this.generateCodes(id, code);
      await this.voucherStore.addBatch(batch, codes);
      this.toast.success(`Đã tạo batch ${code}`);

      if (this.voucherType() === 'single_use') {
        await openVoucherCodesDialog(this.dialog, {
          batchName: batch.name,
          batchCode: batch.code,
          codes,
        });
      }

      await this.router.navigate(['/marketing/vouchers', id]);
    } finally {
      this.saving.set(false);
    }
  }
}
