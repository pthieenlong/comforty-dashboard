import { argsToTemplate, type Meta, type StoryObj } from '@storybook/angular';
import { AvatarComponent } from '@/shared/ui/avatar/avatar.component';

const meta: Meta<AvatarComponent> = {
  title: 'UI/Avatar',
  component: AvatarComponent,
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
  },
  args: { size: 'md', name: 'Phạm Thiện Long' },
};

export default meta;
type Story = StoryObj<AvatarComponent>;

export const Initials: Story = {
  render: (args) => ({
    props: args,
    template: `<app-avatar ${argsToTemplate(args)} />`,
  }),
};

export const FromImage: Story = {
  args: { src: 'https://i.pravatar.cc/150?img=12' },
  render: (args) => ({
    props: args,
    template: `<app-avatar ${argsToTemplate(args)} />`,
  }),
};

export const AllSizes: Story = {
  render: () => ({
    template: `
      <div class="flex items-end gap-3">
        <app-avatar name="Nguyễn An" size="xs" />
        <app-avatar name="Nguyễn An" size="sm" />
        <app-avatar name="Nguyễn An" size="md" />
        <app-avatar name="Nguyễn An" size="lg" />
        <app-avatar name="Nguyễn An" size="xl" />
      </div>
    `,
  }),
};
