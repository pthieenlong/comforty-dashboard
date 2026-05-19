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
import { LucideCalendar, LucideChevronLeft, LucideChevronRight, LucideX } from '@lucide/angular';
import { IconComponent } from '@/shared/ui/icon/icon.component';

export interface DateRange {
  start: string | null;
  end: string | null;
}

interface DayCell {
  date: string;
  day: number;
  inMonth: boolean;
  isToday: boolean;
  isStart: boolean;
  isEnd: boolean;
  inRange: boolean;
  disabled: boolean;
}

const noop = (): void => undefined;

const WEEKDAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function toIso(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function parseIso(value: string | null): Date | null {
  if (!value) return null;
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function formatVi(value: string | null): string {
  const d = parseIso(value);
  if (!d) return '';
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

@Component({
  selector: 'app-date-range-picker',
  imports: [CdkConnectedOverlay, IconComponent],
  hostDirectives: [CdkOverlayOrigin],
  template: `
    <button
      type="button"
      [id]="id()"
      [disabled]="disabled()"
      [attr.aria-haspopup]="'dialog'"
      [attr.aria-expanded]="open()"
      [attr.aria-invalid]="invalid() ? 'true' : null"
      [class]="triggerClasses()"
      (click)="toggle()"
    >
      <app-icon [icon]="calendarIcon" size="sm" class="text-slate-400" />
      <span class="flex-1 truncate text-left" [class.text-slate-400]="!hasValue()">
        @if (hasValue()) {
          {{ displayText() }}
        } @else {
          {{ placeholder() }}
        }
      </span>
      @if (hasValue() && !disabled()) {
        <span
          role="button"
          tabindex="0"
          class="text-slate-400 hover:text-slate-600 rounded p-0.5"
          aria-label="Xoá khoảng ngày"
          (click)="clear($event)"
          (keydown.enter)="clear($event)"
          (keydown.space)="clear($event)"
        >
          <app-icon [icon]="closeIcon" size="sm" />
        </span>
      }
    </button>

    <ng-template
      cdkConnectedOverlay
      [cdkConnectedOverlayOrigin]="origin"
      [cdkConnectedOverlayOpen]="open()"
      [cdkConnectedOverlayPositions]="positions"
      [cdkConnectedOverlayHasBackdrop]="true"
      cdkConnectedOverlayBackdropClass="cdk-overlay-transparent-backdrop"
      (backdropClick)="close()"
      (detach)="close()"
    >
      <div class="w-72 rounded-md border border-slate-200 bg-white p-3 shadow-md">
        <div class="flex items-center justify-between mb-2">
          <button
            type="button"
            class="rounded p-1 hover:bg-slate-100"
            aria-label="Tháng trước"
            (click)="shiftMonth(-1)"
          >
            <app-icon [icon]="chevronLeftIcon" size="sm" />
          </button>
          <span class="text-sm font-medium text-slate-900">{{ monthLabel() }}</span>
          <button
            type="button"
            class="rounded p-1 hover:bg-slate-100"
            aria-label="Tháng sau"
            (click)="shiftMonth(1)"
          >
            <app-icon [icon]="chevronRightIcon" size="sm" />
          </button>
        </div>

        <div class="grid grid-cols-7 gap-0.5 text-center mb-1">
          @for (w of weekdays; track w) {
            <span class="text-xs text-slate-500 py-1">{{ w }}</span>
          }
        </div>

        <div class="grid grid-cols-7 gap-0.5">
          @for (cell of cells(); track cell.date) {
            <button
              type="button"
              [disabled]="cell.disabled"
              [class]="cellClasses(cell)"
              (click)="pickDate(cell)"
            >
              {{ cell.day }}
            </button>
          }
        </div>

        <div class="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-xs">
          <span class="text-slate-500">
            @if (range().start && !range().end) {
              Chọn ngày kết thúc
            } @else if (range().start && range().end) {
              {{ formatVi(range().start) }} → {{ formatVi(range().end) }}
            } @else {
              Chọn ngày bắt đầu
            }
          </span>
          <div class="flex items-center gap-2">
            <button type="button" class="text-slate-600 hover:text-slate-900" (click)="reset()">
              Đặt lại
            </button>
            <button
              type="button"
              class="text-indigo-600 hover:text-indigo-700 font-medium"
              [disabled]="!range().start || !range().end"
              [class.opacity-50]="!range().start || !range().end"
              (click)="apply()"
            >
              Áp dụng
            </button>
          </div>
        </div>
      </div>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateRangePickerComponent),
      multi: true,
    },
  ],
})
export class DateRangePickerComponent implements ControlValueAccessor {
  readonly id = input.required<string>();
  readonly placeholder = input<string>('Chọn khoảng ngày');
  readonly invalid = input<boolean>(false);

  protected readonly origin = inject(CdkOverlayOrigin);
  protected readonly hostEl = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly weekdays = WEEKDAY_LABELS;

  protected readonly calendarIcon = LucideCalendar.icon;
  protected readonly chevronLeftIcon = LucideChevronLeft.icon;
  protected readonly chevronRightIcon = LucideChevronRight.icon;
  protected readonly closeIcon = LucideX.icon;

  protected readonly open = signal<boolean>(false);
  protected readonly disabled = signal<boolean>(false);
  protected readonly value = signal<DateRange>({ start: null, end: null });
  protected readonly range = signal<DateRange>({ start: null, end: null });
  protected readonly viewMonth = signal<{ year: number; month: number }>(this.todayMonth());

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

  protected readonly hasValue = computed(
    () => this.value().start !== null || this.value().end !== null,
  );

  protected readonly displayText = computed(() => {
    const v = this.value();
    if (!v.start && !v.end) return '';
    if (v.start && v.end) return `${formatVi(v.start)} → ${formatVi(v.end)}`;
    return formatVi(v.start ?? v.end);
  });

  protected readonly monthLabel = computed(() => {
    const { year, month } = this.viewMonth();
    return `Tháng ${month + 1}, ${year}`;
  });

  protected readonly triggerClasses = computed(() => {
    const base =
      'inline-flex w-full items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm text-slate-900 min-h-[38px] ' +
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:bg-slate-50';
    return this.invalid()
      ? `${base} border-red-400 focus-visible:border-red-500 focus-visible:ring-red-500`
      : `${base} border-slate-300 focus-visible:border-indigo-500 focus-visible:ring-indigo-500`;
  });

  protected readonly cells = computed<DayCell[]>(() => {
    const { year, month } = this.viewMonth();
    const first = new Date(year, month, 1);
    // Monday-first week: getDay() Sunday=0 → shift.
    const weekdayOffset = (first.getDay() + 6) % 7;
    const start = new Date(year, month, 1 - weekdayOffset);
    const today = toIso(new Date());
    const r = this.range();
    const cells: DayCell[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const iso = toIso(d);
      const inMonth = d.getMonth() === month;
      const inRange = r.start !== null && r.end !== null && iso > r.start && iso < r.end;
      cells.push({
        date: iso,
        day: d.getDate(),
        inMonth,
        isToday: iso === today,
        isStart: r.start === iso,
        isEnd: r.end === iso,
        inRange,
        disabled: false,
      });
    }
    return cells;
  });

  private onChange: (value: DateRange) => void = noop;
  private onTouched: () => void = noop;

  writeValue(value: DateRange | null): void {
    const safe = value ?? { start: null, end: null };
    this.value.set(safe);
    this.range.set(safe);
  }

  registerOnChange(fn: (value: DateRange) => void): void {
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
    if (this.open()) {
      this.range.set(this.value());
      const anchor = parseIso(this.value().start) ?? new Date();
      this.viewMonth.set({ year: anchor.getFullYear(), month: anchor.getMonth() });
    } else {
      this.onTouched();
    }
  }

  protected close(): void {
    this.open.set(false);
    this.onTouched();
  }

  protected shiftMonth(delta: number): void {
    this.viewMonth.update(({ year, month }) => {
      const m = month + delta;
      const total = year * 12 + m;
      return { year: Math.floor(total / 12), month: ((total % 12) + 12) % 12 };
    });
  }

  protected pickDate(cell: DayCell): void {
    if (cell.disabled) return;
    const r = this.range();
    // If no start, or both set already, start a new range.
    if (!r.start || (r.start && r.end)) {
      this.range.set({ start: cell.date, end: null });
      return;
    }
    // Have start, picking end.
    if (cell.date < r.start) {
      // Swap.
      this.range.set({ start: cell.date, end: r.start });
    } else {
      this.range.set({ start: r.start, end: cell.date });
    }
  }

  protected reset(): void {
    this.range.set({ start: null, end: null });
  }

  protected apply(): void {
    const r = this.range();
    if (!r.start || !r.end) return;
    this.value.set(r);
    this.onChange(r);
    this.open.set(false);
  }

  protected clear(event: Event): void {
    event.stopPropagation();
    if (this.disabled()) return;
    const empty: DateRange = { start: null, end: null };
    this.value.set(empty);
    this.range.set(empty);
    this.onChange(empty);
  }

  protected cellClasses(cell: DayCell): string {
    const base = 'h-8 w-8 rounded text-xs flex items-center justify-center transition-colors';
    if (!cell.inMonth) return `${base} text-slate-300 hover:bg-slate-50`;
    if (cell.isStart || cell.isEnd) {
      return `${base} bg-indigo-600 text-white hover:bg-indigo-700`;
    }
    if (cell.inRange) {
      return `${base} bg-indigo-50 text-indigo-700`;
    }
    if (cell.isToday) {
      return `${base} ring-1 ring-indigo-400 text-slate-900 hover:bg-slate-100`;
    }
    return `${base} text-slate-700 hover:bg-slate-100`;
  }

  protected formatVi = formatVi;

  private todayMonth(): { year: number; month: number } {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  }
}
