import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import {
  type ApexAxisChartSeries,
  type ApexChart,
  type ApexDataLabels,
  type ApexGrid,
  type ApexLegend,
  type ApexMarkers,
  type ApexStroke,
  type ApexTooltip,
  type ApexXAxis,
  type ApexYAxis,
  ChartComponent,
} from 'ng-apexcharts';
import { USERS } from '@/features/iam/iam.mock';
import { departmentOfRole, type DepartmentKey } from '@/core/department/department.config';
import { normalizeTenantId } from '@/core/tenant/tenant-normalize';
import { AttendanceStore } from './attendance.store';
import type { IAttendanceRecord } from './hr.types';

export type ChartMode = 'month' | 'year';

interface DailyAggregate {
  label: string;
  present: number;
  late: number;
  absent: number;
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

/**
 * Map raw attendance status into one of 3 buckets matching the chart series.
 * present-bucket: present + overtime + half_day
 * late-bucket:    late
 * absent-bucket:  absent + on_leave
 */
function bucketOf(status: IAttendanceRecord['status']): 'present' | 'late' | 'absent' | null {
  switch (status) {
    case 'present':
    case 'overtime':
    case 'half_day':
      return 'present';
    case 'late':
      return 'late';
    case 'absent':
    case 'on_leave':
      return 'absent';
    default:
      return null;
  }
}

@Component({
  selector: 'app-attendance-chart',
  imports: [ChartComponent],
  template: `
    @if (series().length > 0 && hasData()) {
      <apx-chart
        [series]="series()"
        [chart]="chart"
        [xaxis]="xaxis()"
        [yaxis]="yaxis"
        [stroke]="stroke"
        [colors]="colors"
        [legend]="legend"
        [tooltip]="tooltip"
        [markers]="markers"
        [grid]="grid"
        [dataLabels]="dataLabels"
      />
    } @else {
      <div class="flex h-72 items-center justify-center text-sm text-slate-400">
        Không có dữ liệu chấm công phù hợp với bộ lọc.
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class AttendanceChartComponent {
  private readonly store = inject(AttendanceStore);

  readonly mode = input.required<ChartMode>();
  readonly year = input.required<number>();
  readonly month = input.required<number>(); // 0-11; ignored when mode='year'
  readonly tenantId = input<string | 'all'>('all');
  readonly department = input<DepartmentKey | 'all'>('all');

  protected readonly chart: ApexChart = {
    type: 'line',
    height: 320,
    toolbar: { show: false },
    animations: { enabled: true },
    zoom: { enabled: false },
  };

  protected readonly stroke: ApexStroke = {
    curve: 'smooth',
    width: 2.5,
  };

  protected readonly colors = ['#10b981', '#f59e0b', '#ef4444'];

  protected readonly legend: ApexLegend = {
    position: 'top',
    horizontalAlign: 'right',
    markers: { strokeWidth: 0 },
  };

  protected readonly tooltip: ApexTooltip = {
    shared: true,
    intersect: false,
    y: { formatter: (val) => `${val}%` },
  };

  protected readonly markers: ApexMarkers = {
    size: 4,
    strokeWidth: 0,
    hover: { sizeOffset: 2 },
  };

  protected readonly grid: ApexGrid = {
    borderColor: '#e2e8f0',
    strokeDashArray: 4,
  };

  protected readonly dataLabels: ApexDataLabels = { enabled: false };

  protected readonly yaxis: ApexYAxis = {
    min: 0,
    max: 100,
    tickAmount: 5,
    labels: { formatter: (val) => `${Math.round(val)}%` },
  };

  /** Filter users by department + tenant. */
  private readonly filteredUserIds = computed<Set<string>>(() => {
    const dept = this.department();
    const tidRaw = this.tenantId();
    const tid = tidRaw === 'all' ? 'all' : normalizeTenantId(tidRaw);
    const ids = new Set<string>();
    for (const user of USERS) {
      const matchesTenant =
        tid === 'all' || user.assignments.some((a) => normalizeTenantId(a.tenantId) === tid);
      if (!matchesTenant) continue;
      if (dept === 'all') {
        ids.add(user.id);
        continue;
      }
      // Department derived from any assignment's primary role.
      const userDept = user.assignments.flatMap((a) =>
        a.roleIds.map((rid) => departmentOfRole(rid)),
      );
      if (userDept.includes(dept)) ids.add(user.id);
    }
    return ids;
  });

  private readonly aggregates = computed<DailyAggregate[]>(() => {
    const userIds = this.filteredUserIds();
    if (userIds.size === 0) return [];
    const records = this.store.records();
    if (this.mode() === 'month') {
      return this.aggregateByDayOfMonth(records, userIds);
    }
    return this.aggregateByMonth(records, userIds);
  });

  protected readonly series = computed<ApexAxisChartSeries>(() => {
    const aggs = this.aggregates();
    if (aggs.length === 0) return [];
    return [
      { name: 'Có mặt', data: aggs.map((a) => a.present) },
      { name: 'Trễ', data: aggs.map((a) => a.late) },
      { name: 'Vắng', data: aggs.map((a) => a.absent) },
    ];
  });

  protected readonly hasData = computed(() =>
    this.aggregates().some((a) => a.present + a.late + a.absent > 0),
  );

  protected readonly xaxis = computed<ApexXAxis>(() => ({
    categories: this.aggregates().map((a) => a.label),
    labels: { style: { fontSize: '11px' } },
  }));

  private aggregateByDayOfMonth(
    records: readonly IAttendanceRecord[],
    userIds: ReadonlySet<string>,
  ): DailyAggregate[] {
    const y = this.year();
    const m = this.month();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const out: DailyAggregate[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dateIso = `${y}-${pad(m + 1)}-${pad(day)}`;
      out.push({
        label: String(day),
        ...this.computePercents(records, userIds, (r) => r.date === dateIso),
      });
    }
    return out;
  }

  private aggregateByMonth(
    records: readonly IAttendanceRecord[],
    userIds: ReadonlySet<string>,
  ): DailyAggregate[] {
    const y = this.year();
    const out: DailyAggregate[] = [];
    for (let m = 0; m < 12; m++) {
      const prefix = `${y}-${pad(m + 1)}`;
      out.push({
        label: `T${m + 1}`,
        ...this.computePercents(records, userIds, (r) => r.date.startsWith(prefix)),
      });
    }
    return out;
  }

  private computePercents(
    records: readonly IAttendanceRecord[],
    userIds: ReadonlySet<string>,
    matcher: (r: IAttendanceRecord) => boolean,
  ): { present: number; late: number; absent: number } {
    let p = 0;
    let l = 0;
    let a = 0;
    let total = 0;
    for (const r of records) {
      if (!userIds.has(r.userId)) continue;
      if (!matcher(r)) continue;
      const bucket = bucketOf(r.status);
      if (!bucket) continue;
      total += 1;
      if (bucket === 'present') p += 1;
      else if (bucket === 'late') l += 1;
      else a += 1;
    }
    if (total === 0) return { present: 0, late: 0, absent: 0 };
    return {
      present: Math.round((p / total) * 100),
      late: Math.round((l / total) * 100),
      absent: Math.round((a / total) * 100),
    };
  }
}
