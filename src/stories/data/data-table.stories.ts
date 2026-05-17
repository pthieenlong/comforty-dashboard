import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { BadgeComponent, type ColumnDef, DataTableComponent, type SortState } from '@/shared/ui';

interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
}

const ROWS: DemoUser[] = [
  {
    id: 'u1',
    name: 'Phạm Thiện Long',
    email: 'long@comforty.vn',
    role: 'Super Admin',
    active: true,
  },
  { id: 'u2', name: 'Nguyễn Minh Anh', email: 'anh@comforty.vn', role: 'HQ Admin', active: true },
  {
    id: 'u3',
    name: 'Trần Thị Hồng',
    email: 'hong@comforty.vn',
    role: 'Store Manager',
    active: true,
  },
  { id: 'u4', name: 'Lê Quốc Bảo', email: 'bao@comforty.vn', role: 'Sales Lead', active: false },
  { id: 'u5', name: 'Hoàng Thu Hà', email: 'ha@comforty.vn', role: 'Thu ngân', active: true },
];

@Component({
  selector: 'app-table-demo',
  imports: [BadgeComponent, DataTableComponent],
  template: `
    <div class="w-[760px]">
      <app-data-table
        tableId="story-table"
        [columns]="columns"
        [rows]="sortedRows()"
        [selectable]="true"
        trackByKey="id"
        [(sort)]="sort"
        [(selection)]="selected"
      />
      <p class="mt-3 text-sm text-slate-600" data-testid="selected-count">
        Đang chọn: <strong>{{ selected().length }}</strong> / {{ rows.length }}
      </p>
    </div>

    <ng-template #statusCell let-row="row">
      @if (row.active) {
        <app-badge variant="success" [dot]="true">Hoạt động</app-badge>
      } @else {
        <app-badge variant="neutral" [dot]="true">Đã khóa</app-badge>
      }
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TableDemo {
  protected readonly rows = ROWS;
  protected readonly sort = signal<SortState | null>({ column: 'name', direction: 'asc' });
  protected readonly selected = signal<DemoUser[]>([]);

  protected readonly columns: ColumnDef<DemoUser>[] = [
    { key: 'name', header: 'Họ tên', sortable: true, width: '30%' },
    { key: 'email', header: 'Email', sortable: true, width: '30%' },
    { key: 'role', header: 'Vai trò', width: '25%' },
    { key: 'active', header: 'Trạng thái', sortable: true, width: '15%' },
  ];

  protected readonly sortedRows = () => {
    const sort = this.sort();
    if (!sort) return this.rows;
    const sorted = [...this.rows];
    sorted.sort((a, b) => {
      const av = String(a[sort.column as keyof DemoUser] ?? '');
      const bv = String(b[sort.column as keyof DemoUser] ?? '');
      const cmp = av.localeCompare(bv, 'vi');
      return sort.direction === 'asc' ? cmp : -cmp;
    });
    return sorted;
  };
}

const meta: Meta<TableDemo> = {
  title: 'Data/DataTable',
  component: TableDemo,
  decorators: [moduleMetadata({ imports: [DataTableComponent] })],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<TableDemo>;

export const Basic: Story = {
  render: () => ({ template: `<app-table-demo />`, moduleMetadata: { imports: [TableDemo] } }),
};

export const SelectAllInteraction: Story = {
  render: () => ({ template: `<app-table-demo />`, moduleMetadata: { imports: [TableDemo] } }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Initially no selection
    await waitFor(() => {
      expect(canvas.getByTestId('selected-count').textContent).toContain('0');
    });

    // Click the "select all" checkbox in the header
    const selectAll = canvasElement.querySelector(
      'thead input[type="checkbox"]',
    ) as HTMLInputElement;
    await userEvent.click(selectAll);

    await waitFor(() => {
      expect(canvas.getByTestId('selected-count').textContent).toContain(String(ROWS.length));
    });

    // Click again to deselect all
    await userEvent.click(selectAll);
    await waitFor(() => {
      expect(canvas.getByTestId('selected-count').textContent).toContain('0');
    });
  },
};

export const SortInteraction: Story = {
  render: () => ({ template: `<app-table-demo />`, moduleMetadata: { imports: [TableDemo] } }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const emailHeader = canvas.getByRole('button', { name: /email/i });
    await userEvent.click(emailHeader);

    await waitFor(() => {
      const firstRowEmail = canvasElement
        .querySelectorAll('tbody tr')[0]
        ?.querySelectorAll('td')[2]
        ?.textContent?.trim();
      expect(firstRowEmail).toBe('anh@comforty.vn');
    });

    // Click again to flip to desc
    await userEvent.click(emailHeader);
    await waitFor(() => {
      const firstRowEmail = canvasElement
        .querySelectorAll('tbody tr')[0]
        ?.querySelectorAll('td')[2]
        ?.textContent?.trim();
      expect(firstRowEmail).toBe('long@comforty.vn');
    });
  },
};

export const Empty: Story = {
  render: () => ({
    props: {
      columns: [
        { key: 'name', header: 'Tên' },
        { key: 'email', header: 'Email' },
      ],
      rows: [],
    },
    template: `
      <div class="w-[600px]">
        <app-data-table
          tableId="empty-table"
          [columns]="columns"
          [rows]="rows"
          emptyTitle="Chưa có dữ liệu"
          emptyDescription="Thêm record mới để bắt đầu."
        />
      </div>
    `,
    moduleMetadata: { imports: [DataTableComponent] },
  }),
};

export const Loading: Story = {
  render: () => ({
    props: {
      columns: [
        { key: 'name', header: 'Tên' },
        { key: 'email', header: 'Email' },
      ],
      rows: [],
    },
    template: `
      <div class="w-[600px]">
        <app-data-table
          tableId="loading-table"
          [columns]="columns"
          [rows]="rows"
          [loading]="true"
        />
      </div>
    `,
    moduleMetadata: { imports: [DataTableComponent] },
  }),
};
