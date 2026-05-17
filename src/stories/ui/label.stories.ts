import type { Meta, StoryObj } from '@storybook/angular';
import { LabelComponent } from '@/shared/ui/label/label.component';

const meta: Meta<LabelComponent> = {
  title: 'UI/Label',
  component: LabelComponent,
};

export default meta;
type Story = StoryObj<LabelComponent>;

export const Default: Story = {
  render: () => ({
    template: `<app-label for="demo">Họ và tên</app-label>`,
  }),
};

export const Required: Story = {
  render: () => ({
    template: `<app-label for="demo" [required]="true">Email</app-label>`,
  }),
};
