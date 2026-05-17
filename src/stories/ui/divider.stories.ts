import type { Meta, StoryObj } from '@storybook/angular';
import { DividerComponent } from '@/shared/ui/divider/divider.component';

const meta: Meta<DividerComponent> = {
  title: 'UI/Divider',
  component: DividerComponent,
};

export default meta;
type Story = StoryObj<DividerComponent>;

export const Horizontal: Story = {
  render: () => ({
    template: `
      <div class="w-96 space-y-3">
        <p class="text-sm text-slate-700">Section A</p>
        <app-divider />
        <p class="text-sm text-slate-700">Section B</p>
      </div>
    `,
  }),
};

export const Vertical: Story = {
  render: () => ({
    template: `
      <div class="flex items-center gap-3 h-8">
        <span class="text-sm">Mục 1</span>
        <app-divider orientation="vertical" />
        <span class="text-sm">Mục 2</span>
        <app-divider orientation="vertical" />
        <span class="text-sm">Mục 3</span>
      </div>
    `,
  }),
};
