import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideChevronLeft, LucideChevronRight } from '@lucide/angular';
import { AuthStore } from '@/core/auth/auth.store';
import { TenantStore } from '@/core/tenant/tenant.store';
import {
  DEPARTMENTS,
  type DepartmentKey,
  canViewWholeCompany,
  departmentOfRole,
} from '@/core/department/department.config';
import { normalizeTenantId } from '@/core/tenant/tenant-normalize';
import { ROLES, USERS } from '@/features/iam/iam.mock';
import {
  ButtonComponent,
  CalendarComponent,
  type CalendarDay,
  CardComponent,
  ComboboxComponent,
  type ComboboxOption,
  PageHeaderComponent,
  SelectComponent,
  type SelectOption,
  TabPanelDirective,
  TabsComponent,
  ToastService,
} from '@/shared/ui';
import { AttendanceChartComponent, type ChartMode } from './attendance-chart.component';
import { openAttendanceEditDialog } from './attendance-edit-dialog.component';
import { AttendanceStore, type AttendanceSummary } from './attendance.store';
import { ATTENDANCE_STATUS_META, type AttendanceStatus, type IAttendanceRecord } from './hr.types';

interface MatrixRow {
  userId: string;
  userLabel: string;
  cells: { date: string; record: IAttendanceRecord | null }[];
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function isoToTime(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const USER_OPTIONS: ComboboxOption<string>[] = USERS.map((u) => ({
  value: u.id,
  label: u.fullName,
  description: u.email,
}));

@Component({
  selector: 'app-attendance',
  imports: [
    AttendanceChartComponent,
    ButtonComponent,
    CalendarComponent,
    CardComponent,
    ComboboxComponent,
    FormsModule,
    PageHeaderComponent,
    SelectComponent,
    TabPanelDirective,
    TabsComponent,
  ],
  template: `
    <div class="space-y-4">
      <app-page-header
        title="Chấm công"
        description="Xem và điều chỉnh lịch sử chấm công của nhân viên."
        [breadcrumb]="breadcrumbs"
      >
        <div page-actions class="flex items-center gap-2">
          <span class="text-sm text-slate-500"> Tháng {{ month() + 1 }}, {{ year() }} </span>
          <app-button variant="secondary" size="sm" (click)="goToday()"> Hôm nay </app-button>
        </div>
      </app-page-header>

      <app-tabs [(activeTab)]="activeTab">
        <!-- ===== Tab Cá nhân ===== -->
        <ng-template appTabPanel="user" appTabPanelLabel="Cá nhân">
          <div class="grid gap-4 lg:grid-cols-[1fr_320px]">
            <div class="space-y-3">
              <app-card padding="lg">
                <div class="flex items-center gap-3">
                  <div class="flex-1">
                    <app-combobox
                      id="att-user"
                      [options]="userOptions"
                      placeholder="Chọn nhân viên..."
                      [(ngModel)]="selectedUserId"
                    />
                  </div>
                </div>
              </app-card>

              <app-calendar
                [year]="year()"
                [month]="month()"
                (monthChange)="onMonthChange($event)"
                (dayClick)="onDayClick($event)"
              >
                <ng-template let-day>
                  @if (entryByDate(); as map) {
                    @if (map.get(day.date); as entry) {
                      <div class="flex h-full min-h-16 flex-col gap-0.5">
                        <span
                          class="text-[11px]"
                          [class.text-slate-300]="!day.inMonth"
                          [class.font-semibold]="day.isToday"
                          [class.text-indigo-600]="day.isToday"
                        >
                          {{ day.day }}
                        </span>
                        @if (entry.record) {
                          <div class="flex items-center gap-1">
                            <span
                              class="h-1.5 w-1.5 rounded-full"
                              [class]="statusMeta[entry.record.status].dotClass"
                            ></span>
                            <span
                              class="text-[10px] truncate"
                              [class]="statusMeta[entry.record.status].textClass"
                            >
                              {{ statusMeta[entry.record.status].short }}
                            </span>
                          </div>
                          @if (entry.record.checkInAt) {
                            <span class="text-[10px] text-slate-500">
                              {{ formatTime(entry.record.checkInAt) }}
                              @if (entry.record.checkOutAt) {
                                <span>→ {{ formatTime(entry.record.checkOutAt) }}</span>
                              }
                            </span>
                          }
                        }
                      </div>
                    }
                  }
                </ng-template>
              </app-calendar>
            </div>

            <div class="space-y-3">
              <app-card padding="lg">
                <h3 class="mb-3 text-sm font-semibold text-slate-700">
                  Tổng kết tháng {{ month() + 1 }}/{{ year() }}
                </h3>
                @if (selectedUserId()) {
                  <ul class="space-y-2">
                    @for (s of summaryRows(); track s.status) {
                      <li class="flex items-center justify-between text-sm">
                        <span class="flex items-center gap-2 text-slate-700">
                          <span class="h-2 w-2 rounded-full" [class]="s.dotClass"></span>
                          {{ s.label }}
                        </span>
                        <span class="font-semibold text-slate-900">{{ s.count }}</span>
                      </li>
                    }
                  </ul>
                } @else {
                  <p class="text-sm text-slate-400">Chọn nhân viên để xem tổng kết.</p>
                }
              </app-card>

              <app-card padding="lg">
                <h3 class="mb-2 text-sm font-semibold text-slate-700">Chú thích</h3>
                <ul class="space-y-1.5 text-xs">
                  @for (m of legend; track m.status) {
                    <li class="flex items-center gap-2">
                      <span class="h-2 w-2 rounded-full" [class]="m.dotClass"></span>
                      <span class="text-slate-600">{{ m.label }}</span>
                    </li>
                  }
                </ul>
              </app-card>
            </div>
          </div>
        </ng-template>

        <!-- ===== Tab Tổng quan store ===== -->
        <ng-template appTabPanel="store" appTabPanelLabel="Tổng quan store">
          <app-card padding="lg" class="block">
            <div class="mb-3 flex items-center justify-between gap-3">
              <div class="flex items-center gap-2">
                @if (canSwitchTenant()) {
                  <div class="w-64">
                    <app-select
                      id="att-tenant"
                      [options]="tenantOptions()"
                      [(ngModel)]="selectedTenantId"
                    />
                  </div>
                } @else {
                  <span class="text-sm text-slate-700">
                    {{ tenantLabel() }}
                  </span>
                }
              </div>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  class="rounded border border-slate-200 p-1 text-slate-500 hover:bg-slate-50"
                  aria-label="Tháng trước"
                  (click)="shiftMonth(-1)"
                >
                  <span class="block h-4 w-4"
                    ><svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path d="m15 18-6-6 6-6" /></svg
                  ></span>
                </button>
                <span class="text-sm font-medium text-slate-900">
                  Tháng {{ month() + 1 }}, {{ year() }}
                </span>
                <button
                  type="button"
                  class="rounded border border-slate-200 p-1 text-slate-500 hover:bg-slate-50"
                  aria-label="Tháng sau"
                  (click)="shiftMonth(1)"
                >
                  <span class="block h-4 w-4"
                    ><svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path d="m9 18 6-6-6-6" /></svg
                  ></span>
                </button>
              </div>
            </div>

            <div class="overflow-auto rounded-md border border-slate-200">
              <table class="min-w-full border-collapse text-xs">
                <thead class="bg-slate-50">
                  <tr>
                    <th
                      class="sticky left-0 z-10 border-r border-slate-200 bg-slate-50 px-3 py-2 text-left font-semibold text-slate-600"
                    >
                      Nhân viên
                    </th>
                    @for (d of dayHeaders(); track d.iso) {
                      <th
                        class="w-8 border-r border-slate-100 px-1 py-2 text-center font-medium"
                        [class.text-red-500]="d.isWeekend"
                        [class.text-slate-500]="!d.isWeekend"
                      >
                        {{ d.day }}
                      </th>
                    }
                  </tr>
                </thead>
                <tbody>
                  @for (row of matrixRows(); track row.userId) {
                    <tr class="border-t border-slate-100 hover:bg-slate-50/60">
                      <td
                        class="sticky left-0 z-10 border-r border-slate-200 bg-white px-3 py-1.5 text-left text-xs font-medium text-slate-700"
                      >
                        {{ row.userLabel }}
                      </td>
                      @for (cell of row.cells; track cell.date) {
                        <td class="border-r border-slate-100 p-0">
                          <button
                            type="button"
                            class="block h-7 w-full text-[10px]"
                            [class]="cellClass(cell.record)"
                            [attr.aria-label]="cellAria(row.userLabel, cell)"
                            (click)="onMatrixClick(row.userId, cell)"
                          >
                            @if (cell.record) {
                              {{ statusMeta[cell.record.status].short }}
                            }
                          </button>
                        </td>
                      }
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            @if (matrixRows().length === 0) {
              <p class="mt-4 text-center text-sm text-slate-400">
                Không có dữ liệu chấm công cho chi nhánh này.
              </p>
            }
          </app-card>
        </ng-template>

        <!-- ===== Tab Biểu đồ ===== -->
        <ng-template appTabPanel="chart" appTabPanelLabel="Biểu đồ">
          <app-card padding="lg" class="block">
            <div class="mb-4 grid gap-3 md:grid-cols-[160px_200px_200px_1fr]">
              <div>
                <label for="chart-mode" class="mb-1 block text-xs font-medium text-slate-500">
                  Mốc thời gian
                </label>
                <app-select id="chart-mode" [options]="chartModeOptions" [(ngModel)]="chartMode" />
              </div>
              <div>
                <label for="chart-dept" class="mb-1 block text-xs font-medium text-slate-500">
                  Phòng ban
                </label>
                <app-select
                  id="chart-dept"
                  [options]="departmentOptions()"
                  [(ngModel)]="chartDepartment"
                />
              </div>
              @if (canViewAllTenants()) {
                <div>
                  <label for="chart-tenant" class="mb-1 block text-xs font-medium text-slate-500">
                    Chi nhánh
                  </label>
                  <app-select
                    id="chart-tenant"
                    [options]="tenantChartOptions()"
                    [(ngModel)]="chartTenantId"
                  />
                </div>
              } @else {
                <div>
                  <span class="mb-1 block text-xs font-medium text-slate-500">Chi nhánh</span>
                  <p
                    class="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                  >
                    {{ tenantLabel() }}
                  </p>
                </div>
              }
              <div class="flex items-end justify-end">
                @if (chartMode() === 'month') {
                  <span class="text-xs text-slate-500">
                    Theo ngày trong tháng {{ month() + 1 }}/{{ year() }}
                  </span>
                } @else {
                  <span class="text-xs text-slate-500">Theo tháng năm {{ year() }}</span>
                }
              </div>
            </div>

            <app-attendance-chart
              [mode]="chartMode()"
              [year]="year()"
              [month]="month()"
              [tenantId]="chartTenantId()"
              [department]="chartDepartment()"
            />

            <p class="mt-3 text-xs text-slate-400">
              Tỉ lệ tính trên tổng số bản ghi chấm công của phòng ban đã lọc. Các trạng thái được
              gộp như sau: <span class="font-medium">Có mặt</span> = có mặt + tăng ca + nửa ngày,
              <span class="font-medium">Trễ</span> = đi trễ, <span class="font-medium">Vắng</span>
              = vắng + nghỉ phép.
            </p>
          </app-card>
        </ng-template>
      </app-tabs>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttendanceComponent {
  private readonly store = inject(AttendanceStore);
  private readonly tenantStore = inject(TenantStore);
  private readonly authStore = inject(AuthStore);
  private readonly dialog = inject(Dialog);
  private readonly toast = inject(ToastService);

  protected readonly breadcrumbs = [
    { label: 'Nhân sự', to: '/hr/attendance' },
    { label: 'Chấm công' },
  ];

  protected readonly statusMeta = ATTENDANCE_STATUS_META;
  protected readonly userOptions = USER_OPTIONS;
  protected readonly chevronLeftIcon = LucideChevronLeft.icon;
  protected readonly chevronRightIcon = LucideChevronRight.icon;

  protected readonly activeTab = signal<string>('user');
  protected readonly selectedUserId = signal<string>(USERS[0]?.id ?? '');
  protected readonly selectedTenantId = signal<string>(this.tenantStore.currentTenant()?.id ?? '');

  private readonly today = new Date();
  protected readonly year = signal<number>(this.today.getFullYear());
  protected readonly month = signal<number>(this.today.getMonth());

  protected readonly legend = (Object.keys(ATTENDANCE_STATUS_META) as AttendanceStatus[]).map(
    (status) => ({
      status,
      label: ATTENDANCE_STATUS_META[status].label,
      dotClass: ATTENDANCE_STATUS_META[status].dotClass,
    }),
  );

  /** Resolve the IAM role ID from the auth store's roleLabel (mock current user). */
  protected readonly currentRoleId = computed<string>(() => {
    const label = this.authStore.currentUser()?.roleLabel ?? '';
    return ROLES.find((r) => r.name === label)?.id ?? 'role-staff';
  });

  protected readonly canViewAllTenants = computed(() => canViewWholeCompany(this.currentRoleId()));

  protected readonly canSwitchTenant = this.canViewAllTenants;

  protected readonly tenantOptions = computed<SelectOption<string>[]>(() =>
    this.tenantStore.tenants().map((t) => ({ value: t.id, label: t.name })),
  );

  protected readonly tenantLabel = computed(
    () => this.tenantStore.currentTenant()?.name ?? 'Chi nhánh không xác định',
  );

  // ===== Chart panel state =====
  protected readonly chartModeOptions: SelectOption<ChartMode>[] = [
    { value: 'month', label: 'Theo tháng' },
    { value: 'year', label: 'Theo năm' },
  ];

  protected readonly chartMode = signal<ChartMode>('month');
  protected readonly chartDepartment = signal<DepartmentKey | 'all'>(
    canViewWholeCompany(this.currentRoleId()) ? 'all' : departmentOfRole(this.currentRoleId()),
  );
  protected readonly chartTenantId = signal<string | 'all'>(
    canViewWholeCompany(this.currentRoleId())
      ? 'all'
      : (this.tenantStore.currentTenant()?.id ?? 'all'),
  );

  /** Department dropdown: 'Tất cả' + each known department. */
  protected readonly departmentOptions = computed<SelectOption<DepartmentKey | 'all'>[]>(() => {
    const allOption: SelectOption<DepartmentKey | 'all'> = {
      value: 'all',
      label: 'Tất cả phòng ban',
    };
    // Non-admins can only see their own department.
    if (!this.canViewAllTenants()) {
      const myDept = departmentOfRole(this.currentRoleId());
      return [{ value: myDept, label: DEPARTMENTS[myDept].label }];
    }
    const list = (Object.keys(DEPARTMENTS) as DepartmentKey[]).map((key) => ({
      value: key as DepartmentKey | 'all',
      label: DEPARTMENTS[key].label,
    }));
    return [allOption, ...list];
  });

  protected readonly tenantChartOptions = computed<SelectOption<string | 'all'>[]>(() => {
    const allOption: SelectOption<string | 'all'> = {
      value: 'all',
      label: 'Tất cả chi nhánh',
    };
    return [allOption, ...this.tenantStore.tenants().map((t) => ({ value: t.id, label: t.name }))];
  });

  protected readonly userRecords = computed(() => {
    const uid = this.selectedUserId();
    if (!uid) return [];
    return this.store.findByUser(uid, this.year(), this.month());
  });

  protected readonly entryByDate = computed(() => {
    const map = new Map<string, { record: IAttendanceRecord | null }>();
    for (const r of this.userRecords()) {
      map.set(r.date, { record: r });
    }
    return map;
  });

  protected readonly summaryRows = computed(() => {
    const uid = this.selectedUserId();
    if (!uid) return [];
    const summary: AttendanceSummary = this.store.summaryByUser(uid, this.year(), this.month());
    return (Object.keys(summary) as AttendanceStatus[]).map((status) => ({
      status,
      label: ATTENDANCE_STATUS_META[status].label,
      dotClass: ATTENDANCE_STATUS_META[status].dotClass,
      count: summary[status],
    }));
  });

  protected readonly dayHeaders = computed(() => {
    const y = this.year();
    const m = this.month();
    const days = new Date(y, m + 1, 0).getDate();
    const out: { iso: string; day: number; isWeekend: boolean }[] = [];
    for (let i = 1; i <= days; i++) {
      const d = new Date(y, m, i);
      const dow = d.getDay();
      out.push({
        iso: `${y}-${pad(m + 1)}-${pad(i)}`,
        day: i,
        isWeekend: dow === 0 || dow === 6,
      });
    }
    return out;
  });

  protected readonly matrixRows = computed<MatrixRow[]>(() => {
    const rawId = this.selectedTenantId();
    if (!rawId) return [];
    const tenantId = normalizeTenantId(rawId);
    const records = this.store.findByTenant(tenantId, this.year(), this.month());
    const headers = this.dayHeaders();
    const usersInTenant = USERS.filter((u) =>
      u.assignments.some((a) => normalizeTenantId(a.tenantId) === tenantId),
    );
    return usersInTenant.map((user) => {
      const byDate = new Map(records.filter((r) => r.userId === user.id).map((r) => [r.date, r]));
      return {
        userId: user.id,
        userLabel: user.fullName,
        cells: headers.map((h) => ({ date: h.iso, record: byDate.get(h.iso) ?? null })),
      };
    });
  });

  protected formatTime(iso: string): string {
    return isoToTime(iso);
  }

  protected onMonthChange(next: { year: number; month: number }): void {
    this.year.set(next.year);
    this.month.set(next.month);
  }

  protected shiftMonth(delta: number): void {
    const total = this.year() * 12 + this.month() + delta;
    this.year.set(Math.floor(total / 12));
    this.month.set(((total % 12) + 12) % 12);
  }

  protected goToday(): void {
    const now = new Date();
    this.year.set(now.getFullYear());
    this.month.set(now.getMonth());
  }

  protected async onDayClick(day: CalendarDay): Promise<void> {
    if (!day.inMonth) return;
    const uid = this.selectedUserId();
    if (!uid) return;
    const entry = this.entryByDate().get(day.date);
    if (!entry?.record) return;
    await this.openEditor(entry.record);
  }

  protected async onMatrixClick(
    userId: string,
    cell: { record: IAttendanceRecord | null },
  ): Promise<void> {
    if (!cell.record) return;
    this.selectedUserId.set(userId);
    await this.openEditor(cell.record);
  }

  private async openEditor(record: IAttendanceRecord): Promise<void> {
    const user = USERS.find((u) => u.id === record.userId);
    const label = user?.fullName ?? 'Nhân viên';
    const result = await openAttendanceEditDialog(this.dialog, record, label);
    if (!result) return;
    const editor = this.authStore.currentUser()?.fullName ?? 'system';
    const updated = await this.store.updateRecord(
      record.id,
      {
        checkInAt: result.checkInAt,
        checkOutAt: result.checkOutAt,
        status: result.status,
        note: result.note,
      },
      editor,
    );
    if (updated) {
      this.toast.success('Đã cập nhật chấm công.');
    }
  }

  protected cellClass(record: IAttendanceRecord | null): string {
    if (!record) return 'bg-slate-50 text-slate-300 hover:bg-slate-100';
    const meta = ATTENDANCE_STATUS_META[record.status];
    return `${meta.badgeClass} hover:opacity-80`;
  }

  protected cellAria(
    userLabel: string,
    cell: { date: string; record: IAttendanceRecord | null },
  ): string {
    const status = cell.record ? ATTENDANCE_STATUS_META[cell.record.status].label : 'Trống';
    return `${userLabel} · ${cell.date} · ${status}`;
  }
}
