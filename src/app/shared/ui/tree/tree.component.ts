import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  computed,
  contentChild,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { LucideChevronDown, LucideChevronRight } from '@lucide/angular';
import { IconComponent } from '@/shared/ui/icon/icon.component';

export interface TreeNode<T = unknown> {
  id: string;
  label: string;
  data: T;
  children: TreeNode<T>[];
}

interface FlatNode<T> {
  node: TreeNode<T>;
  depth: number;
  hasChildren: boolean;
  expanded: boolean;
}

@Component({
  selector: 'app-tree',
  imports: [IconComponent, NgTemplateOutlet],
  template: `
    <ul role="tree" class="select-none">
      @for (entry of visible(); track entry.node.id) {
        <li
          role="treeitem"
          [attr.aria-level]="entry.depth + 1"
          [attr.aria-expanded]="entry.hasChildren ? entry.expanded : null"
          [attr.aria-selected]="entry.node.id === selectedId()"
        >
          <div
            role="button"
            tabindex="0"
            [class]="rowClasses(entry)"
            [style.padding-left.px]="12 + entry.depth * 20"
            (click)="onRowClick(entry)"
            (keydown.enter)="onRowClick(entry); $event.preventDefault()"
            (keydown.space)="onRowClick(entry); $event.preventDefault()"
          >
            @if (entry.hasChildren) {
              <button
                type="button"
                class="rounded p-0.5 text-slate-500 hover:bg-slate-200"
                [attr.aria-label]="entry.expanded ? 'Thu gọn' : 'Mở rộng'"
                (click)="toggleExpand($event, entry.node.id)"
              >
                <app-icon [icon]="entry.expanded ? chevronDownIcon : chevronRightIcon" size="sm" />
              </button>
            } @else {
              <span class="w-5"></span>
            }

            <div class="flex-1 min-w-0">
              @if (rowTemplate(); as tpl) {
                <ng-container
                  *ngTemplateOutlet="tpl; context: { node: entry.node, depth: entry.depth }"
                />
              } @else {
                <span class="text-sm text-slate-900 truncate">{{ entry.node.label }}</span>
              }
            </div>
          </div>
        </li>
      }
    </ul>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class TreeComponent<T = unknown> {
  readonly nodes = input.required<TreeNode<T>[]>();
  readonly selectedId = model<string | null>(null);
  readonly defaultExpanded = input<boolean>(true);
  readonly nodeClick = output<TreeNode<T>>();

  protected readonly chevronDownIcon = LucideChevronDown.icon;
  protected readonly chevronRightIcon = LucideChevronRight.icon;

  protected readonly rowTemplate =
    contentChild<TemplateRef<{ node: TreeNode<T>; depth: number }>>(TemplateRef);

  // Stores ids whose state is OPPOSITE of defaultExpanded — so a fresh tree
  // honors the default without us seeding every id.
  private readonly toggledIds = signal<Set<string>>(new Set<string>());

  protected readonly visible = computed<FlatNode<T>[]>(() => {
    const flat: FlatNode<T>[] = [];
    const toggled = this.toggledIds();
    const defaultOpen = this.defaultExpanded();

    const walk = (list: TreeNode<T>[], depth: number): void => {
      list.forEach((node) => {
        const hasChildren = node.children.length > 0;
        const isToggled = toggled.has(node.id);
        const isExpanded = defaultOpen ? !isToggled : isToggled;
        flat.push({ node, depth, hasChildren, expanded: isExpanded });
        if (hasChildren && isExpanded) {
          walk(node.children, depth + 1);
        }
      });
    };
    walk(this.nodes(), 0);
    return flat;
  });

  protected toggleExpand(event: Event, id: string): void {
    event.stopPropagation();
    this.toggledIds.update((set) => {
      const next = new Set(set);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  protected onRowClick(entry: FlatNode<T>): void {
    this.selectedId.set(entry.node.id);
    this.nodeClick.emit(entry.node);
  }

  protected rowClasses(entry: FlatNode<T>): string {
    const base = 'flex items-center gap-1.5 py-1.5 pr-3 cursor-pointer rounded-md';
    const selected = entry.node.id === this.selectedId();
    return selected
      ? `${base} bg-indigo-50 text-indigo-700`
      : `${base} hover:bg-slate-100 text-slate-700`;
  }
}
