import { signal } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular';
import { PaginationComponent } from '@/shared/ui/pagination/pagination.component';

const meta: Meta<PaginationComponent> = {
  title: 'Navigation/Pagination',
  component: PaginationComponent,
};

export default meta;
type Story = StoryObj<PaginationComponent>;

export const FewPages: Story = {
  render: () => ({
    props: { page: signal(1) },
    template: `
      <div class="w-[600px]">
        <app-pagination [(page)]="page" [pageSize]="10" [totalItems]="35" />
      </div>
    `,
  }),
};

export const ManyPages: Story = {
  render: () => ({
    props: { page: signal(7) },
    template: `
      <div class="w-[700px]">
        <app-pagination [(page)]="page" [pageSize]="10" [totalItems]="240" />
      </div>
    `,
  }),
};

export const SinglePage: Story = {
  render: () => ({
    props: { page: signal(1) },
    template: `
      <div class="w-[500px]">
        <app-pagination [(page)]="page" [pageSize]="10" [totalItems]="5" />
      </div>
    `,
  }),
};
