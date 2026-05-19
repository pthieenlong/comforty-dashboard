import { provideRouter } from '@angular/router';
import { applicationConfig, type Meta, type StoryObj } from '@storybook/angular';
import { ButtonComponent } from '@/shared/ui/button/button.component';
import { PageHeaderComponent } from '@/shared/ui/page-header/page-header.component';

const meta: Meta<PageHeaderComponent> = {
  title: 'UI/PageHeader',
  component: PageHeaderComponent,
  decorators: [applicationConfig({ providers: [provideRouter([])] })],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<PageHeaderComponent>;

export const TitleOnly: Story = {
  render: () => ({
    template: `<app-page-header title="Người dùng" />`,
  }),
};

export const WithDescription: Story = {
  render: () => ({
    template: `
      <app-page-header
        title="Người dùng"
        description="Quản lý tài khoản trong hệ thống Comforty"
      />
    `,
  }),
};

export const WithBreadcrumbAndActions: Story = {
  render: () => ({
    props: {
      breadcrumb: [
        { label: 'Hệ thống' },
        { label: 'Người dùng', to: '/iam/users' },
        { label: 'Phạm Thiện Long' },
      ],
    },
    template: `
      <app-page-header
        title="Phạm Thiện Long"
        description="Super Admin · long@comforty.vn"
        [breadcrumb]="breadcrumb"
      >
        <div page-actions class="flex gap-2">
          <app-button variant="secondary">Khoá tài khoản</app-button>
          <app-button>Chỉnh sửa</app-button>
        </div>
      </app-page-header>
    `,
    moduleMetadata: { imports: [ButtonComponent] },
  }),
};
