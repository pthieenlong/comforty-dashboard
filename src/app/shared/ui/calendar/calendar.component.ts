import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  computed,
  contentChild,
  input,
  output,
} from '@angular/core';
import { LucideChevronLeft, LucideChevronRight } from '@lucide/angular';
import { IconComponent } from '@/shared/ui/icon/icon.component';

export interface CalendarDay {
  date: string;
  day: number;
  inMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
}

const WEEKDAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function toIso(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

@Component({
  selector: 'app-calendar',
  imports: [IconComponent, NgTemplateOutlet],
  template: `
    <div class="rounded-md border border-slate-200 bg-white">
      <div class="flex items-center justify-between border-b border-slate-200 px-3 py-2">
        <button
          type="button"
          class="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Tháng trước"
          (click)="shiftMonth(-1)"
        >
          <app-icon [icon]="chevronLeftIcon" size="sm" />
        </button>
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium text-slate-900">{{ monthLabel() }}</span>
          <button
            type="button"
            class="rounded border border-slate-200 px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-50"
            (click)="goToday()"
          >
            Hôm nay
          </button>
        </div>
        <button
          type="button"
          class="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Tháng sau"
          (click)="shiftMonth(1)"
        >
          <app-icon [icon]="chevronRightIcon" size="sm" />
        </button>
      </div>

      <div class="grid grid-cols-7 border-b border-slate-100 bg-slate-50/60 text-center">
        @for (w of weekdays; track w) {
          <span class="py-1.5 text-xs font-medium text-slate-500">{{ w }}</span>
        }
      </div>

      <div class="grid grid-cols-7">
        @for (cell of cells(); track cell.date) {
          <button type="button" [class]="cellClasses(cell)" (click)="selectDay(cell)">
            @if (cellTemplate(); as tpl) {
              <ng-container *ngTemplateOutlet="tpl; context: { $implicit: cell }" />
            } @else {
              <span
                class="text-xs"
                [class.text-slate-300]="!cell.inMonth"
                [class.font-semibold]="cell.isToday"
                [class.text-indigo-600]="cell.isToday"
              >
                {{ cell.day }}
              </span>
            }
          </button>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class CalendarComponent {
  readonly year = input.required<number>();
  readonly month = input.required<number>(); // 0-11

  readonly monthChange = output<{ year: number; month: number }>();
  readonly dayClick = output<CalendarDay>();

  protected readonly cellTemplate =
    contentChild<TemplateRef<{ $implicit: CalendarDay }>>(TemplateRef);

  protected readonly weekdays = WEEKDAY_LABELS;
  protected readonly chevronLeftIcon = LucideChevronLeft.icon;
  protected readonly chevronRightIcon = LucideChevronRight.icon;

  protected readonly monthLabel = computed(() => `Tháng ${this.month() + 1}, ${this.year()}`);

  protected readonly cells = computed<CalendarDay[]>(() => {
    const year = this.year();
    const month = this.month();
    const first = new Date(year, month, 1);
    const weekdayOffset = (first.getDay() + 6) % 7;
    const start = new Date(year, month, 1 - weekdayOffset);
    const today = toIso(new Date());
    const cells: CalendarDay[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const dow = d.getDay();
      cells.push({
        date: toIso(d),
        day: d.getDate(),
        inMonth: d.getMonth() === month,
        isToday: toIso(d) === today,
        isWeekend: dow === 0 || dow === 6,
      });
    }
    return cells;
  });

  protected shiftMonth(delta: number): void {
    const total = this.year() * 12 + this.month() + delta;
    this.monthChange.emit({
      year: Math.floor(total / 12),
      month: ((total % 12) + 12) % 12,
    });
  }

  protected goToday(): void {
    const d = new Date();
    this.monthChange.emit({ year: d.getFullYear(), month: d.getMonth() });
  }

  protected selectDay(cell: CalendarDay): void {
    this.dayClick.emit(cell);
  }

  protected cellClasses(cell: CalendarDay): string {
    const base =
      'border-b border-r border-slate-100 p-1.5 text-left transition-colors hover:bg-indigo-50/40 focus:bg-indigo-50/60 focus:outline-none';
    const dim = cell.inMonth ? 'bg-white' : 'bg-slate-50/40';
    return `${base} ${dim}`;
  }
}
