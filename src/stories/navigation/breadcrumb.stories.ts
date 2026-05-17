import { provideRouter } from '@angular/router';
import { applicationConfig, type Meta, type StoryObj } from '@storybook/angular';
import { BreadcrumbComponent } from '@/shared/ui/breadcrumb/breadcrumb.component';

const meta: Meta<BreadcrumbComponent> = {
  title: 'Navigation/Breadcrumb',
  component: BreadcrumbComponent,
  decorators: [applicationConfig({ providers: [provideRouter([])] })],
};

export default meta;
type Story = StoryObj<BreadcrumbComponent>;

export const TwoLevels: Story = {
  render: () => ({
    props: {
      items: [{ label: 'Hệ thống' }, { label: 'Người dùng' }],
    },
    template: `<app-breadcrumb [items]="items" />`,
  }),
};

export const WithLinks: Story = {
  render: () => ({
    props: {
      items: [
        { label: 'Hệ thống' },
        { label: 'Người dùng', to: '/iam/users' },
        { label: 'Phạm Thiện Long' },
      ],
    },
    template: `<app-breadcrumb [items]="items" />`,
  }),
};
