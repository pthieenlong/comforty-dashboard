import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Location } from '@angular/common';
import { inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowLeft, LucideShieldOff } from '@lucide/angular';
import { ButtonComponent, IconComponent } from '@/shared/ui';

@Component({
  selector: 'app-forbidden',
  imports: [ButtonComponent, IconComponent, RouterLink],
  template: `
    <div class="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
      <div class="rounded-full bg-red-50 p-4 text-red-500">
        <app-icon [icon]="shieldIcon" size="xl" />
      </div>
      <p class="mt-6 text-sm font-semibold text-red-600">403</p>
      <h1 class="mt-1 text-3xl font-bold text-slate-900 sm:text-4xl">Không có quyền truy cập</h1>
      <p class="mt-3 max-w-md text-sm text-slate-500">
        Bạn chưa được cấp quyền cho trang này. Vui lòng liên hệ quản trị viên nếu cần truy cập.
      </p>
      <div class="mt-6 flex gap-3">
        <app-button variant="secondary" (click)="goBack()">
          <app-icon [icon]="backIcon" size="md" />
          Quay lại
        </app-button>
        <a routerLink="/">
          <app-button variant="primary">Về Dashboard</app-button>
        </a>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForbiddenComponent {
  private readonly location = inject(Location);

  protected readonly shieldIcon = LucideShieldOff.icon;
  protected readonly backIcon = LucideArrowLeft.icon;

  protected goBack(): void {
    this.location.back();
  }
}
