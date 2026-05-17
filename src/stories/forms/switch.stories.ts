import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { SwitchComponent } from '@/shared/ui/switch/switch.component';

const meta: Meta<SwitchComponent> = {
  title: 'Forms/Switch',
  component: SwitchComponent,
  decorators: [moduleMetadata({ imports: [ReactiveFormsModule] })],
};

export default meta;
type Story = StoryObj<SwitchComponent>;

export const Off: Story = {
  render: () => ({
    props: { control: new FormControl(false) },
    template: `<app-switch id="sw-off" label="Tài khoản hoạt động" [formControl]="control" />`,
  }),
};

export const On: Story = {
  render: () => ({
    props: { control: new FormControl(true) },
    template: `<app-switch id="sw-on" label="Bật thông báo email" [formControl]="control" />`,
  }),
};

export const Disabled: Story = {
  render: () => ({
    props: { control: new FormControl({ value: true, disabled: true }) },
    template: `<app-switch id="sw-disabled" label="Locked feature" [formControl]="control" />`,
  }),
};
