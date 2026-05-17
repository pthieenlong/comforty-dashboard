import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { NgxSonnerToaster } from 'ngx-sonner';
import { ButtonComponent, ToastService } from '@/shared/ui';

@Component({
  selector: 'app-toast-demo',
  imports: [ButtonComponent, NgxSonnerToaster],
  template: `
    <div class="flex flex-wrap gap-2">
      <app-button (click)="toast.success('Lưu thành công', 'Người dùng đã được tạo.')">
        Success
      </app-button>
      <app-button
        variant="secondary"
        (click)="toast.info('Đang xử lý', 'Hệ thống sẽ phản hồi trong giây lát.')"
      >
        Info
      </app-button>
      <app-button variant="ghost" (click)="toast.warning('Tồn kho thấp', 'Sản phẩm sắp hết hàng.')">
        Warning
      </app-button>
      <app-button variant="danger" (click)="toast.error('Có lỗi xảy ra', 'Không thể lưu dữ liệu.')">
        Error
      </app-button>
    </div>
    <ngx-sonner-toaster position="top-right" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ToastDemoComponent {
  protected readonly toast = inject(ToastService);
}

const meta: Meta<ToastDemoComponent> = {
  title: 'Feedback/Toast',
  component: ToastDemoComponent,
  decorators: [moduleMetadata({ imports: [ButtonComponent, NgxSonnerToaster] })],
};

export default meta;
type Story = StoryObj<ToastDemoComponent>;

export const AllVariants: Story = {};
