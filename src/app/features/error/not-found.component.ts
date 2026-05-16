import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideHome, LucideSearchX } from '@lucide/angular';
import { ButtonComponent, IconComponent } from '@/shared/ui';

@Component({
  selector: 'app-not-found',
  imports: [ButtonComponent, IconComponent, RouterLink],
  template: `
    <div class="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
      <div class="rounded-full bg-slate-100 p-4 text-slate-400">
        <app-icon [icon]="searchIcon" size="xl" />
      </div>
      <p class="mt-6 text-sm font-semibold text-indigo-600">404</p>
      <h1 class="mt-1 text-3xl font-bold text-slate-900 sm:text-4xl">Không tìm thấy trang</h1>
      <p class="mt-3 max-w-md text-sm text-slate-500">
        Trang bạn đang tìm không tồn tại hoặc đã được di chuyển.
      </p>
      <div class="mt-6 flex gap-3">
        <a routerLink="/">
          <app-button variant="primary">
            <app-icon [icon]="homeIcon" size="md" />
            Về Dashboard
          </app-button>
        </a>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundComponent {
  protected readonly searchIcon = LucideSearchX.icon;
  protected readonly homeIcon = LucideHome.icon;
}
