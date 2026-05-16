import { CdkConnectedOverlay, CdkOverlayOrigin } from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';

export type DropdownAlign = 'start' | 'end';

@Component({
  selector: 'app-dropdown',
  imports: [CdkConnectedOverlay],
  template: `
    <ng-content select="[appDropdownTrigger]" />

    <ng-template
      cdkConnectedOverlay
      [cdkConnectedOverlayOrigin]="origin"
      [cdkConnectedOverlayOpen]="open()"
      [cdkConnectedOverlayPositions]="positions()"
      [cdkConnectedOverlayHasBackdrop]="true"
      cdkConnectedOverlayBackdropClass="cdk-overlay-transparent-backdrop"
      (backdropClick)="close()"
      (detach)="close()"
    >
      <div
        role="menu"
        class="min-w-[180px] rounded-md border border-slate-200 bg-white py-1 shadow-md focus:outline-none"
      >
        <ng-content />
      </div>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [CdkOverlayOrigin],
  host: { class: 'inline-block' },
})
export class DropdownComponent {
  readonly align = input<DropdownAlign>('start');
  protected readonly open = signal(false);
  protected readonly origin = inject(CdkOverlayOrigin);

  protected readonly positions = computed(() => {
    const isEnd = this.align() === 'end';
    return [
      {
        originX: isEnd ? ('end' as const) : ('start' as const),
        originY: 'bottom' as const,
        overlayX: isEnd ? ('end' as const) : ('start' as const),
        overlayY: 'top' as const,
        offsetY: 4,
      },
      {
        originX: isEnd ? ('end' as const) : ('start' as const),
        originY: 'top' as const,
        overlayX: isEnd ? ('end' as const) : ('start' as const),
        overlayY: 'bottom' as const,
        offsetY: -4,
      },
    ];
  });

  toggle(): void {
    this.open.update((v) => !v);
  }

  close(): void {
    this.open.set(false);
  }
}

@Directive({
  selector: '[appDropdownTrigger]',
  host: {
    '(click)': 'parent.toggle()',
  },
})
export class DropdownTriggerDirective {
  protected readonly parent = inject(DropdownComponent);
}

@Component({
  selector: 'app-dropdown-item',
  template: `
    <button
      type="button"
      role="menuitem"
      [disabled]="disabled()"
      class="w-full flex items-center gap-2 px-3 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:bg-slate-100"
      [class.text-red-600]="danger()"
      [class.hover:bg-red-50]="danger()"
    >
      <ng-content />
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class DropdownItemComponent {
  readonly disabled = input<boolean>(false);
  readonly danger = input<boolean>(false);
}
