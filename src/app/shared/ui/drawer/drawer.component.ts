import { Dialog, DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Injectable,
  type TemplateRef,
  inject,
  signal,
} from '@angular/core';
import { LucideX } from '@lucide/angular';
import { IconComponent } from '@/shared/ui/icon/icon.component';

export type DrawerWidth = 'sm' | 'md' | 'lg';

export interface DrawerOptions<T = unknown> {
  title: string;
  description?: string;
  width?: DrawerWidth;
  data?: T;
}

interface DrawerData<T> {
  template: TemplateRef<unknown>;
  title: string;
  description?: string;
  width: DrawerWidth;
  data: T;
}

const WIDTH_CLASS: Record<DrawerWidth, string> = {
  sm: 'w-full max-w-sm',
  md: 'w-full max-w-md',
  lg: 'w-full max-w-lg',
};

@Component({
  selector: 'app-drawer-host',
  imports: [IconComponent, NgTemplateOutlet],
  template: `
    <div [class]="containerClass">
      <header class="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
        <div class="min-w-0">
          <h2 class="text-base font-semibold text-slate-900 truncate">{{ drawerData.title }}</h2>
          @if (drawerData.description) {
            <p class="mt-0.5 text-sm text-slate-500">{{ drawerData.description }}</p>
          }
        </div>
        <button
          type="button"
          class="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          [attr.aria-label]="'Đóng'"
          (click)="close()"
        >
          <app-icon [icon]="closeIcon" size="md" />
        </button>
      </header>

      <div class="flex-1 overflow-y-auto px-5 py-4">
        <ng-container
          *ngTemplateOutlet="
            drawerData.template;
            context: { $implicit: drawerData.data, drawer: this }
          "
        />
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block h-full' },
})
export class DrawerHostComponent<T = unknown> {
  protected readonly drawerData = inject<DrawerData<T>>(DIALOG_DATA);
  private readonly dialogRef = inject<DialogRef<unknown>>(DialogRef);
  protected readonly closeIcon = LucideX.icon;

  protected readonly containerClass = `flex h-full flex-col bg-white shadow-xl ${WIDTH_CLASS[this.drawerData.width]}`;

  close(result?: unknown): void {
    this.dialogRef.close(result);
  }
}

@Injectable({ providedIn: 'root' })
export class DrawerService {
  private readonly dialog = inject(Dialog);
  private readonly _isOpen = signal(false);
  readonly isOpen = this._isOpen.asReadonly();

  open<T, R = unknown>(
    template: TemplateRef<unknown>,
    options: DrawerOptions<T>,
  ): Promise<R | undefined> {
    this._isOpen.set(true);
    const ref = this.dialog.open<R>(DrawerHostComponent, {
      data: {
        template,
        title: options.title,
        description: options.description,
        width: options.width ?? 'md',
        data: options.data,
      },
      panelClass: ['app-drawer-panel'],
      backdropClass: ['app-drawer-backdrop'],
      hasBackdrop: true,
      disableClose: false,
    });

    return new Promise<R | undefined>((resolve) => {
      ref.closed.subscribe((result) => {
        this._isOpen.set(false);
        resolve(result);
      });
    });
  }
}
