import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { SearchInputComponent } from '@/shared/ui/search-input/search-input.component';

const meta: Meta<SearchInputComponent> = {
  title: 'Forms/SearchInput',
  component: SearchInputComponent,
  decorators: [moduleMetadata({ imports: [ReactiveFormsModule] })],
};

export default meta;
type Story = StoryObj<SearchInputComponent>;

export const Empty: Story = {
  render: () => ({
    props: { control: new FormControl('') },
    template: `
      <div class="w-96">
        <app-search-input id="sr-empty" placeholder="Tìm theo tên, email..." [formControl]="control" />
      </div>
    `,
  }),
};

export const Filled: Story = {
  render: () => ({
    props: { control: new FormControl('phạm thiện') },
    template: `
      <div class="w-96">
        <app-search-input id="sr-filled" [formControl]="control" />
      </div>
    `,
  }),
};
