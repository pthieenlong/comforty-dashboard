import { provideRouter } from '@angular/router';
import { applicationConfig, moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { LucideHome, LucideShoppingCart } from '@lucide/angular';
import { IconComponent, NavLinkComponent } from '@/shared/ui';

const meta: Meta<NavLinkComponent> = {
  title: 'UI/NavLink',
  component: NavLinkComponent,
  decorators: [
    applicationConfig({
      providers: [provideRouter([])],
    }),
    moduleMetadata({
      imports: [IconComponent],
    }),
  ],
};

export default meta;
type Story = StoryObj<NavLinkComponent>;

export const Default: Story = {
  render: () => ({
    props: {
      homeIcon: LucideHome.icon,
      orderIcon: LucideShoppingCart.icon,
    },
    template: `
      <div class="w-64 space-y-1 rounded-md border border-slate-200 bg-white p-2">
        <app-nav-link to="/dashboard">
          <app-icon nav-icon [icon]="homeIcon" size="lg" />
          Dashboard
        </app-nav-link>
        <app-nav-link to="/orders">
          <app-icon nav-icon [icon]="orderIcon" size="lg" />
          Đơn hàng
        </app-nav-link>
      </div>
    `,
  }),
};

export const Collapsed: Story = {
  render: () => ({
    props: {
      homeIcon: LucideHome.icon,
      orderIcon: LucideShoppingCart.icon,
    },
    template: `
      <div class="w-16 space-y-1 rounded-md border border-slate-200 bg-white p-2">
        <app-nav-link to="/dashboard" [collapsed]="true">
          <app-icon nav-icon [icon]="homeIcon" size="lg" />
          Dashboard
        </app-nav-link>
        <app-nav-link to="/orders" [collapsed]="true">
          <app-icon nav-icon [icon]="orderIcon" size="lg" />
          Đơn hàng
        </app-nav-link>
      </div>
    `,
  }),
};
