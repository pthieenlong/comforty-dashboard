import { argsToTemplate, type Meta, type StoryObj } from '@storybook/angular';
import { SpinnerComponent } from '@/shared/ui/spinner/spinner.component';

const meta: Meta<SpinnerComponent> = {
  title: 'UI/Spinner',
  component: SpinnerComponent,
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
  args: { size: 'md', label: 'Đang tải' },
};

export default meta;
type Story = StoryObj<SpinnerComponent>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `<span class="text-indigo-600"><app-spinner ${argsToTemplate(args)} /></span>`,
  }),
};

export const AllSizes: Story = {
  render: () => ({
    template: `
      <div class="flex items-end gap-4 text-indigo-600">
        <app-spinner size="sm" />
        <app-spinner size="md" />
        <app-spinner size="lg" />
      </div>
    `,
  }),
};
