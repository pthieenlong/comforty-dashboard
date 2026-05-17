import { CdkDrag, type CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import { type ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LucideGripVertical, LucideStar, LucideUpload, LucideX } from '@lucide/angular';
import { IconComponent } from '@/shared/ui/icon/icon.component';

const noop = (): void => undefined;

export interface UploadedImage {
  url: string;
  name: string;
  /** True if user uploaded this in current session — we own the blob URL. */
  isBlob: boolean;
}

@Component({
  selector: 'app-image-upload-grid',
  imports: [CdkDrag, CdkDropList, IconComponent],
  template: `
    <div class="space-y-3">
      <div
        cdkDropList
        cdkDropListOrientation="mixed"
        class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4"
        (cdkDropListDropped)="onDrop($event)"
      >
        @for (img of images(); track img.url; let i = $index) {
          <div
            cdkDrag
            class="group relative overflow-hidden rounded-lg ring-1 ring-slate-200 bg-white"
          >
            <div class="aspect-square overflow-hidden bg-slate-100">
              <img [src]="img.url" [alt]="img.name" class="h-full w-full object-cover" />
            </div>

            @if (i === 0) {
              <span
                class="absolute left-2 top-2 inline-flex items-center gap-1 rounded bg-amber-500 px-1.5 py-0.5 text-xs font-medium text-white shadow"
              >
                <app-icon [icon]="starIcon" size="xs" />
                Ảnh chính
              </span>
            }

            <div class="absolute right-2 top-2 flex gap-1">
              @if (i !== 0) {
                <button
                  type="button"
                  class="rounded bg-white/90 p-1 text-slate-600 shadow hover:bg-white hover:text-amber-600"
                  [attr.aria-label]="'Đặt ảnh ' + (i + 1) + ' làm ảnh chính'"
                  (click)="setPrimary(i)"
                >
                  <app-icon [icon]="starIcon" size="xs" />
                </button>
              }
              <button
                type="button"
                class="rounded bg-white/90 p-1 text-slate-600 shadow hover:bg-white hover:text-red-600"
                [attr.aria-label]="'Xóa ảnh ' + (i + 1)"
                (click)="remove(i)"
              >
                <app-icon [icon]="closeIcon" size="xs" />
              </button>
            </div>

            <div
              cdkDragHandle
              class="absolute bottom-2 left-2 cursor-grab rounded bg-white/90 p-1 text-slate-500 opacity-0 shadow transition group-hover:opacity-100"
              [attr.aria-label]="'Kéo để sắp xếp lại'"
            >
              <app-icon [icon]="gripIcon" size="xs" />
            </div>
          </div>
        }

        @if (canAddMore()) {
          <label
            [for]="id()"
            [class]="addZoneClasses()"
            (dragover)="onDragOver($event)"
            (dragleave)="onDragLeave($event)"
            (drop)="onFileDrop($event)"
          >
            <app-icon [icon]="uploadIcon" size="lg" />
            <span class="text-xs font-medium text-slate-600">Thêm ảnh</span>
            <span class="text-[10px] text-slate-400">
              {{ images().length }}/{{ maxImages() }}
            </span>
            <input
              [id]="id()"
              type="file"
              class="sr-only"
              accept="image/*"
              multiple
              [disabled]="disabled()"
              (change)="onFileSelect($event)"
            />
          </label>
        }
      </div>

      @if (images().length === 0) {
        <p class="text-xs text-slate-500">
          Ảnh đầu tiên là ảnh chính, hiển thị ở danh sách. Kéo thả để sắp xếp.
        </p>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ImageUploadGridComponent),
      multi: true,
    },
  ],
  host: { class: 'block' },
})
export class ImageUploadGridComponent implements ControlValueAccessor {
  readonly id = input.required<string>();
  readonly maxImages = input<number>(8);
  readonly maxSizeBytes = input<number>(5 * 1024 * 1024);

  protected readonly uploadIcon = LucideUpload.icon;
  protected readonly closeIcon = LucideX.icon;
  protected readonly starIcon = LucideStar.icon;
  protected readonly gripIcon = LucideGripVertical.icon;

  protected readonly images = signal<UploadedImage[]>([]);
  protected readonly disabled = signal<boolean>(false);
  protected readonly dragOver = signal<boolean>(false);

  protected readonly canAddMore = computed(() => this.images().length < this.maxImages());

  protected readonly addZoneClasses = computed(() => {
    const base =
      'flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed text-slate-400 transition';
    if (this.disabled()) return `${base} border-slate-200 opacity-60`;
    if (this.dragOver()) return `${base} border-indigo-500 bg-indigo-50 text-indigo-600`;
    return `${base} border-slate-300 hover:border-slate-400 hover:bg-slate-50`;
  });

  private onChange: (value: string[]) => void = noop;
  private onTouched: () => void = noop;

  writeValue(value: string[] | null): void {
    // Preserve blob status for URLs we already own.
    const previous = new Map(this.images().map((i) => [i.url, i]));
    const next: UploadedImage[] = (value ?? []).map((url) => {
      const existing = previous.get(url);
      return existing ?? { url, name: this.deriveName(url), isBlob: false };
    });
    this.images.set(next);
  }

  registerOnChange(fn: (value: string[]) => void): void {
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
    if (input.files) this.acceptFiles(Array.from(input.files));
    input.value = '';
  }

  protected onFileDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(false);
    if (this.disabled()) return;
    const files = event.dataTransfer?.files;
    if (files) this.acceptFiles(Array.from(files));
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (!this.disabled()) this.dragOver.set(true);
  }

  protected onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(false);
  }

  protected onDrop(event: CdkDragDrop<UploadedImage[]>): void {
    if (event.previousIndex === event.currentIndex) return;
    const next = [...this.images()];
    moveItemInArray(next, event.previousIndex, event.currentIndex);
    this.images.set(next);
    this.emit();
  }

  protected setPrimary(index: number): void {
    if (index === 0) return;
    const next = [...this.images()];
    const [picked] = next.splice(index, 1);
    if (picked) next.unshift(picked);
    this.images.set(next);
    this.emit();
  }

  protected remove(index: number): void {
    const current = this.images()[index];
    if (current?.isBlob) URL.revokeObjectURL(current.url);
    const next = this.images().filter((_, i) => i !== index);
    this.images.set(next);
    this.emit();
  }

  private acceptFiles(files: File[]): void {
    const room = this.maxImages() - this.images().length;
    const accepted = files
      .filter((f) => f.type.startsWith('image/') && f.size <= this.maxSizeBytes())
      .slice(0, room)
      .map<UploadedImage>((f) => ({
        url: URL.createObjectURL(f),
        name: f.name,
        isBlob: true,
      }));
    if (accepted.length === 0) return;
    this.images.set([...this.images(), ...accepted]);
    this.emit();
  }

  private emit(): void {
    this.onChange(this.images().map((i) => i.url));
    this.onTouched();
  }

  private deriveName(url: string): string {
    try {
      const u = new URL(url);
      const last = u.pathname.split('/').pop();
      return last || url;
    } catch {
      return url;
    }
  }
}
