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
import { NgTemplateOutlet } from '@angular/common';

@Directive({
  selector: '[appTabPanel]',
})
export class TabPanelDirective {
  readonly tab = input.required<string>({ alias: 'appTabPanel' });
  readonly label = input.required<string>({ alias: 'appTabPanelLabel' });
  readonly template = inject<TemplateRef<unknown>>(TemplateRef);
}

@Component({
  selector: 'app-tabs',
  imports: [NgTemplateOutlet],
  template: `
    <div class="border-b border-slate-200">
      <nav class="-mb-px flex gap-6" role="tablist">
        @for (panel of panels(); track panel.tab()) {
          <button
            type="button"
            role="tab"
            [id]="'tab-' + panel.tab()"
            [attr.aria-selected]="panel.tab() === activeTab()"
            [attr.aria-controls]="'panel-' + panel.tab()"
            [tabIndex]="panel.tab() === activeTab() ? 0 : -1"
            [class]="tabClasses(panel.tab() === activeTab())"
            (click)="setActive(panel.tab())"
          >
            {{ panel.label() }}
          </button>
        }
      </nav>
    </div>

    @for (panel of panels(); track panel.tab()) {
      @if (panel.tab() === activeTab()) {
        <div
          role="tabpanel"
          [id]="'panel-' + panel.tab()"
          [attr.aria-labelledby]="'tab-' + panel.tab()"
          class="pt-5"
        >
          <ng-container *ngTemplateOutlet="panel.template" />
        </div>
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class TabsComponent {
  readonly activeTab = model.required<string>();

  protected readonly panels = contentChildren(TabPanelDirective);

  protected readonly hasActive = computed(() =>
    this.panels().some((p) => p.tab() === this.activeTab()),
  );

  protected tabClasses(active: boolean): string {
    const base =
      'whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500';
    return active
      ? `${base} border-indigo-600 text-indigo-700`
      : `${base} border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700`;
  }

  protected setActive(tab: string): void {
    this.activeTab.set(tab);
  }
}
