import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { ComboboxComponent, type ComboboxOption } from '@/shared/ui/combobox/combobox.component';

interface CustomerOption {
  id: string;
  name: string;
  phone: string;
  email: string;
}

const CUSTOMERS: CustomerOption[] = [
  { id: 'c1', name: 'Nguyễn Thị Mai', phone: '0901234567', email: 'mai.nguyen@gmail.com' },
  { id: 'c2', name: 'Trần Văn Hùng', phone: '0912345678', email: 'hung.tran@hotmail.com' },
  { id: 'c3', name: 'Lê Hoàng Anh', phone: '0923456789', email: 'lehoanganh@yahoo.com' },
  { id: 'c4', name: 'Phạm Quốc Bảo', phone: '0934567890', email: 'baopham@gmail.com' },
  { id: 'c5', name: 'Vũ Minh Châu', phone: '0945678901', email: 'chauvm@outlook.com' },
  { id: 'c6', name: 'Đỗ Thu Hà', phone: '0956789012', email: 'hado@gmail.com' },
  { id: 'c7', name: 'Hoàng Minh Tuấn', phone: '0967890123', email: 'tuanhm@gmail.com' },
];

const BASE_OPTIONS: ComboboxOption<string>[] = CUSTOMERS.map((c) => ({
  value: c.id,
  label: c.name,
  description: `${c.phone} · ${c.email}`,
}));

@Component({
  selector: 'app-combobox-async-demo',
  imports: [ComboboxComponent, ReactiveFormsModule],
  template: `
    <div class="w-96">
      <app-combobox
        id="combo-async"
        [options]="options()"
        [loading]="loading()"
        [formControl]="control"
        placeholder="Tìm khách hàng theo tên/số ĐT/email..."
        (queryChange)="onQuery($event)"
      />
      <p class="mt-3 text-xs text-slate-500">Đã chọn: {{ control.value || '—' }}</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ComboboxAsyncDemo {
  protected readonly control = new FormControl<string | null>(null);
  protected readonly options = signal<ComboboxOption<string>[]>(BASE_OPTIONS);
  protected readonly loading = signal<boolean>(false);
  private timer: ReturnType<typeof setTimeout> | null = null;

  protected onQuery(q: string): void {
    if (this.timer) clearTimeout(this.timer);
    this.loading.set(true);
    this.timer = setTimeout(() => {
      const lower = q.toLowerCase().trim();
      if (!lower) {
        this.options.set(BASE_OPTIONS);
      } else {
        this.options.set(
          BASE_OPTIONS.filter(
            (o) =>
              o.label.toLowerCase().includes(lower) || o.description?.toLowerCase().includes(lower),
          ),
        );
      }
      this.loading.set(false);
    }, 250);
  }
}

const meta: Meta<ComboboxComponent> = {
  title: 'Forms/Combobox',
  component: ComboboxComponent,
  decorators: [moduleMetadata({ imports: [ReactiveFormsModule] })],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<ComboboxComponent>;

export const Basic: Story = {
  render: () => ({
    props: { options: BASE_OPTIONS, control: new FormControl('c2') },
    template: `
      <div class="w-96">
        <app-combobox
          id="combo-basic"
          [options]="options"
          placeholder="Tìm khách hàng..."
          [formControl]="control"
        />
      </div>
    `,
  }),
};

export const AsyncSearch: Story = {
  render: () => ({
    template: `<app-combobox-async-demo />`,
    moduleMetadata: { imports: [ComboboxAsyncDemo] },
  }),
};

export const Loading: Story = {
  render: () => ({
    props: { options: BASE_OPTIONS, control: new FormControl(null) },
    template: `
      <div class="w-96">
        <app-combobox
          id="combo-loading"
          [options]="options"
          [loading]="true"
          placeholder="Đang tải..."
          [formControl]="control"
        />
      </div>
    `,
  }),
};

export const Invalid: Story = {
  render: () => ({
    props: { options: BASE_OPTIONS, control: new FormControl(null) },
    template: `
      <div class="w-96">
        <app-combobox
          id="combo-invalid"
          [options]="options"
          [invalid]="true"
          placeholder="Bắt buộc chọn khách hàng"
          [formControl]="control"
        />
      </div>
    `,
  }),
};
