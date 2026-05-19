import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import {
  DescriptionListComponent,
  type DescriptionItem,
} from '@/shared/ui/description-list/description-list.component';

const tenantItems: DescriptionItem[] = [
  { label: 'Mã', value: 'Q1' },
  { label: 'Tên', value: 'Chi nhánh Quận 1' },
  { label: 'Loại', value: 'Store' },
  { label: 'Trạng thái', value: 'Hoạt động' },
  { label: 'Thành phố', value: 'TP. Hồ Chí Minh' },
  { label: 'Quản lý', value: 'Nguyễn Thị Hằng', hint: 'Phụ trách từ 03/2019' },
  { label: 'SĐT', value: '028 3914 1122' },
  { label: 'Email', value: 'q1@comforty.vn' },
  { label: 'Số kho', value: 1 },
  { label: 'Số NV', value: 6 },
];

const sparseItems: DescriptionItem[] = [
  { label: 'Mã đơn', value: 'ORD000123' },
  { label: 'Khách hàng', value: 'Nguyễn Thị Mai' },
  { label: 'Ghi chú', value: null },
  { label: 'Mã vận đơn', value: '' },
];

const meta: Meta<DescriptionListComponent> = {
  title: 'UI/DescriptionList',
  component: DescriptionListComponent,
  parameters: { layout: 'padded' },
  decorators: [moduleMetadata({ imports: [DescriptionListComponent] })],
};

export default meta;
type Story = StoryObj<DescriptionListComponent>;

export const TwoColumns: Story = {
  render: () => ({
    props: { items: tenantItems },
    template: `
      <div class="w-[640px] rounded-md border border-slate-200 bg-white p-5">
        <app-description-list [items]="items" [columns]="2" />
      </div>
    `,
  }),
};

export const ThreeColumns: Story = {
  render: () => ({
    props: { items: tenantItems },
    template: `
      <div class="w-[900px] rounded-md border border-slate-200 bg-white p-5">
        <app-description-list [items]="items" [columns]="3" />
      </div>
    `,
  }),
};

export const Stacked: Story = {
  render: () => ({
    props: { items: tenantItems.slice(0, 5) },
    template: `
      <div class="w-[420px] rounded-md border border-slate-200 bg-white p-5">
        <app-description-list [items]="items" layout="stack" />
      </div>
    `,
  }),
};

export const EmptyValues: Story = {
  render: () => ({
    props: { items: sparseItems },
    template: `
      <div class="w-[480px] rounded-md border border-slate-200 bg-white p-5">
        <app-description-list [items]="items" [columns]="2" />
      </div>
    `,
  }),
};
