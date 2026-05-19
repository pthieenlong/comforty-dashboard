import { DialogModule } from '@angular/cdk/dialog';
import {
  ChangeDetectionStrategy,
  Component,
  type TemplateRef,
  inject,
  viewChild,
} from '@angular/core';
import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular';
import { ButtonComponent, DescriptionListComponent, type DescriptionItem } from '@/shared/ui';
import { DrawerHostComponent, DrawerService } from '@/shared/ui/drawer/drawer.component';

@Component({
  selector: 'app-drawer-demo',
  imports: [ButtonComponent, DescriptionListComponent],
  template: `
    <div class="flex flex-col items-start gap-3">
      <app-button (click)="openInfo()">Mở Drawer thông tin</app-button>
      <app-button variant="secondary" (click)="openLarge()">Mở Drawer lớn</app-button>

      <ng-template #infoTpl let-data>
        <div class="space-y-3">
          <p class="text-sm text-slate-600">
            Drawer slide từ phải, có header + close button. Content nằm trong vùng scroll.
          </p>
          <app-description-list [items]="data" />
        </div>
      </ng-template>

      <ng-template #largeTpl let-data>
        <div class="space-y-3">
          <p class="text-sm text-slate-600">
            Drawer rộng (max-w-lg) dùng cho form filter hoặc detail nhiều field.
          </p>
          <ul class="space-y-2 text-sm text-slate-700">
            @for (item of data; track $index) {
              <li class="rounded border border-slate-200 px-3 py-2">{{ item }}</li>
            }
          </ul>
        </div>
      </ng-template>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class DrawerDemo {
  private readonly drawer = inject(DrawerService);
  protected readonly infoTpl = viewChild.required<TemplateRef<unknown>>('infoTpl');
  protected readonly largeTpl = viewChild.required<TemplateRef<unknown>>('largeTpl');

  protected openInfo(): void {
    const items: DescriptionItem[] = [
      { label: 'Mã đơn', value: 'ORD000123' },
      { label: 'Khách hàng', value: 'Nguyễn Thị Mai' },
      { label: 'Kênh', value: 'Online' },
      { label: 'Trạng thái', value: 'Đang giao' },
    ];
    this.drawer.open(this.infoTpl(), {
      title: 'Chi tiết đơn ORD000123',
      description: 'Xem nhanh thông tin đơn hàng',
      width: 'md',
      data: items,
    });
  }

  protected openLarge(): void {
    const items = [
      'Bộ lọc trạng thái',
      'Bộ lọc kênh bán',
      'Bộ lọc khoảng ngày',
      'Bộ lọc chi nhánh',
      'Bộ lọc khách hàng',
    ];
    this.drawer.open(this.largeTpl(), {
      title: 'Bộ lọc nâng cao',
      width: 'lg',
      data: items,
    });
  }
}

const meta: Meta<DrawerDemo> = {
  title: 'Overlay/Drawer',
  component: DrawerDemo,
  decorators: [
    moduleMetadata({
      imports: [DialogModule, DrawerHostComponent],
    }),
  ],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<DrawerDemo>;

export const Basic: Story = {
  render: () => ({
    template: `<app-drawer-demo />`,
    moduleMetadata: { imports: [DrawerDemo] },
  }),
};
