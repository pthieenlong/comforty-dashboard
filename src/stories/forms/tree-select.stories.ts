import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { TreeSelectComponent } from '@/shared/ui/tree/tree-select.component';
import type { TreeNode } from '@/shared/ui/tree/tree.component';

const NODES: TreeNode<unknown>[] = [
  {
    id: 'men',
    label: 'Nam',
    data: null,
    children: [
      {
        id: 'men-top',
        label: 'Áo',
        data: null,
        children: [
          { id: 'men-tshirt', label: 'Áo thun', data: null, children: [] },
          { id: 'men-shirt', label: 'Áo sơ mi', data: null, children: [] },
        ],
      },
      {
        id: 'men-bottom',
        label: 'Quần',
        data: null,
        children: [
          { id: 'men-jean', label: 'Quần jean', data: null, children: [] },
          { id: 'men-kaki', label: 'Quần kaki', data: null, children: [] },
        ],
      },
    ],
  },
  {
    id: 'women',
    label: 'Nữ',
    data: null,
    children: [
      { id: 'women-dress', label: 'Đầm', data: null, children: [] },
      { id: 'women-skirt', label: 'Chân váy', data: null, children: [] },
    ],
  },
];

const meta: Meta<TreeSelectComponent> = {
  title: 'Forms/TreeSelect',
  component: TreeSelectComponent,
  decorators: [moduleMetadata({ imports: [ReactiveFormsModule] })],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<TreeSelectComponent>;

export const Basic: Story = {
  render: () => ({
    props: { nodes: NODES, control: new FormControl<string | null>('men-tshirt') },
    template: `
      <div class="w-80">
        <app-tree-select
          id="ts-basic"
          [nodes]="nodes"
          placeholder="Chọn danh mục"
          [formControl]="control"
        />
        <p class="mt-2 text-xs text-slate-500">ID: {{ control.value ?? '—' }}</p>
      </div>
    `,
  }),
};

export const Invalid: Story = {
  render: () => ({
    props: { nodes: NODES, control: new FormControl<string | null>(null) },
    template: `
      <div class="w-80">
        <app-tree-select
          id="ts-invalid"
          [nodes]="nodes"
          placeholder="Bắt buộc chọn danh mục"
          [invalid]="true"
          [formControl]="control"
        />
      </div>
    `,
  }),
};
