import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { type ColumnDef, DataTableVirtualComponent, type SortState } from '@/shared/ui';

interface StockRow {
  id: string;
  sku: string;
  product: string;
  warehouse: string;
  qty: number;
  reorderPoint: number;
}

function buildRows(count: number): StockRow[] {
  const products = [
    'Áo thun Comforty Essential',
    'Áo polo Comforty Pique',
    'Quần jean nam regular',
    'Áo khoác bomber',
    'Váy midi nữ',
    'Áo sơ mi linen',
    'Quần short kaki',
    'Áo hoodie unisex',
  ];
  const warehouses = ['HQ', 'Q1', 'Q7', 'Thủ Đức', 'Hoàn Kiếm', 'Hải Châu'];
  return Array.from({ length: count }, (_, i) => ({
    id: `stock-${i + 1}`,
    sku: `SKU-${String(i + 1).padStart(5, '0')}`,
    product: products[i % products.length] ?? 'Sản phẩm',
    warehouse: warehouses[i % warehouses.length] ?? 'HQ',
    qty: (i * 7) % 200,
    reorderPoint: 15,
  }));
}

@Component({
  selector: 'app-virtual-table-demo',
  imports: [DataTableVirtualComponent],
  template: `
    <div class="w-[860px]">
      <p class="mb-2 text-sm text-slate-600">
        Bảng có <strong>{{ rows.length.toLocaleString('vi-VN') }}</strong> dòng — virtual scroll giữ
        DOM nhẹ.
      </p>
      <app-data-table-virtual
        tableId="vt-demo"
        [columns]="columns"
        [rows]="rows"
        [selectable]="true"
        trackByKey="id"
        [rowHeight]="44"
        [viewportHeight]="480"
        [(sort)]="sort"
        [(selection)]="selected"
      />
      <p class="mt-3 text-sm text-slate-600">
        Đang chọn: <strong>{{ selected().length }}</strong>
      </p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class VirtualTableDemo {
  protected readonly rows = buildRows(2000);
  protected readonly sort = signal<SortState | null>(null);
  protected readonly selected = signal<StockRow[]>([]);

  protected readonly columns: ColumnDef<StockRow>[] = [
    { key: 'sku', header: 'SKU', sortable: true, width: '150px' },
    { key: 'product', header: 'Sản phẩm', sortable: true },
    { key: 'warehouse', header: 'Kho', width: '120px' },
    { key: 'qty', header: 'Tồn', sortable: true, width: '90px', align: 'right' },
    { key: 'reorderPoint', header: 'Mức tồn TT', width: '110px', align: 'right' },
  ];
}

const meta: Meta<VirtualTableDemo> = {
  title: 'Data/DataTableVirtual',
  component: VirtualTableDemo,
  decorators: [moduleMetadata({ imports: [DataTableVirtualComponent] })],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<VirtualTableDemo>;

export const TwoThousandRows: Story = {
  render: () => ({
    template: `<app-virtual-table-demo />`,
    moduleMetadata: { imports: [VirtualTableDemo] },
  }),
};

export const Empty: Story = {
  render: () => ({
    props: {
      columns: [
        { key: 'sku', header: 'SKU' },
        { key: 'product', header: 'Sản phẩm' },
      ],
      rows: [],
    },
    template: `
      <div class="w-[600px]">
        <app-data-table-virtual
          tableId="vt-empty"
          [columns]="columns"
          [rows]="rows"
          emptyTitle="Chưa có dữ liệu"
          emptyDescription="Thêm record mới để bắt đầu."
        />
      </div>
    `,
    moduleMetadata: { imports: [DataTableVirtualComponent] },
  }),
};
