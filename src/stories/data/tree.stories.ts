import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { TreeComponent, type TreeNode } from '@/shared/ui/tree/tree.component';

const CATEGORY_TREE: TreeNode<{ count: number }>[] = [
  {
    id: 'men',
    label: 'Nam',
    data: { count: 12 },
    children: [
      {
        id: 'men-top',
        label: 'Áo',
        data: { count: 6 },
        children: [
          { id: 'men-tshirt', label: 'Áo thun', data: { count: 4 }, children: [] },
          { id: 'men-shirt', label: 'Áo sơ mi', data: { count: 2 }, children: [] },
        ],
      },
      {
        id: 'men-bottom',
        label: 'Quần',
        data: { count: 6 },
        children: [
          { id: 'men-jean', label: 'Quần jean', data: { count: 3 }, children: [] },
          { id: 'men-kaki', label: 'Quần kaki', data: { count: 3 }, children: [] },
        ],
      },
    ],
  },
  {
    id: 'women',
    label: 'Nữ',
    data: { count: 8 },
    children: [
      { id: 'women-dress', label: 'Đầm', data: { count: 4 }, children: [] },
      { id: 'women-skirt', label: 'Chân váy', data: { count: 4 }, children: [] },
    ],
  },
  { id: 'kids', label: 'Trẻ em', data: { count: 5 }, children: [] },
];

@Component({
  selector: 'app-tree-demo',
  imports: [TreeComponent],
  template: `
    <div class="w-72 rounded-md border border-slate-200 bg-white p-2">
      <app-tree [nodes]="nodes" [(selectedId)]="selectedId" [defaultExpanded]="true" />
    </div>
    <p class="mt-2 text-xs text-slate-500">Đang chọn: {{ selectedId() ?? '—' }}</p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TreeDemo {
  protected readonly nodes = CATEGORY_TREE;
  protected readonly selectedId = signal<string | null>('men-tshirt');
}

@Component({
  selector: 'app-tree-custom-template-demo',
  imports: [TreeComponent],
  template: `
    <div class="w-72 rounded-md border border-slate-200 bg-white p-2">
      <app-tree [nodes]="nodes" [(selectedId)]="selectedId">
        <ng-template let-node="node">
          <div class="flex items-center justify-between gap-2">
            <span class="text-sm text-slate-900 truncate">{{ node.label }}</span>
            <span class="text-xs text-slate-400">{{ node.data.count }}</span>
          </div>
        </ng-template>
      </app-tree>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TreeCustomTemplateDemo {
  protected readonly nodes = CATEGORY_TREE;
  protected readonly selectedId = signal<string | null>(null);
}

const meta: Meta = {
  title: 'Data/Tree',
  parameters: { layout: 'padded' },
  decorators: [moduleMetadata({ imports: [TreeComponent] })],
};

export default meta;
type Story = StoryObj;

export const Basic: Story = {
  render: () => ({ template: `<app-tree-demo />`, moduleMetadata: { imports: [TreeDemo] } }),
};

export const CustomRowTemplate: Story = {
  render: () => ({
    template: `<app-tree-custom-template-demo />`,
    moduleMetadata: { imports: [TreeCustomTemplateDemo] },
  }),
};
