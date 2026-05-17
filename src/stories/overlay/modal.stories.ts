import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ButtonComponent, FormFieldComponent, InputComponent, ModalComponent } from '@/shared/ui';

@Component({
  selector: 'app-inline-modal-demo',
  imports: [ButtonComponent, FormFieldComponent, InputComponent, ModalComponent],
  template: `
    @if (open()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
        data-testid="modal-backdrop"
      >
        <app-modal
          title="Tạo người dùng mới"
          description="Điền các thông tin bắt buộc bên dưới."
          size="md"
          [dismissible]="false"
        >
          <app-form-field for="m-email" label="Email" [required]="true">
            <app-input id="m-email" type="email" placeholder="ten@comforty.vn" />
          </app-form-field>
          <ng-container modal-footer>
            <app-button variant="secondary" (click)="close()">Hủy</app-button>
            <app-button data-testid="modal-confirm" (click)="close()">Tạo</app-button>
          </ng-container>
        </app-modal>
      </div>
    }

    <app-button data-testid="open-modal" (click)="open.set(true)">Mở modal</app-button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class InlineModalDemo {
  protected readonly open = signal(false);
  protected close(): void {
    this.open.set(false);
  }
}

@Component({
  selector: 'app-cdk-modal-demo',
  imports: [ButtonComponent],
  template: `<app-button (click)="openCdk()">Mở CDK Dialog</app-button>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class CdkModalDemo {
  private readonly dialog = inject(Dialog);

  openCdk(): void {
    this.dialog.open(InlineModalDemo, {
      panelClass: ['flex', 'items-center', 'justify-center', 'p-4'],
      backdropClass: 'bg-slate-900/40',
    });
  }
}

const meta: Meta<InlineModalDemo> = {
  title: 'Overlay/Modal',
  component: InlineModalDemo,
  decorators: [
    moduleMetadata({
      imports: [DialogModule, ButtonComponent],
    }),
  ],
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<InlineModalDemo>;

export const Basic: Story = {
  render: () => ({
    template: `<div class="p-8"><app-inline-modal-demo /></div>`,
    moduleMetadata: { imports: [InlineModalDemo] },
  }),
};

export const OpenViaCdkDialog: Story = {
  render: () => ({
    template: `<div class="p-8"><app-cdk-modal-demo /></div>`,
    moduleMetadata: { imports: [CdkModalDemo] },
  }),
};

export const OpenAndCloseFlow: Story = {
  render: () => ({
    template: `<div class="p-8"><app-inline-modal-demo /></div>`,
    moduleMetadata: { imports: [InlineModalDemo] },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const trigger = canvas.getByTestId('open-modal');
    await userEvent.click(trigger);

    await waitFor(() => {
      expect(canvas.getByText('Tạo người dùng mới')).toBeInTheDocument();
    });

    await userEvent.click(canvas.getByTestId('modal-confirm'));

    await waitFor(() => {
      expect(canvas.queryByText('Tạo người dùng mới')).not.toBeInTheDocument();
    });
  },
};
