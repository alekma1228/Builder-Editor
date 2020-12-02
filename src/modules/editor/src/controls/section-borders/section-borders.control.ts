import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

@Component({
  selector: 'peb-editor-controls-section-borders',
  templateUrl: 'section-borders.control.html',
  styleUrls:['section-borders.control.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebEditorSectionBordersControl {
  @Input()
  @HostBinding('style.top.px')
  top = 40;

  @Input()
  @HostBinding('style.left.px')
  left = 40;

  @Input()
  @HostBinding('style.width.px')
  width = 1280;

  @Input()
  @HostBinding('style.height.px')
  height = 0;

  @Input()
  set spaceWidth(value: number) {
    this.spaceWidthSubject$.next(value);
  };

  @Input()
  set sectionHeights(value: number[]) {
    this.sectionHeightsSubject$.next(value);
  }

  @Input()
  set invalid(value: boolean) {
    this.invalidSubject$.next(value);
  }

  private readonly invalidSubject$ = new BehaviorSubject<boolean>(false);
  readonly invalid$ = this.invalidSubject$.asObservable();

  private readonly spaceWidthSubject$ = new BehaviorSubject<number>(0);
  readonly spaceWidth$ = this.spaceWidthSubject$.asObservable();

  private readonly sectionHeightsSubject$ = new BehaviorSubject<number[]>([]);
  readonly sectionHeights$ = this.sectionHeightsSubject$.asObservable();

  get color$(): Observable<string> {
    return this.invalid$.pipe(
      map(invalid => invalid ? '#ff1744' : '#067AF1'),
      distinctUntilChanged(),
    );
  }
}
