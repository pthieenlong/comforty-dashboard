import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { ImageUploadGridComponent } from '@/shared/ui/file-upload/image-upload-grid.component';

const meta: Meta<ImageUploadGridComponent> = {
  title: 'Forms/ImageUploadGrid',
  component: ImageUploadGridComponent,
  decorators: [moduleMetadata({ imports: [ReactiveFormsModule] })],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<ImageUploadGridComponent>;

const samples = [
  'https://placehold.co/400x400/4f46e5/fff?text=Áo+1',
  'https://placehold.co/400x400/0ea5e9/fff?text=Áo+2',
  'https://placehold.co/400x400/22c55e/fff?text=Áo+3',
  'https://placehold.co/400x400/f59e0b/fff?text=Áo+4',
];

export const Empty: Story = {
  render: () => ({
    props: { control: new FormControl<string[]>([]) },
    template: `
      <div class="w-[640px]">
        <app-image-upload-grid id="iug-empty" [formControl]="control" />
      </div>
    `,
  }),
};

export const Prefilled: Story = {
  render: () => ({
    props: { control: new FormControl<string[]>(samples) },
    template: `
      <div class="w-[640px]">
        <app-image-upload-grid id="iug-pre" [formControl]="control" />
        <p class="mt-2 text-xs text-slate-500">Kéo thả để sắp lại — ảnh đầu tiên là ảnh đại diện.</p>
      </div>
    `,
  }),
};

export const LimitedTo3: Story = {
  render: () => ({
    props: { control: new FormControl<string[]>(samples.slice(0, 3)) },
    template: `
      <div class="w-[640px]">
        <app-image-upload-grid id="iug-3" [maxImages]="3" [formControl]="control" />
      </div>
    `,
  }),
};
