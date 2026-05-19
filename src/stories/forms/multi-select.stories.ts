import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { MultiSelectComponent } from '@/shared/ui/multi-select/multi-select.component';
import type { SelectOption } from '@/shared/ui/select/select.component';

const meta: Meta<MultiSelectComponent> = {
  title: 'Forms/MultiSelect',
  component: MultiSelectComponent,
  decorators: [moduleMetadata({ imports: [ReactiveFormsModule] })],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<MultiSelectComponent>;

const colorOptions: SelectOption<string>[] = [
  { value: 'black', label: 'Đen' },
  { value: 'white', label: 'Trắng' },
  { value: 'beige', label: 'Be' },
  { value: 'grey', label: 'Xám' },
  { value: 'navy', label: 'Navy' },
  { value: 'olive', label: 'Xanh rêu' },
];

const sizeOptions: SelectOption<string>[] = [
  { value: 'S', label: 'S' },
  { value: 'M', label: 'M' },
  { value: 'L', label: 'L' },
  { value: 'XL', label: 'XL' },
  { value: 'XXL', label: 'XXL' },
];

export const Basic: Story = {
  render: () => ({
    props: {
      options: colorOptions,
      control: new FormControl<string[]>(['black', 'white']),
    },
    template: `
      <div class="w-80">
        <app-multi-select
          id="ms-color"
          [options]="options"
          placeholder="Chọn màu"
          [formControl]="control"
        />
      </div>
    `,
  }),
};

export const Searchable: Story = {
  render: () => ({
    props: { options: sizeOptions, control: new FormControl<string[]>([]) },
    template: `
      <div class="w-80">
        <app-multi-select
          id="ms-size"
          [options]="options"
          [searchable]="true"
          placeholder="Chọn size"
          [formControl]="control"
        />
      </div>
    `,
  }),
};

export const Invalid: Story = {
  render: () => ({
    props: { options: colorOptions, control: new FormControl<string[]>([]) },
    template: `
      <div class="w-80">
        <app-multi-select
          id="ms-invalid"
          [options]="options"
          [invalid]="true"
          placeholder="Bắt buộc chọn"
          [formControl]="control"
        />
      </div>
    `,
  }),
};
