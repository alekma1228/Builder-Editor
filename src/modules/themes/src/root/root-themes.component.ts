import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'peb-themes-root',
  templateUrl: './root-themes.component.html',
  styleUrls: ['./root-themes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebThemesRootComponent {}
