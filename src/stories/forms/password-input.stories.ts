import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { PasswordInputComponent } from '@/shared/ui/password-input/password-input.component';

const meta: Meta<PasswordInputComponent> = {
  title: 'Forms/PasswordInput',
  component: PasswordInputComponent,
  decorators: [moduleMetadata({ imports: [ReactiveFormsModule] })],
};

export default meta;
type Story = StoryObj<PasswordInputComponent>;

export const Default: Story = {
  render: () => ({
    props: { control: new FormControl('') },
    template: `
      <div class="w-80">
        <app-password-input id="pw" placeholder="Nhập mật khẩu" [formControl]="control" />
      </div>
    `,
  }),
};

export const Filled: Story = {
  render: () => ({
    props: { control: new FormControl('s3cretP@ssword') },
    template: `
      <div class="w-80">
        <app-password-input id="pw-filled" [formControl]="control" />
      </div>
    `,
  }),
};

export const Invalid: Story = {
  render: () => ({
    props: { control: new FormControl('123') },
    template: `
      <div class="w-80">
        <app-password-input id="pw-invalid" [invalid]="true" [formControl]="control" />
      </div>
    `,
  }),
};
