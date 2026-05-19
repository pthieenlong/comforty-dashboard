import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { ButtonComponent } from '@/shared/ui/button/button.component';
import { StepperComponent, StepperStepDirective } from '@/shared/ui/stepper/stepper.component';

@Component({
  selector: 'app-stepper-strict-demo',
  imports: [ButtonComponent, StepperComponent, StepperStepDirective],
  template: `
    <div class="w-[640px]">
      <app-stepper [(activeKey)]="active" mode="strict">
        <ng-template
          appStepperStep="info"
          appStepperStepLabel="Thông tin"
          appStepperStepDescription="Tên + mã"
          [appStepperStepValid]="infoValid()"
        >
          <div class="space-y-3">
            <p class="text-sm text-slate-600">Bước 1 — strict mode: phải hoàn tất mới qua tiếp.</p>
            <label class="block">
              <span class="text-sm text-slate-700">Tên sản phẩm</span>
              <input
                class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                [value]="name()"
                (input)="name.set($any($event.target).value)"
              />
            </label>
            <div class="flex justify-end">
              <app-button [disabled]="!infoValid()" (click)="active.set('attrs')"
                >Tiếp tục</app-button
              >
            </div>
          </div>
        </ng-template>

        <ng-template
          appStepperStep="attrs"
          appStepperStepLabel="Thuộc tính"
          [appStepperStepValid]="true"
        >
          <div class="space-y-3">
            <p class="text-sm text-slate-600">Bước 2 — đã sẵn sàng.</p>
            <div class="flex justify-between">
              <app-button variant="secondary" (click)="active.set('info')">Quay lại</app-button>
              <app-button (click)="active.set('done')">Hoàn tất</app-button>
            </div>
          </div>
        </ng-template>

        <ng-template appStepperStep="done" appStepperStepLabel="Hoàn thành">
          <p class="text-sm text-green-700">Đã hoàn tất tất cả các bước.</p>
        </ng-template>
      </app-stepper>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class StepperStrictDemo {
  protected readonly active = signal<string>('info');
  protected readonly name = signal<string>('');
  protected readonly infoValid = () => this.name().trim().length >= 3;
}

@Component({
  selector: 'app-stepper-free-demo',
  imports: [StepperComponent, StepperStepDirective],
  template: `
    <div class="w-[640px]">
      <app-stepper [(activeKey)]="active" mode="free">
        <ng-template appStepperStep="a" appStepperStepLabel="Bước A">
          <p class="text-sm text-slate-600">Free mode — click bất kỳ bước nào.</p>
        </ng-template>
        <ng-template appStepperStep="b" appStepperStepLabel="Bước B">
          <p class="text-sm text-slate-600">Bước B.</p>
        </ng-template>
        <ng-template appStepperStep="c" appStepperStepLabel="Bước C">
          <p class="text-sm text-slate-600">Bước C.</p>
        </ng-template>
      </app-stepper>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class StepperFreeDemo {
  protected readonly active = signal<string>('b');
}

const meta: Meta = {
  title: 'Navigation/Stepper',
  parameters: { layout: 'padded' },
  decorators: [moduleMetadata({ imports: [StepperComponent, StepperStepDirective] })],
};

export default meta;
type Story = StoryObj;

export const StrictMode: Story = {
  render: () => ({
    template: `<app-stepper-strict-demo />`,
    moduleMetadata: { imports: [StepperStrictDemo] },
  }),
};

export const FreeMode: Story = {
  render: () => ({
    template: `<app-stepper-free-demo />`,
    moduleMetadata: { imports: [StepperFreeDemo] },
  }),
};
