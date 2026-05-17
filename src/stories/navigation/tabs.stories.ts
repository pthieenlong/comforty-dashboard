import { signal } from '@angular/core';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { TabPanelDirective, TabsComponent } from '@/shared/ui';

const meta: Meta<TabsComponent> = {
  title: 'Navigation/Tabs',
  component: TabsComponent,
  decorators: [moduleMetadata({ imports: [TabPanelDirective] })],
};

export default meta;
type Story = StoryObj<TabsComponent>;

export const Default: Story = {
  render: () => ({
    props: { activeTab: signal('info') },
    template: `
      <div class="w-[640px]">
        <app-tabs [(activeTab)]="activeTab">
          <ng-template appTabPanel="info" appTabPanelLabel="Thông tin">
            <p class="text-sm text-slate-700">Tab nội dung Thông tin.</p>
          </ng-template>
          <ng-template appTabPanel="roles" appTabPanelLabel="Vai trò">
            <p class="text-sm text-slate-700">Tab nội dung Vai trò.</p>
          </ng-template>
          <ng-template appTabPanel="activity" appTabPanelLabel="Hoạt động">
            <p class="text-sm text-slate-700">Tab nội dung Hoạt động.</p>
          </ng-template>
        </app-tabs>
      </div>
    `,
  }),
};
