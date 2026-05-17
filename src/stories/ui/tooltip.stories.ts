import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { ButtonComponent, TooltipDirective } from '@/shared/ui';

const meta: Meta<TooltipDirective> = {
  title: 'UI/Tooltip',
  component: TooltipDirective,
  decorators: [
    moduleMetadata({
      imports: [ButtonComponent],
    }),
  ],
};

export default meta;
type Story = StoryObj<TooltipDirective>;

export const FourPositions: Story = {
  render: () => ({
    template: `
      <div class="grid grid-cols-2 gap-6 p-12">
        <app-button appTooltip="Tooltip ở trên" appTooltipPosition="top">Top</app-button>
        <app-button appTooltip="Tooltip ở dưới" appTooltipPosition="bottom">Bottom</app-button>
        <app-button appTooltip="Tooltip bên trái" appTooltipPosition="left">Left</app-button>
        <app-button appTooltip="Tooltip bên phải" appTooltipPosition="right">Right</app-button>
      </div>
    `,
  }),
};
