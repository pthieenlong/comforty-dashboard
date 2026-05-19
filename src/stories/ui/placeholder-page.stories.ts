import { provideRouter } from '@angular/router';
import { applicationConfig, type Meta, type StoryObj } from '@storybook/angular';
import { PlaceholderPageComponent } from '@/shared/ui/placeholder-page/placeholder-page.component';

const meta: Meta<PlaceholderPageComponent> = {
  title: 'UI/PlaceholderPage',
  component: PlaceholderPageComponent,
  decorators: [applicationConfig({ providers: [provideRouter([])] })],
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<PlaceholderPageComponent>;

export const Basic: Story = {
  render: () => ({
    props: {
      breadcrumb: [{ label: 'Trang chủ', to: '/dashboard' }, { label: 'Marketing' }],
    },
    template: `
      <div class="p-6">
        <app-placeholder-page
          title="Marketing"
          description="Chiến dịch, khuyến mại, mã giảm giá"
          [breadcrumb]="breadcrumb"
        />
      </div>
    `,
  }),
};

export const CustomMessage: Story = {
  render: () => ({
    props: {
      breadcrumb: [{ label: 'Trang chủ', to: '/dashboard' }, { label: 'Báo cáo' }],
    },
    template: `
      <div class="p-6">
        <app-placeholder-page
          title="Báo cáo"
          description="Báo cáo doanh số, tồn kho, hiệu suất"
          [breadcrumb]="breadcrumb"
          emptyTitle="Sắp ra mắt"
          emptyDescription="Module này dự kiến hoàn thiện trong Sprint 12."
        />
      </div>
    `,
  }),
};
