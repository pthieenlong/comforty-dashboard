import { argsToTemplate, type Meta, type StoryObj } from '@storybook/angular';
import { ButtonComponent } from '@/shared/ui/button/button.component';

const meta: Meta<ButtonComponent> = {
  title: 'UI/Button',
  component: ButtonComponent,
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'danger', 'link'],
    },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    type: { control: 'select', options: ['button', 'submit', 'reset'] },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
    block: { control: 'boolean' },
  },
  args: {
    variant: 'primary',
    size: 'md',
    disabled: false,
    loading: false,
    block: false,
  },
};

export default meta;
type Story = StoryObj<ButtonComponent>;

export const Primary: Story = {
  render: (args) => ({
    props: args,
    template: `<app-button ${argsToTemplate(args)}>Đăng nhập</app-button>`,
  }),
};

export const Secondary: Story = {
  args: { variant: 'secondary' },
  render: (args) => ({
    props: args,
    template: `<app-button ${argsToTemplate(args)}>Hủy</app-button>`,
  }),
};

export const Danger: Story = {
  args: { variant: 'danger' },
  render: (args) => ({
    props: args,
    template: `<app-button ${argsToTemplate(args)}>Xóa người dùng</app-button>`,
  }),
};

export const Ghost: Story = {
  args: { variant: 'ghost' },
  render: (args) => ({
    props: args,
    template: `<app-button ${argsToTemplate(args)}>Hành động phụ</app-button>`,
  }),
};

export const Link: Story = {
  args: { variant: 'link' },
  render: (args) => ({
    props: args,
    template: `<app-button ${argsToTemplate(args)}>Đọc thêm</app-button>`,
  }),
};

export const Loading: Story = {
  args: { loading: true },
  render: (args) => ({
    props: args,
    template: `<app-button ${argsToTemplate(args)}>Đang lưu</app-button>`,
  }),
};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div class="flex items-center gap-3">
        <app-button size="sm">Nhỏ</app-button>
        <app-button size="md">Vừa</app-button>
        <app-button size="lg">Lớn</app-button>
      </div>
    `,
  }),
};

export const Block: Story = {
  args: { block: true },
  decorators: [
    (storyFn) => ({ ...storyFn(), template: `<div class="w-96">${storyFn().template}</div>` }),
  ],
  render: (args) => ({
    props: args,
    template: `<app-button ${argsToTemplate(args)}>Submit</app-button>`,
  }),
};
