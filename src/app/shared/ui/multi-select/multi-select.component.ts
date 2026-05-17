import { CdkConnectedOverlay, CdkOverlayOrigin } from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  forwardRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { type ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LucideCheck, LucideChevronDown, LucideSearch, LucideX } from '@lucide/angular';
import { IconComponent } from '@/shared/ui/icon/icon.component';
import type { SelectOption } from '@/shared/ui/select/select.component';

const noop = (): void => undefined;

@Component({
  selector: 'app-multi-select',
  imports: [CdkConnectedOverlay, IconComponent],
  hostDirectives: [CdkOverlayOrigin],
  template: `
    <button
      type="button"
      [id]="id()"
      [disabled]="disabled()"
      [attr.aria-haspopup]="'listbox'"
      [attr.aria-expanded]="open()"
      [attr.aria-invalid]="invalid() ? 'true' : null"
      [class]="triggerClasses()"
      (click)="toggle()"
    >
      <div class="flex flex-1 flex-wrap items-center gap-1 min-w-0">
        @if (selectedOptions().length === 0) {
          <span class="text-slate-400 text-sm">{{ placeholder() }}</span>
        } @else {
          @for (opt of selectedOptions(); track opt.value) {
            <span
              class="inline-flex items-center gap-1 rounded bg-indigo-50 px-1.5 py-0.5 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-200"
            >
              {{ opt.label }}
              <button
                type="button"
                class="hover:bg-indigo-100 rounded p-0.5"
                [attr.aria-label]="'Bỏ chọn ' + opt.label"
                (click)="removeOne($event, opt.value)"
              >
                <app-icon [icon]="closeIcon" size="xs" />
              </button>
            </span>
          }
        }
      </div>
      <app-icon [icon]="chevronIcon" size="sm" />
    </button>

    <ng-template
      cdkConnectedOverlay
      [cdkConnectedOverlayOrigin]="origin"
      [cdkConnectedOverlayOpen]="open()"
      [cdkConnectedOverlayPositions]="positions"
      [cdkConnectedOverlayHasBackdrop]="true"
      cdkConnectedOverlayBackdropClass="cdk-overlay-transparent-backdrop"
      [cdkConnectedOverlayWidth]="triggerWidth()"
      (backdropClick)="close()"
      (detach)="close()"
    >
      <div
        class="rounded-md border border-slate-200 bg-white shadow-md overflow-hidden flex flex-col max-h-72"
        role="listbox"
      >
        @if (searchable()) {
          <div class="border-b border-slate-200 p-2 flex items-center gap-2">
            <app-icon [icon]="searchIcon" size="md" />
            <input
              type="text"
              [value]="query()"
              [placeholder]="searchPlaceholder()"
              class="flex-1 outline-none text-sm placeholder:text-slate-400"
              (input)="onSearch($event)"
            />
          </div>
        }
        <ul class="overflow-y-auto py-1">
          @for (option of filtered(); track option.value) {
            <li>
              <button
                type="button"
                role="option"
                [disabled]="option.disabled"
                [attr.aria-selected]="isSelected(option.value)"
                [class]="optionClasses(isSelected(option.value))"
                (click)="toggleOption(option)"
              >
                <span
                  class="flex h-4 w-4 items-center justify-center rounded border"
                  [class.border-indigo-600]="isSelected(option.value)"
                  [class.bg-indigo-600]="isSelected(option.value)"
                  [class.border-slate-300]="!isSelected(option.value)"
                >
                  @if (isSelected(option.value)) {
                    <app-icon [icon]="checkIcon" size="xs" />
                  }
                </span>
                <span class="flex-1 truncate text-left">{{ option.label }}</span>
              </button>
            </li>
          }
          @if (filtered().length === 0) {
            <li class="px-3 py-2 text-sm text-slate-400">Không có kết quả</li>
          }
        </ul>
      </div>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultiSelectComponent),
      multi: true,
    },
  ],
})
export class MultiSelectComponent<T = unknown> implements ControlValueAccessor {
  readonly id = input.required<string>();
  readonly options = input.required<SelectOption<T>[]>();
  readonly placeholder = input<string>('Chọn...');
  readonly searchable = input<boolean>(false);
  readonly searchPlaceholder = input<string>('Tìm kiếm...');
  readonly invalid = input<boolean>(false);

  protected readonly origin = inject(CdkOverlayOrigin);
  protected readonly hostEl = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly chevronIcon = LucideChevronDown.icon;
  protected readonly checkIcon = LucideCheck.icon;
  protected readonly searchIcon = LucideSearch.icon;
  protected readonly closeIcon = LucideX.icon;

  protected readonly open = signal<boolean>(false);
  protected readonly query = signal<string>('');
  protected readonly values = signal<T[]>([]);
  protected readonly disabled = signal<boolean>(false);

  protected readonly positions = [
    {
      originX: 'start' as const,
      originY: 'bottom' as const,
      overlayX: 'start' as const,
      overlayY: 'top' as const,
      offsetY: 4,
    },
    {
      originX: 'start' as const,
      originY: 'top' as const,
      overlayX: 'start' as const,
      overlayY: 'bottom' as const,
      offsetY: -4,
    },
  ];

  protected readonly triggerWidth = computed(
    () => this.hostEl.nativeElement.getBoundingClientRect().width || 200,
  );

  protected readonly selectedOptions = computed(() => {
    const set = new Set(this.values());
    return this.options().filter((o) => set.has(o.value));
  });

  protected readonly filtered = computed(() => {
    const q = this.query().toLowerCase().trim();
    if (!q) return this.options();
    return this.options().filter((o) => o.label.toLowerCase().includes(q));
  });

  protected readonly triggerClasses = computed(() => {
    const base =
      'inline-flex w-full items-center gap-2 rounded-md border bg-white px-2 py-1 text-sm text-slate-900 min-h-[38px] ' +
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 ' +
      'disabled:cursor-not-allowed disabled:bg-slate-50';
    return this.invalid()
      ? `${base} border-red-400 focus-visible:border-red-500 focus-visible:ring-red-500`
      : `${base} border-slate-300 focus-visible:border-indigo-500 focus-visible:ring-indigo-500`;
  });

  private onChange: (value: T[]) => void = noop;
  private onTouched: () => void = noop;

  writeValue(value: T[] | null): void {
    this.values.set(value ?? []);
  }

  registerOnChange(fn: (value: T[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  protected toggle(): void {
    if (this.disabled()) return;
    this.open.update((v) => !v);
    if (!this.open()) this.onTouched();
  }

  protected close(): void {
    this.open.set(false);
    this.query.set('');
    this.onTouched();
  }

  protected onSearch(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  protected isSelected(value: T): boolean {
    return this.values().includes(value);
  }

  protected toggleOption(option: SelectOption<T>): void {
    if (option.disabled) return;
    const current = this.values();
    const next = current.includes(option.value)
      ? current.filter((v) => v !== option.value)
      : [...current, option.value];
    this.values.set(next);
    this.onChange(next);
  }

  protected removeOne(event: Event, value: T): void {
    event.stopPropagation();
    if (this.disabled()) return;
    const next = this.values().filter((v) => v !== value);
    this.values.set(next);
    this.onChange(next);
  }

  protected optionClasses(selected: boolean): string {
    const base =
      'flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:bg-slate-100 text-slate-700';
    return selected ? `${base} bg-indigo-50/40` : base;
  }
}
