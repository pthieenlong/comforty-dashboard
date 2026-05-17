import { Injectable } from '@angular/core';
import { toast as sonner } from 'ngx-sonner';

@Injectable({ providedIn: 'root' })
export class ToastService {
  success(message: string, description?: string): void {
    sonner.success(message, { description });
  }

  error(message: string, description?: string): void {
    sonner.error(message, { description });
  }

  info(message: string, description?: string): void {
    sonner.info(message, { description });
  }

  warning(message: string, description?: string): void {
    sonner.warning(message, { description });
  }

  loading(message: string): string | number {
    return sonner.loading(message);
  }

  dismiss(id?: string | number): void {
    sonner.dismiss(id);
  }
}
