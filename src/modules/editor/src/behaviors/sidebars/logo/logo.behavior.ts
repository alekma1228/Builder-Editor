import { ComponentRef, Injectable } from '@angular/core';
import { EMPTY, merge, Observable, Subject } from 'rxjs';
import { finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { isEqual } from 'lodash';

import { pebCreateLogger, PebElementContextState, PebElementType, PebShopContainer } from '@pe/builder-core';

import { AbstractEditElementWithSidebar } from '../_sidebar.behavior';
import { PebEditorLogoSidebar } from './logo.sidebar';
import { requiredFileType } from '../_inputs/file/file.input';
import { toBase64 } from '../../../utils';
import { PebEditorElementLogo } from '../../../renderer/elements/editor-element-logo';

const log = pebCreateLogger('editor:behaviors:edit-logo');

@Injectable({ providedIn: 'any' })
export class PebEditorLogoBehavior extends AbstractEditElementWithSidebar<PebEditorLogoSidebar> {
  static elementTypes = [PebElementType.Logo];

  sidebarComponent = PebEditorLogoSidebar;

  logger = { log };

  init(): Observable<any> {
    return this.singleElementOfTypeSelected$().pipe(
      switchMap((elCmp: PebEditorElementLogo) => {
        this.initPositionForm(elCmp);
        this.initDimensionsForm(elCmp);
        this.initLogoForm(elCmp);
        this.initOpacityForm(elCmp);
        this.initProportionsForm(elCmp);

        const sidebarRef = this.initSidebar(elCmp);

        return merge(
          this.handlePositionForm(elCmp),
          this.handleDimensionsForm(elCmp),
          this.handleLogoForm(elCmp, sidebarRef),
          this.handleOpacityForm(elCmp),
          this.handleProportionsForm(elCmp),
        ).pipe(
          takeUntil(this.state.selectionChanged$()),
          finalize(() => sidebarRef.destroy()),
        );
      }),
    );
  }

  private initLogoForm(elementCmp: PebEditorElementLogo) {
    const initialValue = {
      file: null,
      src: elementCmp.context?.data?.src,
    };

    elementCmp.logo = {
      initialValue,
      form: this.formBuilder.group({
        file: [
          initialValue.file,
          [requiredFileType(['png', 'jpg', 'jpeg'])],
        ],
        src: [
          initialValue.src,
        ],
      }),
      update: null,
      submit: new Subject<any>(),
    };
  }

  private handleLogoForm(elementCmp: PebEditorElementLogo, sidebarRef: ComponentRef<any>): Observable<any> {
    const logo = elementCmp.logo;

    return merge(
      logo.form.valueChanges.pipe(
        tap(async (changes) => {
          if (changes.file) {
            const nextSource = await toBase64(changes.file);

            if (logo.form.controls.src.value === nextSource) {
              return;
            }

            logo.form.controls.src.patchValue(nextSource, { emitEvent: false });

            elementCmp.context.state = PebElementContextState.Ready;
            elementCmp.context.data = { src: nextSource };
            elementCmp.detectChanges();

            sidebarRef.instance.cdr.detectChanges();
          }
        }),
      ),
      logo.submit.pipe(
        switchMap(() => {
          if (logo.form.invalid || !logo.form.value.file || isEqual(logo.initialValue, logo.form.value)) {
            console.warn('Invalid form: ', logo.form);
            return EMPTY;
          }

          this.logger.log('Logo: Submit ', logo.form.value);

          return this.editorApi.uploadImage(PebShopContainer.Builder, logo.form.value.file).pipe(
            switchMap((result: any) => this.editorApi.updateShop({ picture: result.blobName })),
            tap((_) => {
              this.editor.refreshContext();
            }),
          )
        }),
      ),
    );
  }
}
