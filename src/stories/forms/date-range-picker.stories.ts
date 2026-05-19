import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import {
  type DateRange,
  DateRangePickerComponent,
} from '@/shared/ui/date-range-picker/date-range-picker.component';

const meta: Meta<DateRangePickerComponent> = {
  title: 'Forms/DateRangePicker',
  component: DateRangePickerComponent,
  decorators: [moduleMetadata({ imports: [ReactiveFormsModule] })],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<DateRangePickerComponent>;

export const Empty: Story = {
  render: () => ({
    props: { control: new FormControl<DateRange | null>(null) },
    template: `
      <div class="w-80">
        <app-date-range-picker id="drp-empty" [formControl]="control" />
        <p class="mt-3 text-xs text-slate-500">
          Giá trị: {{ control.value | json }}
        </p>
      </div>
    `,
  }),
};

export const Prefilled: Story = {
  render: () => ({
    props: {
      control: new FormControl<DateRange>({ start: '2026-05-01', end: '2026-05-17' }),
    },
    template: `
      <div class="w-80">
        <app-date-range-picker id="drp-pre" [formControl]="control" />
      </div>
    `,
  }),
};

export const Invalid: Story = {
  render: () => ({
    props: { control: new FormControl<DateRange | null>(null) },
    template: `
      <div class="w-80">
        <app-date-range-picker
          id="drp-invalid"
          [invalid]="true"
          placeholder="Bắt buộc chọn khoảng ngày"
          [formControl]="control"
        />
      </div>
    `,
  }),
};
