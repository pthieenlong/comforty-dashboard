import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterOutlet,
} from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { TopbarComponent } from './topbar/topbar.component';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, SidebarComponent, TopbarComponent],
  template: `
    <div class="min-h-screen flex bg-slate-50">
      <app-sidebar
        [collapsed]="sidebarCollapsed()"
        [mobileOpen]="mobileSidebarOpen()"
        (toggleCollapse)="toggleSidebar()"
        (closeMobile)="closeMobileSidebar()"
      />
      <div class="flex-1 flex flex-col min-w-0">
        <app-topbar (toggleMobileSidebar)="openMobileSidebar()" />
        <!-- Route loading bar -->
        @if (routeLoading()) {
          <div
            class="h-0.5 bg-indigo-500 animate-pulse"
            role="progressbar"
            aria-label="Đang tải trang"
          ></div>
        }
        <main class="flex-1 overflow-x-hidden">
          <div class="mx-auto max-w-screen-2xl px-4 py-6 sm:px-6 lg:px-8">
            <router-outlet />
          </div>
        </main>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class AdminLayoutComponent {
  private readonly router = inject(Router);

  protected readonly sidebarCollapsed = signal(false);
  protected readonly mobileSidebarOpen = signal(false);
  protected readonly routeLoading = signal(false);

  constructor() {
    this.router.events.pipe(takeUntilDestroyed()).subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.routeLoading.set(true);
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.routeLoading.set(false);
      }
    });
  }

  protected toggleSidebar(): void {
    this.sidebarCollapsed.update((v) => !v);
  }

  protected openMobileSidebar(): void {
    this.mobileSidebarOpen.set(true);
  }

  protected closeMobileSidebar(): void {
    this.mobileSidebarOpen.set(false);
  }
}
