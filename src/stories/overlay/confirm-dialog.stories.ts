import { DialogModule } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { ButtonComponent, ConfirmDialogService } from '@/shared/ui';

@Component({
  selector: 'app-confirm-demo',
  imports: [ButtonComponent],
  template: `
    <div class="flex flex-col gap-3 items-start">
      <app-button variant="danger" data-testid="open-danger" (click)="openDanger()">
        Xóa mục
      </app-button>
      <app-button data-testid="open-primary" (click)="openPrimary()"> Lưu thay đổi </app-button>
      <p class="text-sm text-slate-600" data-testid="result">
        Kết quả: <span class="font-semibold">{{ lastResult() }}</span>
      </p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ConfirmDemo {
  private readonly confirm = inject(ConfirmDialogService);
  protected readonly lastResult = signal<string>('—');

  protected async openDanger(): Promise<void> {
    const ok = await this.confirm.confirm({
      title: 'Xóa mục này?',
      message: 'Hành động không thể hoàn tác. Bạn có chắc chắn muốn xóa?',
      confirmText: 'Xóa',
      variant: 'danger',
    });
    this.lastResult.set(ok ? 'Đã xóa' : 'Đã hủy');
  }

  protected async openPrimary(): Promise<void> {
    const ok = await this.confirm.confirm({
      title: 'Lưu thay đổi?',
      message: 'Các thay đổi sẽ được áp dụng ngay lập tức.',
      confirmText: 'Lưu',
    });
    this.lastResult.set(ok ? 'Đã lưu' : 'Hủy lưu');
  }
}

const meta: Meta<ConfirmDemo> = {
  title: 'Overlay/ConfirmDialog',
  component: ConfirmDemo,
  decorators: [
    moduleMetadata({
      imports: [DialogModule],
    }),
  ],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<ConfirmDemo>;

export const Variants: Story = {
  render: () => ({ template: `<app-confirm-demo />`, moduleMetadata: { imports: [ConfirmDemo] } }),
};
