import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { InputComponent } from '@/shared/ui/input/input.component';

const meta: Meta<InputComponent> = {
  title: 'UI/Input',
  component: InputComponent,
  decorators: [
    moduleMetadata({
      imports: [ReactiveFormsModule],
    }),
  ],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'],
    },
    inputSize: { control: 'select', options: ['sm', 'md', 'lg'] },
    invalid: { control: 'boolean' },
    readonly: { control: 'boolean' },
  },
  args: { type: 'text', inputSize: 'md', invalid: false, readonly: false },
};

export default meta;
type Story = StoryObj<InputComponent>;

export const Default: Story = {
  render: (args) => ({
    props: { ...args, control: new FormControl('') },
    template: `
      <div class="w-80">
        <app-input
          id="demo-input"
          [type]="type"
          [inputSize]="inputSize"
          [invalid]="invalid"
          [readonly]="readonly"
          placeholder="Nhập nội dung..."
          [formControl]="control"
        />
      </div>
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    props: { control: new FormControl('') },
    template: `
      <div class="flex flex-col gap-2 w-80">
        <app-input id="sm" inputSize="sm" placeholder="Small" [formControl]="control" />
        <app-input id="md" inputSize="md" placeholder="Medium" [formControl]="control" />
        <app-input id="lg" inputSize="lg" placeholder="Large" [formControl]="control" />
      </div>
    `,
  }),
};

export const Invalid: Story = {
  args: { invalid: true },
  render: (args) => ({
    props: { ...args, control: new FormControl('email-không-hợp-lệ') },
    template: `
      <div class="w-80">
        <app-input
          id="invalid-input"
          type="email"
          [invalid]="invalid"
          [formControl]="control"
        />
      </div>
    `,
  }),
};

export const Disabled: Story = {
  render: () => ({
    props: { control: new FormControl({ value: 'Không thể chỉnh sửa', disabled: true }) },
    template: `
      <div class="w-80">
        <app-input id="disabled-input" [formControl]="control" />
      </div>
    `,
  }),
};
