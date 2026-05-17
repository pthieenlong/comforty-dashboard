import { argsToTemplate, type Meta, type StoryObj } from '@storybook/angular';
import { BadgeComponent } from '@/shared/ui/badge/badge.component';

const meta: Meta<BadgeComponent> = {
  title: 'UI/Badge',
  component: BadgeComponent,
  argTypes: {
    variant: {
      control: 'select',
      options: ['neutral', 'primary', 'success', 'warning', 'danger', 'info'],
    },
    size: { control: 'select', options: ['sm', 'md'] },
    dot: { control: 'boolean' },
  },
  args: { variant: 'neutral', size: 'md', dot: false },
};

export default meta;
type Story = StoryObj<BadgeComponent>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `<app-badge ${argsToTemplate(args)}>Badge text</app-badge>`,
  }),
};

export const AllVariants: Story = {
  render: () => ({
    template: `
      <div class="flex flex-wrap items-center gap-2">
        <app-badge variant="neutral">Neutral</app-badge>
        <app-badge variant="primary">Primary</app-badge>
        <app-badge variant="success">Hoạt động</app-badge>
        <app-badge variant="warning">Chờ xử lý</app-badge>
        <app-badge variant="danger">Hủy</app-badge>
        <app-badge variant="info">Mới</app-badge>
      </div>
    `,
  }),
};

export const WithDot: Story = {
  render: () => ({
    template: `
      <div class="flex flex-wrap items-center gap-2">
        <app-badge variant="success" [dot]="true">Hoạt động</app-badge>
        <app-badge variant="warning" [dot]="true">Chờ xử lý</app-badge>
        <app-badge variant="danger" [dot]="true">Đã khóa</app-badge>
      </div>
    `,
  }),
};
