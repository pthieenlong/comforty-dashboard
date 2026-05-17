import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  TemplateRef,
  computed,
  contentChildren,
  inject,
  input,
  model,
} from '@angular/core';
import { LucideCheck } from '@lucide/angular';
import { IconComponent } from '@/shared/ui/icon/icon.component';

@Directive({
  selector: '[appStepperStep]',
})
export class StepperStepDirective {
  readonly key = input.required<string>({ alias: 'appStepperStep' });
  readonly label = input.required<string>({ alias: 'appStepperStepLabel' });
  readonly description = input<string>('', { alias: 'appStepperStepDescription' });
  readonly valid = input<boolean>(true, { alias: 'appStepperStepValid' });
  readonly template = inject<TemplateRef<unknown>>(TemplateRef);
}

@Component({
  selector: 'app-stepper',
  imports: [IconComponent, NgTemplateOutlet],
  template: `
    <ol class="flex w-full items-center gap-2 border-b border-slate-200 pb-4" role="list">
      @for (step of steps(); track step.key(); let i = $index, last = $last) {
        <li class="flex flex-1 items-center gap-2 min-w-0">
          <button
            type="button"
            [class]="dotClasses(i)"
            [disabled]="!canJumpTo(i)"
            [attr.aria-current]="i === currentIndex() ? 'step' : null"
            (click)="jumpTo(i)"
          >
            @if (isCompleted(i)) {
              <app-icon [icon]="checkIcon" size="sm" />
            } @else {
              <span class="text-sm font-semibold">{{ i + 1 }}</span>
            }
          </button>
          <div class="min-w-0 flex-1">
            <p [class]="labelClasses(i)">{{ step.label() }}</p>
            @if (step.description()) {
              <p class="text-xs text-slate-400 truncate">{{ step.description() }}</p>
            }
          </div>
          @if (!last) {
            <span class="hidden h-px flex-1 bg-slate-200 sm:block"></span>
          }
        </li>
      }
    </ol>

    <div class="pt-5">
      @for (step of steps(); track step.key()) {
        @if (step.key() === activeKey()) {
          <ng-container *ngTemplateOutlet="step.template" />
        }
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class StepperComponent {
  readonly activeKey = model.required<string>();
  /** strict: cannot jump forward to invalid steps. free: any step anytime. */
  readonly mode = input<'strict' | 'free'>('strict');

  protected readonly checkIcon = LucideCheck.icon;
  protected readonly steps = contentChildren(StepperStepDirective);

  protected readonly currentIndex = computed(() => {
    const key = this.activeKey();
    return this.steps().findIndex((s) => s.key() === key);
  });

  protected isCompleted(index: number): boolean {
    return index < this.currentIndex();
  }

  protected canJumpTo(index: number): boolean {
    const current = this.currentIndex();
    if (index === current) return true;
    if (index < current) return true;
    if (this.mode() === 'free') return true;
    // Strict: can only move forward if all steps in between (and current) are valid.
    const steps = this.steps();
    for (let i = current; i < index; i++) {
      if (!steps[i]?.valid()) return false;
    }
    return true;
  }

  protected jumpTo(index: number): void {
    if (!this.canJumpTo(index)) return;
    const step = this.steps()[index];
    if (step) this.activeKey.set(step.key());
  }

  protected dotClasses(index: number): string {
    const base =
      'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition disabled:cursor-not-allowed';
    if (this.isCompleted(index)) {
      return `${base} border-indigo-600 bg-indigo-600 text-white`;
    }
    if (index === this.currentIndex()) {
      return `${base} border-indigo-600 bg-white text-indigo-700`;
    }
    return `${base} border-slate-300 bg-white text-slate-400`;
  }

  protected labelClasses(index: number): string {
    const base = 'text-sm font-medium truncate';
    if (index === this.currentIndex()) return `${base} text-indigo-700`;
    if (this.isCompleted(index)) return `${base} text-slate-700`;
    return `${base} text-slate-400`;
  }

  next(): void {
    const idx = this.currentIndex();
    const steps = this.steps();
    if (idx < steps.length - 1) {
      const nextStep = steps[idx + 1];
      if (nextStep) this.activeKey.set(nextStep.key());
    }
  }

  prev(): void {
    const idx = this.currentIndex();
    if (idx > 0) {
      const prevStep = this.steps()[idx - 1];
      if (prevStep) this.activeKey.set(prevStep.key());
    }
  }

  isFirst(): boolean {
    return this.currentIndex() === 0;
  }

  isLast(): boolean {
    return this.currentIndex() === this.steps().length - 1;
  }

  isCurrentValid(): boolean {
    return this.steps()[this.currentIndex()]?.valid() ?? true;
  }
}
