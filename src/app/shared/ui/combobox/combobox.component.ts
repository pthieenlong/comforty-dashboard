import { CdkConnectedOverlay, CdkOverlayOrigin } from '@angular/cdk/overlay';
import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  type TemplateRef,
  computed,
  contentChild,
  effect,
  forwardRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { type ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LucideChevronDown, LucideLoader2, LucideSearch, LucideX } from '@lucide/angular';
import { IconComponent } from '@/shared/ui/icon/icon.component';

const noop = (): void => undefined;

export interface ComboboxOption<T = unknown> {
  value: T;
  label: string;
  description?: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-combobox',
  imports: [CdkConnectedOverlay, IconComponent, NgTemplateOutlet],
  hostDirectives: [CdkOverlayOrigin],
  template: `
    <div [class]="triggerClasses()">
      <app-icon [icon]="searchIcon" size="sm" />
      <input
        #inputEl
        type="text"
        [id]="id()"
        [value]="displayText()"
        [placeholder]="placeholder()"
        [disabled]="disabled()"
        [attr.aria-invalid]="invalid() ? 'true' : null"
        [attr.aria-expanded]="open()"
        [attr.aria-autocomplete]="'list'"
        [attr.aria-controls]="id() + '-listbox'"
        autocomplete="off"
        role="combobox"
        class="flex-1 outline-none text-sm placeholder:text-slate-400 bg-transparent disabled:cursor-not-allowed"
        (input)="onQueryInput($event)"
        (focus)="open.set(true)"
        (keydown.arrowDown)="moveActive(1); $event.preventDefault()"
        (keydown.arrowUp)="moveActive(-1); $event.preventDefault()"
        (keydown.enter)="pickActive(); $event.preventDefault()"
        (keydown.escape)="close()"
      />
      @if (loading()) {
        <app-icon [icon]="loaderIcon" size="sm" class="animate-spin text-slate-400" />
      } @else if (value() !== null && !disabled()) {
        <button
          type="button"
          class="text-slate-400 hover:text-slate-600 rounded p-0.5"
          aria-label="Xoá lựa chọn"
          (click)="clear()"
        >
          <app-icon [icon]="closeIcon" size="sm" />
        </button>
      } @else {
        <app-icon [icon]="chevronIcon" size="sm" class="text-slate-400" />
      }
    </div>

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
        [id]="id() + '-listbox'"
        class="rounded-md border border-slate-200 bg-white shadow-md overflow-hidden max-h-72 overflow-y-auto"
        role="listbox"
      >
        @if (loading()) {
          <div class="px-3 py-4 text-center text-sm text-slate-400">Đang tìm...</div>
        } @else if (options().length === 0) {
          <div class="px-3 py-4 text-center text-sm text-slate-400">
            {{ emptyText() }}
          </div>
        } @else {
          @for (option of options(); track option.value; let i = $index) {
            <button
              type="button"
              role="option"
              [disabled]="option.disabled"
              [attr.aria-selected]="isSelected(option)"
              [class]="optionClasses(isSelected(option), i === activeIndex())"
              (mouseenter)="activeIndex.set(i)"
              (click)="pick(option)"
            >
              @if (optionTpl(); as tpl) {
                <ng-container *ngTemplateOutlet="tpl; context: { $implicit: option }" />
              } @else {
                <div class="flex flex-col items-start gap-0.5 min-w-0">
                  <span class="truncate text-sm text-slate-900">{{ option.label }}</span>
                  @if (option.description) {
                    <span class="truncate text-xs text-slate-500">{{ option.description }}</span>
                  }
                </div>
              }
            </button>
          }
        }
      </div>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ComboboxComponent),
      multi: true,
    },
  ],
})
export class ComboboxComponent<T = unknown> implements ControlValueAccessor {
  readonly id = input.required<string>();
  readonly options = input.required<ComboboxOption<T>[]>();
  readonly placeholder = input<string>('Tìm kiếm...');
  readonly invalid = input<boolean>(false);
  readonly loading = input<boolean>(false);
  readonly emptyText = input<string>('Không tìm thấy kết quả');

  readonly queryChange = output<string>();

  protected readonly optionTpl =
    contentChild<TemplateRef<{ $implicit: ComboboxOption<T> }>>('optionTpl');

  protected readonly origin = inject(CdkOverlayOrigin);
  protected readonly hostEl = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly inputRef = viewChild<ElementRef<HTMLInputElement>>('inputEl');

  protected readonly searchIcon = LucideSearch.icon;
  protected readonly chevronIcon = LucideChevronDown.icon;
  protected readonly closeIcon = LucideX.icon;
  protected readonly loaderIcon = LucideLoader2.icon;

  protected readonly open = signal<boolean>(false);
  protected readonly query = signal<string>('');
  protected readonly value = signal<T | null>(null);
  protected readonly disabled = signal<boolean>(false);
  protected readonly activeIndex = signal<number>(0);

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
    () => this.hostEl.nativeElement.getBoundingClientRect().width || 240,
  );

  protected readonly selectedOption = computed(() => {
    const v = this.value();
    if (v === null || v === undefined) return null;
    return this.options().find((o) => o.value === v) ?? null;
  });

  protected readonly displayText = computed(() => {
    if (this.open()) return this.query();
    return this.selectedOption()?.label ?? '';
  });

  protected readonly triggerClasses = computed(() => {
    const base =
      'inline-flex w-full items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm text-slate-900 min-h-[38px] ' +
      'focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-0';
    return this.invalid()
      ? `${base} border-red-400 focus-within:border-red-500 focus-within:ring-red-500`
      : `${base} border-slate-300 focus-within:border-indigo-500 focus-within:ring-indigo-500`;
  });

  private onChange: (value: T | null) => void = noop;
  private onTouched: () => void = noop;

  constructor() {
    effect(() => {
      // Clamp active index when options change.
      const max = this.options().length - 1;
      if (this.activeIndex() > max) {
        this.activeIndex.set(Math.max(0, max));
      }
    });
  }

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

  protected onQueryInput(event: Event): void {
    const q = (event.target as HTMLInputElement).value;
    this.query.set(q);
    this.open.set(true);
    this.activeIndex.set(0);
    this.queryChange.emit(q);
  }

  protected close(): void {
    this.open.set(false);
    this.query.set('');
    this.onTouched();
  }

  protected clear(): void {
    this.value.set(null);
    this.query.set('');
    this.onChange(null);
    this.inputRef()?.nativeElement.focus();
  }

  protected moveActive(delta: number): void {
    if (!this.open()) {
      this.open.set(true);
      return;
    }
    const len = this.options().length;
    if (len === 0) return;
    const next = (this.activeIndex() + delta + len) % len;
    this.activeIndex.set(next);
  }

  protected pickActive(): void {
    const opt = this.options()[this.activeIndex()];
    if (!opt) return;
    this.pick(opt);
  }

  protected pick(option: ComboboxOption<T>): void {
    if (option.disabled) return;
    this.value.set(option.value);
    this.onChange(option.value);
    this.open.set(false);
    this.query.set('');
  }

  protected isSelected(option: ComboboxOption<T>): boolean {
    return this.value() === option.value;
  }

  protected optionClasses(selected: boolean, active: boolean): string {
    const base =
      'flex w-full items-center gap-2 px-3 py-2 text-left disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none';
    if (selected) return `${base} bg-indigo-50 text-indigo-700`;
    if (active) return `${base} bg-slate-100`;
    return `${base} text-slate-700 hover:bg-slate-50`;
  }
}
