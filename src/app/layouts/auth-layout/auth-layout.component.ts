import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet],
  template: `
    <div class="min-h-screen bg-slate-50 flex flex-col">
      <main class="flex-1 flex items-center justify-center px-4 py-12">
        <div class="w-full max-w-md">
          <div class="mb-8 text-center">
            <h1 class="text-2xl font-bold text-slate-900">Comforty</h1>
            <p class="mt-1 text-sm text-slate-500">Hệ thống quản trị chuỗi cửa hàng</p>
          </div>
          <router-outlet />
        </div>
      </main>
      <footer class="py-6 text-center text-xs text-slate-400">
        © {{ year }} Comforty. All rights reserved.
      </footer>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class AuthLayoutComponent {
  protected readonly year = new Date().getFullYear();
}
