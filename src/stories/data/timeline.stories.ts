import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { LucideCheckCircle2, LucidePackage, LucideTruck, LucideUserPlus } from '@lucide/angular';
import { TimelineComponent, type TimelineEntry } from '@/shared/ui/timeline/timeline.component';

const orderEvents: TimelineEntry[] = [
  {
    id: '1',
    title: 'Tạo đơn',
    description: 'Đơn ORD000123 được tạo bởi staff Nguyễn Thị Mai',
    timestamp: '2026-05-17T08:30:00Z',
    variant: 'neutral',
    icon: LucideUserPlus.icon,
  },
  {
    id: '2',
    title: 'Xác nhận đơn',
    description: 'Đã xác nhận thông tin và phương thức thanh toán',
    timestamp: '2026-05-17T09:00:00Z',
    variant: 'info',
    icon: LucideCheckCircle2.icon,
  },
  {
    id: '3',
    title: 'Đóng gói',
    description: 'Kho Quận 1 đóng gói 3 sản phẩm',
    timestamp: '2026-05-17T11:15:00Z',
    variant: 'warning',
    icon: LucidePackage.icon,
  },
  {
    id: '4',
    title: 'Giao cho vận chuyển',
    description: 'GHN nhận đơn — mã TN12345',
    timestamp: '2026-05-17T14:00:00Z',
    variant: 'success',
    icon: LucideTruck.icon,
  },
];

const loyaltyEvents: TimelineEntry[] = [
  {
    id: 'e1',
    title: 'Tích 120 điểm',
    description: 'Từ đơn ORD000088',
    timestamp: '2026-05-10T10:00:00Z',
    variant: 'success',
  },
  {
    id: 'e2',
    title: 'Đổi voucher 50.000₫',
    description: '-500 điểm',
    timestamp: '2026-04-25T15:30:00Z',
    variant: 'warning',
  },
  {
    id: 'e3',
    title: 'Điểm thưởng sinh nhật',
    description: '+200 điểm',
    timestamp: '2026-04-12T00:00:00Z',
    variant: 'info',
  },
];

const meta: Meta<TimelineComponent> = {
  title: 'Data/Timeline',
  component: TimelineComponent,
  decorators: [moduleMetadata({ imports: [TimelineComponent] })],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<TimelineComponent>;

export const OrderFlow: Story = {
  render: () => ({
    props: { entries: orderEvents },
    template: `
      <div class="w-[480px]">
        <app-timeline [entries]="entries" />
      </div>
    `,
  }),
};

export const LoyaltyEvents: Story = {
  render: () => ({
    props: { entries: loyaltyEvents },
    template: `
      <div class="w-[480px]">
        <app-timeline [entries]="entries" />
      </div>
    `,
  }),
};

export const NoIcons: Story = {
  render: () => ({
    props: {
      entries: orderEvents.map((e) => ({ ...e, icon: undefined })),
    },
    template: `
      <div class="w-[480px]">
        <app-timeline [entries]="entries" />
      </div>
    `,
  }),
};
