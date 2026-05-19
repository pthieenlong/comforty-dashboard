import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { PriceInputComponent } from '@/shared/ui/price-input/price-input.component';

const meta: Meta<PriceInputComponent> = {
  title: 'Forms/PriceInput',
  component: PriceInputComponent,
  decorators: [moduleMetadata({ imports: [ReactiveFormsModule] })],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<PriceInputComponent>;

export const Basic: Story = {
  render: () => ({
    props: { control: new FormControl<number | null>(199000) },
    template: `
      <div class="w-64">
        <app-price-input id="pi-basic" [formControl]="control" />
        <p class="mt-2 text-xs text-slate-500">Giá trị form: {{ control.value }}</p>
      </div>
    `,
  }),
};

export const Empty: Story = {
  render: () => ({
    props: { control: new FormControl<number | null>(null) },
    template: `
      <div class="w-64">
        <app-price-input id="pi-empty" [formControl]="control" placeholder="Nhập giá..." />
      </div>
    `,
  }),
};

export const CustomSuffix: Story = {
  render: () => ({
    props: { control: new FormControl<number | null>(75) },
    template: `
      <div class="w-64">
        <app-price-input id="pi-suffix" suffix="USD" [formControl]="control" />
      </div>
    `,
  }),
};

export const Invalid: Story = {
  render: () => ({
    props: { control: new FormControl<number | null>(null) },
    template: `
      <div class="w-64">
        <app-price-input id="pi-invalid" [invalid]="true" [formControl]="control" />
      </div>
    `,
  }),
};
