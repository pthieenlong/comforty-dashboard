import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-label',
  template: `
    <label [for]="for()" class="block text-sm font-medium text-slate-700">
      <ng-content />
      @if (required()) {
        <span class="text-red-600" aria-hidden="true">*</span>
        <span class="sr-only">(bắt buộc)</span>
      }
    </label>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LabelComponent {
  readonly for = input.required<string>();
  readonly required = input<boolean>(false);
}
