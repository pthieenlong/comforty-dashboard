import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { LabelComponent } from '@/shared/ui/label/label.component';

@Component({
  selector: 'app-form-field',
  imports: [LabelComponent],
  template: `
    <div class="flex flex-col gap-1.5">
      @if (label()) {
        <app-label [for]="for()" [required]="required()">{{ label() }}</app-label>
      }
      <ng-content />
      @if (helpText() && !errorText()) {
        <p [id]="describedById()" class="text-xs text-slate-500">{{ helpText() }}</p>
      }
      @if (errorText()) {
        <p [id]="describedById()" class="text-xs text-red-600" role="alert">{{ errorText() }}</p>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFieldComponent {
  readonly for = input.required<string>();
  readonly label = input<string>('');
  readonly required = input<boolean>(false);
  readonly helpText = input<string>('');
  readonly errorText = input<string>('');

  protected readonly describedById = computed(() => `${this.for()}-desc`);
}
