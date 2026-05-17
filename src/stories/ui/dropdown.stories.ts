import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { LucideChevronDown, LucideLogOut, LucideSettings, LucideUser } from '@lucide/angular';
import {
  DropdownComponent,
  DropdownItemComponent,
  DropdownTriggerDirective,
  IconComponent,
} from '@/shared/ui';

const meta: Meta<DropdownComponent> = {
  title: 'UI/Dropdown',
  component: DropdownComponent,
  decorators: [
    moduleMetadata({
      imports: [DropdownItemComponent, DropdownTriggerDirective, IconComponent],
    }),
  ],
};

export default meta;
type Story = StoryObj<DropdownComponent>;

export const Basic: Story = {
  render: () => ({
    props: {
      chevronIcon: LucideChevronDown.icon,
      userIcon: LucideUser.icon,
      settingsIcon: LucideSettings.icon,
      logoutIcon: LucideLogOut.icon,
    },
    template: `
      <app-dropdown>
        <button
          appDropdownTrigger
          type="button"
          class="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50"
        >
          Mở menu
          <app-icon [icon]="chevronIcon" size="sm" />
        </button>
        <app-dropdown-item>
          <app-icon [icon]="userIcon" size="md" />
          Hồ sơ
        </app-dropdown-item>
        <app-dropdown-item>
          <app-icon [icon]="settingsIcon" size="md" />
          Cài đặt
        </app-dropdown-item>
        <app-dropdown-item [danger]="true">
          <app-icon [icon]="logoutIcon" size="md" />
          Đăng xuất
        </app-dropdown-item>
      </app-dropdown>
    `,
  }),
};

export const AlignEnd: Story = {
  render: () => ({
    props: { chevronIcon: LucideChevronDown.icon },
    template: `
      <div class="flex justify-end w-96">
        <app-dropdown align="end">
          <button
            appDropdownTrigger
            type="button"
            class="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50"
          >
            Align end
            <app-icon [icon]="chevronIcon" size="sm" />
          </button>
          <app-dropdown-item>Lựa chọn 1</app-dropdown-item>
          <app-dropdown-item>Lựa chọn 2</app-dropdown-item>
        </app-dropdown>
      </div>
    `,
  }),
};
