import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { DatePickerComponent } from '@/shared/ui/date-picker/date-picker.component';

const meta: Meta<DatePickerComponent> = {
  title: 'Forms/DatePicker',
  component: DatePickerComponent,
  decorators: [moduleMetadata({ imports: [ReactiveFormsModule] })],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<DatePickerComponent>;

export const Empty: Story = {
  render: () => ({
    props: { control: new FormControl<string | null>(null) },
    template: `
      <div class="w-72">
        <app-date-picker id="dp-empty" [formControl]="control" />
        <p class="mt-3 text-xs text-slate-500">Giá trị: {{ control.value || '—' }}</p>
      </div>
    `,
  }),
};

export const Prefilled: Story = {
  render: () => ({
    props: { control: new FormControl<string | null>('2026-05-19') },
    template: `
      <div class="w-72">
        <app-date-picker id="dp-pre" [formControl]="control" />
      </div>
    `,
  }),
};

export const WithMinMax: Story = {
  render: () => ({
    props: { control: new FormControl<string | null>(null) },
    template: `
      <div class="w-72">
        <app-date-picker
          id="dp-clamped"
          [min]="'2026-05-01'"
          [max]="'2026-05-31'"
          [formControl]="control"
          placeholder="Chọn ngày trong tháng 5/2026"
        />
        <p class="mt-3 text-xs text-slate-500">Chỉ cho phép ngày trong 01–31/05/2026.</p>
      </div>
    `,
  }),
};

export const Invalid: Story = {
  render: () => ({
    props: { control: new FormControl<string | null>(null) },
    template: `
      <div class="w-72">
        <app-date-picker
          id="dp-invalid"
          [invalid]="true"
          placeholder="Bắt buộc chọn ngày"
          [formControl]="control"
        />
      </div>
    `,
  }),
};
