import { argsToTemplate, type Meta, type StoryObj } from '@storybook/angular';
import {
  LucideBell,
  LucideCheck,
  LucideHome,
  LucideSearch,
  LucideShieldCheck,
  LucideTrash2,
  LucideUsers,
} from '@lucide/angular';
import { IconComponent } from '@/shared/ui/icon/icon.component';

const meta: Meta<IconComponent> = {
  title: 'UI/Icon',
  component: IconComponent,
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    strokeWidth: { control: { type: 'number', min: 1, max: 3, step: 0.5 } },
  },
  args: { size: 'md', strokeWidth: 2 },
};

export default meta;
type Story = StoryObj<IconComponent>;

export const Default: Story = {
  args: { icon: LucideHome.icon },
  render: (args) => ({
    props: args,
    template: `<app-icon ${argsToTemplate(args, { exclude: ['icon'] })} [icon]="icon" />`,
  }),
};

export const AllSizes: Story = {
  render: () => ({
    props: { icon: LucideBell.icon },
    template: `
      <div class="flex items-end gap-4 text-slate-700">
        <app-icon [icon]="icon" size="xs" />
        <app-icon [icon]="icon" size="sm" />
        <app-icon [icon]="icon" size="md" />
        <app-icon [icon]="icon" size="lg" />
        <app-icon [icon]="icon" size="xl" />
      </div>
    `,
  }),
};

export const Gallery: Story = {
  render: () => ({
    props: {
      icons: [
        { icon: LucideHome.icon, label: 'Home' },
        { icon: LucideUsers.icon, label: 'Users' },
        { icon: LucideShieldCheck.icon, label: 'Roles' },
        { icon: LucideSearch.icon, label: 'Search' },
        { icon: LucideBell.icon, label: 'Bell' },
        { icon: LucideCheck.icon, label: 'Check' },
        { icon: LucideTrash2.icon, label: 'Trash' },
      ],
    },
    template: `
      <div class="grid grid-cols-4 gap-4 text-slate-700">
        @for (item of icons; track item.label) {
          <div class="flex flex-col items-center gap-2 rounded-md border border-slate-200 p-4">
            <app-icon [icon]="item.icon" size="lg" />
            <span class="text-xs text-slate-500">{{ item.label }}</span>
          </div>
        }
      </div>
    `,
  }),
};
