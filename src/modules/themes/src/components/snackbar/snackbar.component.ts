import { Component, HostBinding, Inject } from '@angular/core';
import { MatSnackBarRef, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

interface PebThemesSnackbarDataInterface {
  width?: string;
  icon?: string;
  text?: string;
}

@Component({
  selector: 'peb-themes-snackbar',
  templateUrl: './snackbar.component.html',
  styleUrls: ['./snackbar.component.scss'],
})
export class PebThemesSnackbarComponent {
  @HostBinding('style.width') get styleWidth(): string {
    return this.data.width || 'auto';
  }

  constructor(
    public snackBarRef: MatSnackBarRef<PebThemesSnackbarComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public data: PebThemesSnackbarDataInterface,
  ) {}
}
