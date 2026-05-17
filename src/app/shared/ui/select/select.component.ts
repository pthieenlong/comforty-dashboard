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
  viewChild,
} from '@angular/core';
import { type ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LucideCheck, LucideChevronDown, LucideSearch } from '@lucide/angular';
import { IconComponent } from '@/shared/ui/icon/icon.component';

const noop = (): void => undefined;

export interface SelectOption<T = unknown> {
  value: T;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-select',
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
      (keydown.arrowDown)="open.set(true); $event.preventDefault()"
    >
      <span class="flex-1 truncate text-left" [class.text-slate-400]="!selectedLabel()">
        {{ selectedLabel() || placeholder() }}
      </span>
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
              #search
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
                [attr.aria-selected]="isSelected(option)"
                [class]="optionClasses(isSelected(option))"
                (click)="pick(option)"
              >
                <span class="flex-1 truncate text-left">{{ option.label }}</span>
                @if (isSelected(option)) {
                  <app-icon [icon]="checkIcon" size="sm" />
                }
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
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
})
export class SelectComponent<T = unknown> implements ControlValueAccessor {
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

  protected readonly open = signal<boolean>(false);
  protected readonly query = signal<string>('');
  protected readonly value = signal<T | null>(null);
  protected readonly disabled = signal<boolean>(false);

  protected readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('search');

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

  protected readonly selectedLabel = computed(() => {
    const v = this.value();
    if (v === null || v === undefined) return '';
    return this.options().find((o) => o.value === v)?.label ?? '';
  });

  protected readonly filtered = computed(() => {
    const q = this.query().toLowerCase().trim();
    if (!q) return this.options();
    return this.options().filter((o) => o.label.toLowerCase().includes(q));
  });

  protected readonly triggerClasses = computed(() => {
    const base =
      'inline-flex w-full items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm text-slate-900 min-h-[38px] ' +
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 ' +
      'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500';
    return this.invalid()
      ? `${base} border-red-400 focus-visible:border-red-500 focus-visible:ring-red-500`
      : `${base} border-slate-300 focus-visible:border-indigo-500 focus-visible:ring-indigo-500`;
  });

  private onChange: (value: T | null) => void = noop;
  private onTouched: () => void = noop;

  writeValue(value: T | null): void {
    this.value.set(value);
  }

  registerOnChange(fn: (value: T | null) => void): void {
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

  protected isSelected(option: SelectOption<T>): boolean {
    return this.value() === option.value;
  }

  protected optionClasses(selected: boolean): string {
    const base =
      'flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:bg-slate-100';
    return selected ? `${base} bg-indigo-50 text-indigo-700` : `${base} text-slate-700`;
  }

  protected pick(option: SelectOption<T>): void {
    if (option.disabled) return;
    this.value.set(option.value);
    this.onChange(option.value);
    this.close();
  }
}
