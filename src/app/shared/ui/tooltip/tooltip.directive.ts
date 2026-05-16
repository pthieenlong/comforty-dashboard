import { Overlay, OverlayPositionBuilder, type OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  type OnDestroy,
  inject,
  input,
  signal,
} from '@angular/core';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

const POSITIONS: Record<
  TooltipPosition,
  {
    originX: 'start' | 'center' | 'end';
    originY: 'top' | 'center' | 'bottom';
    overlayX: 'start' | 'center' | 'end';
    overlayY: 'top' | 'center' | 'bottom';
    offsetX?: number;
    offsetY?: number;
  }
> = {
  top: { originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom', offsetY: -6 },
  bottom: { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top', offsetY: 6 },
  left: { originX: 'start', originY: 'center', overlayX: 'end', overlayY: 'center', offsetX: -6 },
  right: { originX: 'end', originY: 'center', overlayX: 'start', overlayY: 'center', offsetX: 6 },
};

@Component({
  selector: 'app-tooltip-content',
  template: `<span>{{ text() }}</span>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'block rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-white shadow-md max-w-xs',
    role: 'tooltip',
  },
})
export class TooltipContentComponent {
  readonly text = signal<string>('');
}

@Directive({
  selector: '[appTooltip]',
  host: {
    '(mouseenter)': 'show()',
    '(focus)': 'show()',
    '(mouseleave)': 'hide()',
    '(blur)': 'hide()',
  },
})
export class TooltipDirective implements OnDestroy {
  private readonly overlay = inject(Overlay);
  private readonly positionBuilder = inject(OverlayPositionBuilder);
  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly appTooltip = input.required<string>();
  readonly appTooltipPosition = input<TooltipPosition>('top');

  private overlayRef: OverlayRef | null = null;

  protected show(): void {
    if (this.overlayRef || !this.appTooltip()) return;
    const pos = POSITIONS[this.appTooltipPosition()];
    const strategy = this.positionBuilder.flexibleConnectedTo(this.hostRef).withPositions([
      {
        originX: pos.originX,
        originY: pos.originY,
        overlayX: pos.overlayX,
        overlayY: pos.overlayY,
        offsetX: pos.offsetX,
        offsetY: pos.offsetY,
      },
    ]);
    this.overlayRef = this.overlay.create({
      positionStrategy: strategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
    });
    const portal = new ComponentPortal(TooltipContentComponent);
    const ref = this.overlayRef.attach(portal);
    ref.instance.text.set(this.appTooltip());
  }

  protected hide(): void {
    this.overlayRef?.dispose();
    this.overlayRef = null;
  }

  ngOnDestroy(): void {
    this.hide();
  }
}
