import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { FormFieldComponent, InputComponent } from '@/shared/ui';

const meta: Meta<FormFieldComponent> = {
  title: 'UI/FormField',
  component: FormFieldComponent,
  decorators: [
    moduleMetadata({
      imports: [InputComponent, ReactiveFormsModule],
    }),
  ],
};

export default meta;
type Story = StoryObj<FormFieldComponent>;

export const Basic: Story = {
  render: () => ({
    props: { control: new FormControl('') },
    template: `
      <div class="w-80">
        <app-form-field for="email" label="Email" [required]="true">
          <app-input id="email" type="email" placeholder="ten@comforty.vn" [formControl]="control" />
        </app-form-field>
      </div>
    `,
  }),
};

export const WithHelpText: Story = {
  render: () => ({
    props: { control: new FormControl('') },
    template: `
      <div class="w-80">
        <app-form-field
          for="phone"
          label="Số điện thoại"
          helpText="Định dạng: 0xxxxxxxxx (10–11 số)"
        >
          <app-input id="phone" type="tel" [formControl]="control" />
        </app-form-field>
      </div>
    `,
  }),
};

export const WithError: Story = {
  render: () => ({
    props: { control: new FormControl('abc') },
    template: `
      <div class="w-80">
        <app-form-field
          for="email-err"
          label="Email"
          [required]="true"
          errorText="Email không hợp lệ."
        >
          <app-input id="email-err" type="email" [invalid]="true" [formControl]="control" />
        </app-form-field>
      </div>
    `,
  }),
};
