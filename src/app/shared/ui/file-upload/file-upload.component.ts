import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import { type ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LucideUpload, LucideX } from '@lucide/angular';
import { IconComponent } from '@/shared/ui/icon/icon.component';

const noop = (): void => undefined;

export interface UploadedFile {
  name: string;
  size: number;
  previewUrl: string;
}

@Component({
  selector: 'app-file-upload',
  imports: [IconComponent],
  template: `
    <div
      [class]="dropZoneClasses()"
      (dragover)="onDragOver($event)"
      (dragleave)="onDragLeave($event)"
      (drop)="onDrop($event)"
    >
      @if (file()) {
        <div class="flex items-center gap-3 p-3">
          <img
            [src]="file()!.previewUrl"
            alt="Preview"
            class="h-12 w-12 rounded object-cover ring-1 ring-slate-200"
          />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-slate-900 truncate">{{ file()!.name }}</p>
            <p class="text-xs text-slate-500">{{ formatSize(file()!.size) }}</p>
          </div>
          <button
            type="button"
            class="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            [attr.aria-label]="'Xóa ' + file()!.name"
            (click)="clear()"
          >
            <app-icon [icon]="closeIcon" size="sm" />
          </button>
        </div>
      } @else {
        <label [for]="id()" class="flex cursor-pointer flex-col items-center gap-2 p-6">
          <app-icon [icon]="uploadIcon" size="lg" />
          <p class="text-sm font-medium text-slate-700">
            <span class="text-indigo-600">Chọn file</span> hoặc kéo thả vào đây
          </p>
          <p class="text-xs text-slate-400">{{ hint() }}</p>
          <input
            [id]="id()"
            type="file"
            class="sr-only"
            [accept]="accept()"
            [disabled]="disabled()"
            (change)="onFileSelect($event)"
          />
        </label>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FileUploadComponent),
      multi: true,
    },
  ],
  host: { class: 'block' },
})
export class FileUploadComponent implements ControlValueAccessor {
  readonly id = input.required<string>();
  readonly accept = input<string>('image/*');
  readonly hint = input<string>('PNG, JPG, WebP — tối đa 5MB');
  readonly maxSizeBytes = input<number>(5 * 1024 * 1024);

  protected readonly uploadIcon = LucideUpload.icon;
  protected readonly closeIcon = LucideX.icon;

  protected readonly file = signal<UploadedFile | null>(null);
  protected readonly disabled = signal<boolean>(false);
  protected readonly dragOver = signal<boolean>(false);

  protected readonly dropZoneClasses = computed(() => {
    const base = 'rounded-lg border-2 border-dashed bg-white transition';
    if (this.disabled()) return `${base} border-slate-200 opacity-60`;
    if (this.dragOver()) return `${base} border-indigo-500 bg-indigo-50`;
    return `${base} border-slate-300 hover:border-slate-400`;
  });

  private onChange: (value: UploadedFile | null) => void = noop;
  private onTouched: () => void = noop;

  writeValue(value: UploadedFile | null): void {
    this.file.set(value ?? null);
  }

  registerOnChange(fn: (value: UploadedFile | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  protected onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const f = input.files?.[0];
    if (f) this.acceptFile(f);
    input.value = '';
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (!this.disabled()) this.dragOver.set(true);
  }

  protected onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(false);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(false);
    if (this.disabled()) return;
    const f = event.dataTransfer?.files?.[0];
    if (f) this.acceptFile(f);
  }

  protected clear(): void {
    const current = this.file();
    if (current) URL.revokeObjectURL(current.previewUrl);
    this.file.set(null);
    this.onChange(null);
    this.onTouched();
  }

  protected formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  private acceptFile(f: File): void {
    if (f.size > this.maxSizeBytes()) return;
    const previewUrl = URL.createObjectURL(f);
    const uploaded: UploadedFile = { name: f.name, size: f.size, previewUrl };
    this.file.set(uploaded);
    this.onChange(uploaded);
    this.onTouched();
  }
}
