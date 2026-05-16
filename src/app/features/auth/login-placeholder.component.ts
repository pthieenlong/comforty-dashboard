import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CardComponent } from '@/shared/ui';

@Component({
  selector: 'app-login-placeholder',
  imports: [CardComponent],
  template: `
    <app-card padding="lg" [elevated]="true">
      <h2 class="text-xl font-semibold text-slate-900">Đăng nhập</h2>
      <p class="mt-1 text-sm text-slate-500">
        Trang đăng nhập sẽ được xây dựng ở sprint tiếp theo.
      </p>
    </app-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPlaceholderComponent {}
