import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { LucideSearchX } from '@lucide/angular';
import { ButtonComponent, EmptyStateComponent } from '@/shared/ui';

const meta: Meta<EmptyStateComponent> = {
  title: 'Feedback/EmptyState',
  component: EmptyStateComponent,
  decorators: [moduleMetadata({ imports: [ButtonComponent] })],
};

export default meta;
type Story = StoryObj<EmptyStateComponent>;

export const Default: Story = {
  render: () => ({
    template: `
      <div class="w-96 rounded-lg border border-slate-200 bg-white">
        <app-empty-state
          title="Chưa có người dùng nào"
          description="Bắt đầu bằng cách tạo người dùng đầu tiên cho hệ thống."
        >
          <app-button>Thêm người dùng</app-button>
        </app-empty-state>
      </div>
    `,
  }),
};

export const CustomIcon: Story = {
  render: () => ({
    props: { searchIcon: LucideSearchX.icon },
    template: `
      <div class="w-96 rounded-lg border border-slate-200 bg-white">
        <app-empty-state
          [icon]="searchIcon"
          title="Không tìm thấy kết quả"
          description="Thử thay đổi từ khóa tìm kiếm hoặc xóa bộ lọc."
        />
      </div>
    `,
  }),
};
