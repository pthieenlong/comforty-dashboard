import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { NumberInputComponent } from '@/shared/ui/number-input/number-input.component';

const meta: Meta<NumberInputComponent> = {
  title: 'Forms/NumberInput',
  component: NumberInputComponent,
  decorators: [moduleMetadata({ imports: [ReactiveFormsModule] })],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<NumberInputComponent>;

export const Basic: Story = {
  render: () => ({
    props: { control: new FormControl<number | null>(1) },
    template: `
      <div class="w-56">
        <app-number-input id="ni-basic" [formControl]="control" />
      </div>
    `,
  }),
};

export const MinMax: Story = {
  render: () => ({
    props: { control: new FormControl<number | null>(10) },
    template: `
      <div class="w-56">
        <app-number-input
          id="ni-clamped"
          [min]="0"
          [max]="100"
          [step]="5"
          [formControl]="control"
        />
        <p class="mt-2 text-xs text-slate-500">Min 0, Max 100, Step 5</p>
      </div>
    `,
  }),
};

export const Invalid: Story = {
  render: () => ({
    props: { control: new FormControl<number | null>(null) },
    template: `
      <div class="w-56">
        <app-number-input id="ni-invalid" [invalid]="true" [formControl]="control" />
      </div>
    `,
  }),
};

export const Readonly: Story = {
  render: () => ({
    props: { control: new FormControl<number | null>(42) },
    template: `
      <div class="w-56">
        <app-number-input id="ni-readonly" [readonly]="true" [formControl]="control" />
      </div>
    `,
  }),
};
