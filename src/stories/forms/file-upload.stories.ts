import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import {
  FileUploadComponent,
  type UploadedFile,
} from '@/shared/ui/file-upload/file-upload.component';

const meta: Meta<FileUploadComponent> = {
  title: 'Forms/FileUpload',
  component: FileUploadComponent,
  decorators: [moduleMetadata({ imports: [ReactiveFormsModule] })],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<FileUploadComponent>;

export const Empty: Story = {
  render: () => ({
    props: { control: new FormControl<UploadedFile | null>(null) },
    template: `
      <div class="w-[420px]">
        <app-file-upload id="fu-empty" [formControl]="control" />
      </div>
    `,
  }),
};

export const Prefilled: Story = {
  render: () => ({
    props: {
      control: new FormControl<UploadedFile | null>({
        name: 'logo-comforty.png',
        size: 248_000,
        previewUrl: 'https://placehold.co/120x120/4f46e5/fff?text=Logo',
      }),
    },
    template: `
      <div class="w-[420px]">
        <app-file-upload id="fu-pre" [formControl]="control" />
      </div>
    `,
  }),
};

export const CustomHint: Story = {
  render: () => ({
    props: { control: new FormControl<UploadedFile | null>(null) },
    template: `
      <div class="w-[420px]">
        <app-file-upload
          id="fu-hint"
          accept="application/pdf"
          hint="Chỉ PDF, tối đa 10MB"
          [maxSizeBytes]="10485760"
          [formControl]="control"
        />
      </div>
    `,
  }),
};
