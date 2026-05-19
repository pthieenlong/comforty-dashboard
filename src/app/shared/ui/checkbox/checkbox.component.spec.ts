import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { CheckboxComponent } from './checkbox.component';

@Component({
  imports: [CheckboxComponent, FormsModule],
  template: `
    <app-checkbox
      id="cb-test"
      label="Test"
      [ngModel]="value()"
      (ngModelChange)="onChange($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class HostComponent {
  readonly value = signal<boolean>(false);
  readonly changes: boolean[] = [];

  onChange(v: boolean): void {
    this.changes.push(v);
    this.value.set(v);
  }
}

describe('CheckboxComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('emits ngModelChange and updates UI when clicked', async () => {
    const input = fixture.nativeElement.querySelector('input[type="checkbox"]') as HTMLInputElement;

    expect(input).toBeTruthy();
    expect(input.checked).toBe(false);

    // First click: false → true
    input.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(host.changes).toEqual([true]);
    expect(host.value()).toBe(true);
    expect(input.checked).toBe(true);

    // Second click: true → false
    input.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(host.changes).toEqual([true, false]);
    expect(host.value()).toBe(false);
    expect(input.checked).toBe(false);
  });

  it('reflects writeValue when the host signal flips', async () => {
    host.value.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(input.checked).toBe(true);

    // The visible checkbox span sibling of the input should reflect "filled".
    const visibleBox = fixture.nativeElement.querySelector(
      'input.peer ~ span',
    ) as HTMLElement | null;
    expect(visibleBox).toBeTruthy();
    expect(visibleBox?.className).toContain('bg-indigo-600');
  });
});
