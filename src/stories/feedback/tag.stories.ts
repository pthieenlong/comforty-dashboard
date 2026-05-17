import type { Meta, StoryObj } from '@storybook/angular';
import { TagComponent } from '@/shared/ui/tag/tag.component';

const meta: Meta<TagComponent> = {
  title: 'Feedback/Tag',
  component: TagComponent,
  argTypes: {
    variant: {
      control: 'select',
      options: ['neutral', 'primary', 'success', 'warning', 'danger', 'info'],
    },
    removable: { control: 'boolean' },
  },
  args: { variant: 'neutral', removable: false },
};

export default meta;
type Story = StoryObj<TagComponent>;

export const AllVariants: Story = {
  render: () => ({
    template: `
      <div class="flex flex-wrap items-center gap-2">
        <app-tag variant="neutral">Neutral</app-tag>
        <app-tag variant="primary">Primary</app-tag>
        <app-tag variant="success">Success</app-tag>
        <app-tag variant="warning">Warning</app-tag>
        <app-tag variant="danger">Danger</app-tag>
        <app-tag variant="info">Info</app-tag>
      </div>
    `,
  }),
};

export const Removable: Story = {
  render: () => ({
    template: `
      <div class="flex flex-wrap gap-2">
        <app-tag variant="primary" [removable]="true" label="Hà Nội">Hà Nội</app-tag>
        <app-tag variant="primary" [removable]="true" label="TP.HCM">TP.HCM</app-tag>
        <app-tag variant="primary" [removable]="true" label="Đà Nẵng">Đà Nẵng</app-tag>
      </div>
    `,
  }),
};
