import type { Meta, StoryObj } from '@storybook/angular';
import { SkeletonComponent } from '@/shared/ui/skeleton/skeleton.component';

const meta: Meta<SkeletonComponent> = {
  title: 'Feedback/Skeleton',
  component: SkeletonComponent,
};

export default meta;
type Story = StoryObj<SkeletonComponent>;

export const TextLines: Story = {
  render: () => ({
    template: `
      <div class="w-96 space-y-2">
        <app-skeleton width="100%" height="14px" />
        <app-skeleton width="80%" height="14px" />
        <app-skeleton width="60%" height="14px" />
      </div>
    `,
  }),
};

export const Avatar: Story = {
  render: () => ({
    template: `
      <div class="flex items-center gap-3">
        <app-skeleton shape="circle" width="40px" height="40px" />
        <div class="flex-1 space-y-1.5">
          <app-skeleton width="50%" height="14px" />
          <app-skeleton width="30%" height="12px" />
        </div>
      </div>
    `,
  }),
};

export const Card: Story = {
  render: () => ({
    template: `
      <div class="w-72 space-y-3 rounded-lg border border-slate-200 bg-white p-4">
        <app-skeleton width="80%" height="20px" />
        <app-skeleton width="100%" height="120px" />
        <app-skeleton width="60%" height="14px" />
      </div>
    `,
  }),
};
