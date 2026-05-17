import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { SelectComponent, type SelectOption } from '@/shared/ui/select/select.component';

const meta: Meta<SelectComponent> = {
  title: 'Forms/Select',
  component: SelectComponent,
  decorators: [moduleMetadata({ imports: [ReactiveFormsModule] })],
};

export default meta;
type Story = StoryObj<SelectComponent>;

const tenantOptions: SelectOption<string>[] = [
  { value: 'tenant-hq', label: 'HQ — Trụ sở chính' },
  { value: 'tenant-q1', label: 'Chi nhánh Quận 1' },
  { value: 'tenant-q7', label: 'Chi nhánh Quận 7' },
  { value: 'tenant-td', label: 'Chi nhánh Thủ Đức' },
  { value: 'tenant-hk', label: 'Chi nhánh Hoàn Kiếm' },
  { value: 'tenant-hc', label: 'Chi nhánh Hải Châu' },
];

const roleOptions: SelectOption<string>[] = [
  { value: 'role-super-admin', label: 'Super Admin' },
  { value: 'role-hq-admin', label: 'HQ Admin' },
  { value: 'role-store-manager', label: 'Store Manager' },
  { value: 'role-sales-lead', label: 'Sales Lead' },
  { value: 'role-cashier', label: 'Thu ngân' },
  { value: 'role-inventory-clerk', label: 'Nhân viên kho' },
  { value: 'role-marketing', label: 'Marketing' },
  { value: 'role-auditor', label: 'Auditor' },
  { value: 'role-staff', label: 'Nhân viên' },
];

export const Basic: Story = {
  render: () => ({
    props: { options: tenantOptions, control: new FormControl('tenant-q1') },
    template: `
      <div class="w-80">
        <app-select id="sel-tenant" [options]="options" placeholder="Chọn chi nhánh" [formControl]="control" />
      </div>
    `,
  }),
};

export const Searchable: Story = {
  render: () => ({
    props: { options: roleOptions, control: new FormControl('') },
    template: `
      <div class="w-80">
        <app-select
          id="sel-role"
          [options]="options"
          placeholder="Chọn vai trò"
          [searchable]="true"
          [formControl]="control"
        />
      </div>
    `,
  }),
};

export const Invalid: Story = {
  render: () => ({
    props: { options: tenantOptions, control: new FormControl('') },
    template: `
      <div class="w-80">
        <app-select
          id="sel-invalid"
          [options]="options"
          placeholder="Vui lòng chọn"
          [invalid]="true"
          [formControl]="control"
        />
      </div>
    `,
  }),
};
