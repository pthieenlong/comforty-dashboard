import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import {
  ButtonComponent,
  CardComponent,
  CardFooterComponent,
  CardHeaderComponent,
} from '@/shared/ui';

const meta: Meta<CardComponent> = {
  title: 'UI/Card',
  component: CardComponent,
  decorators: [
    moduleMetadata({
      imports: [ButtonComponent, CardHeaderComponent, CardFooterComponent],
    }),
  ],
  argTypes: {
    padding: { control: 'select', options: ['none', 'sm', 'md', 'lg'] },
    bordered: { control: 'boolean' },
    elevated: { control: 'boolean' },
  },
  args: { padding: 'md', bordered: true, elevated: false },
};

export default meta;
type Story = StoryObj<CardComponent>;

export const Plain: Story = {
  render: (args) => ({
    props: args,
    template: `
      <app-card [padding]="padding" [bordered]="bordered" [elevated]="elevated" class="block w-96">
        <p class="text-sm text-slate-700">Nội dung card đơn giản.</p>
      </app-card>
    `,
  }),
};

export const WithHeaderFooter: Story = {
  args: { padding: 'md', elevated: true },
  render: (args) => ({
    props: args,
    template: `
      <app-card [padding]="padding" [bordered]="bordered" [elevated]="elevated" class="block w-96">
        <app-card-header
          title="Thông tin chi nhánh"
          description="Cập nhật thông tin liên hệ và địa chỉ."
        />
        <p class="text-sm text-slate-600">Chi nhánh đang hoạt động tại 5 tỉnh thành.</p>
        <app-card-footer>
          <app-button variant="secondary">Hủy</app-button>
          <app-button>Lưu thay đổi</app-button>
        </app-card-footer>
      </app-card>
    `,
  }),
};
