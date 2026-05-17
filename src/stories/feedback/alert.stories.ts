import type { Meta, StoryObj } from '@storybook/angular';
import { AlertComponent } from '@/shared/ui/alert/alert.component';

const meta: Meta<AlertComponent> = {
  title: 'Feedback/Alert',
  component: AlertComponent,
  argTypes: {
    variant: { control: 'select', options: ['success', 'warning', 'danger', 'info'] },
    dismissible: { control: 'boolean' },
  },
  args: { variant: 'info', dismissible: false },
};

export default meta;
type Story = StoryObj<AlertComponent>;

export const Info: Story = {
  args: { variant: 'info', title: 'Thông tin' },
  render: (args) => ({
    props: args,
    template: `
      <div class="w-96">
        <app-alert [variant]="variant" [title]="title" [dismissible]="dismissible">
          Hệ thống sẽ bảo trì lúc 23:00 hôm nay.
        </app-alert>
      </div>
    `,
  }),
};

export const Success: Story = {
  args: { variant: 'success', title: 'Lưu thành công' },
  render: (args) => ({
    props: args,
    template: `
      <div class="w-96">
        <app-alert [variant]="variant" [title]="title">Người dùng đã được tạo.</app-alert>
      </div>
    `,
  }),
};

export const Warning: Story = {
  args: { variant: 'warning', title: 'Cảnh báo' },
  render: (args) => ({
    props: args,
    template: `
      <div class="w-96">
        <app-alert [variant]="variant" [title]="title">
          Tồn kho sản phẩm sắp dưới mức cảnh báo.
        </app-alert>
      </div>
    `,
  }),
};

export const Danger: Story = {
  args: { variant: 'danger', title: 'Có lỗi xảy ra' },
  render: (args) => ({
    props: args,
    template: `
      <div class="w-96">
        <app-alert [variant]="variant" [title]="title">
          Không thể kết nối tới máy chủ. Vui lòng thử lại.
        </app-alert>
      </div>
    `,
  }),
};

export const Dismissible: Story = {
  args: { variant: 'info', dismissible: true },
  render: (args) => ({
    props: args,
    template: `
      <div class="w-96">
        <app-alert [variant]="variant" [dismissible]="dismissible">
          Bạn có thể đóng thông báo này.
        </app-alert>
      </div>
    `,
  }),
};
