import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { CheckboxComponent } from '@/shared/ui/checkbox/checkbox.component';

const meta: Meta<CheckboxComponent> = {
  title: 'Forms/Checkbox',
  component: CheckboxComponent,
  decorators: [moduleMetadata({ imports: [ReactiveFormsModule] })],
};

export default meta;
type Story = StoryObj<CheckboxComponent>;

export const Default: Story = {
  render: () => ({
    props: { control: new FormControl(false) },
    template: `<app-checkbox id="cb-default" label="Ghi nhớ đăng nhập" [formControl]="control" />`,
  }),
};

export const Checked: Story = {
  render: () => ({
    props: { control: new FormControl(true) },
    template: `<app-checkbox id="cb-checked" label="Đồng ý điều khoản" [formControl]="control" />`,
  }),
};

export const Indeterminate: Story = {
  render: () => ({
    props: { control: new FormControl(false) },
    template: `<app-checkbox id="cb-ind" label="Chọn tất cả" [indeterminate]="true" [formControl]="control" />`,
  }),
};

export const Disabled: Story = {
  render: () => ({
    props: { control: new FormControl({ value: true, disabled: true }) },
    template: `<app-checkbox id="cb-disabled" label="Không thể thay đổi" [formControl]="control" />`,
  }),
};
