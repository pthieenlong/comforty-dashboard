import { CdkConnectedOverlay, CdkOverlayOrigin } from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  forwardRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { type ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LucideChevronDown } from '@lucide/angular';
import { IconComponent } from '@/shared/ui/icon/icon.component';
import { TreeComponent, type TreeNode } from './tree.component';

const noop = (): void => undefined;

@Component({
  selector: 'app-tree-select',
  imports: [CdkConnectedOverlay, IconComponent, TreeComponent],
  hostDirectives: [CdkOverlayOrigin],
  template: `
    <button
      type="button"
      [id]="id()"
      [disabled]="disabled()"
      [attr.aria-expanded]="open()"
      [attr.aria-invalid]="invalid() ? 'true' : null"
      [class]="triggerClasses()"
      (click)="toggle()"
    >
      <span class="flex-1 truncate text-left" [class.text-slate-400]="!selectedLabel()">
        {{ selectedLabel() || placeholder() }}
      </span>
      <app-icon [icon]="chevronIcon" size="sm" />
    </button>

    <ng-template
      cdkConnectedOverlay
      [cdkConnectedOverlayOrigin]="origin"
      [cdkConnectedOverlayOpen]="open()"
      [cdkConnectedOverlayPositions]="positions"
      [cdkConnectedOverlayHasBackdrop]="true"
      cdkConnectedOverlayBackdropClass="cdk-overlay-transparent-backdrop"
      [cdkConnectedOverlayWidth]="triggerWidth()"
      (backdropClick)="close()"
      (detach)="close()"
    >
      <div class="rounded-md border border-slate-200 bg-white shadow-md p-1 max-h-72 overflow-auto">
        @if (allowClear()) {
          <button
            type="button"
            class="w-full text-left px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100 rounded-md"
            (click)="clear()"
          >
            — Không chọn —
          </button>
        }
        <app-tree [nodes]="nodes()" [selectedId]="value()" (nodeClick)="pick($event)" />
      </div>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TreeSelectComponent),
      multi: true,
    },
  ],
})
export class TreeSelectComponent<T = unknown> implements ControlValueAccessor {
  readonly id = input.required<string>();
  readonly nodes = input.required<TreeNode<T>[]>();
  readonly placeholder = input<string>('Chọn...');
  readonly allowClear = input<boolean>(true);
  readonly invalid = input<boolean>(false);

  protected readonly origin = inject(CdkOverlayOrigin);
  protected readonly hostEl = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly chevronIcon = LucideChevronDown.icon;

  protected readonly open = signal<boolean>(false);
  protected readonly value = signal<string | null>(null);
  protected readonly disabled = signal<boolean>(false);

  protected readonly positions = [
    {
      originX: 'start' as const,
      originY: 'bottom' as const,
      overlayX: 'start' as const,
      overlayY: 'top' as const,
      offsetY: 4,
    },
    {
      originX: 'start' as const,
      originY: 'top' as const,
      overlayX: 'start' as const,
      overlayY: 'bottom' as const,
      offsetY: -4,
    },
  ];

  protected readonly triggerWidth = computed(
    () => this.hostEl.nativeElement.getBoundingClientRect().width || 220,
  );

  protected readonly selectedLabel = computed(() => {
    const id = this.value();
    if (!id) return '';
    return this.findLabel(this.nodes(), id);
  });

  protected readonly triggerClasses = computed(() => {
    const base =
      'inline-flex w-full items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm text-slate-900 min-h-[38px] ' +
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 ' +
      'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500';
    return this.invalid()
      ? `${base} border-red-400 focus-visible:border-red-500 focus-visible:ring-red-500`
      : `${base} border-slate-300 focus-visible:border-indigo-500 focus-visible:ring-indigo-500`;
  });

  private onChange: (value: string | null) => void = noop;
  private onTouched: () => void = noop;

  writeValue(value: string | null): void {
    this.value.set(value ?? null);
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  protected toggle(): void {
    if (this.disabled()) return;
    this.open.update((v) => !v);
    if (!this.open()) this.onTouched();
  }

  protected close(): void {
    this.open.set(false);
    this.onTouched();
  }

  protected pick(node: TreeNode<T>): void {
    this.value.set(node.id);
    this.onChange(node.id);
    this.close();
  }

  protected clear(): void {
    this.value.set(null);
    this.onChange(null);
    this.close();
  }

  private findLabel(list: TreeNode<T>[], id: string): string {
    for (const node of list) {
      if (node.id === id) return node.label;
      const inChild = this.findLabel(node.children, id);
      if (inChild) return inChild;
    }
    return '';
  }
}
