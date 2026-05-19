import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { TextareaComponent } from '@/shared/ui/textarea/textarea.component';

const meta: Meta<TextareaComponent> = {
  title: 'Forms/Textarea',
  component: TextareaComponent,
  decorators: [moduleMetadata({ imports: [ReactiveFormsModule] })],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<TextareaComponent>;

export const Basic: Story = {
  render: () => ({
    props: { control: new FormControl('') },
    template: `
      <div class="w-96">
        <app-textarea
          id="ta-basic"
          placeholder="Nhập mô tả sản phẩm..."
          [formControl]="control"
        />
      </div>
    `,
  }),
};

export const WithMaxLength: Story = {
  render: () => ({
    props: { control: new FormControl('Áo thun cotton 100% form regular.') },
    template: `
      <div class="w-96">
        <app-textarea
          id="ta-max"
          placeholder="Tối đa 200 ký tự..."
          [rows]="5"
          [maxLength]="200"
          [formControl]="control"
        />
      </div>
    `,
  }),
};

export const Invalid: Story = {
  render: () => ({
    props: { control: new FormControl('') },
    template: `
      <div class="w-96">
        <app-textarea
          id="ta-invalid"
          placeholder="Bắt buộc nhập"
          [invalid]="true"
          [formControl]="control"
        />
      </div>
    `,
  }),
};

export const Readonly: Story = {
  render: () => ({
    props: { control: new FormControl('Đây là nội dung chỉ đọc, không thể chỉnh sửa.') },
    template: `
      <div class="w-96">
        <app-textarea
          id="ta-readonly"
          [readonly]="true"
          [formControl]="control"
        />
      </div>
    `,
  }),
};
