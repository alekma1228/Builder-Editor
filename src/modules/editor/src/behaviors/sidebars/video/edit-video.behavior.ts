import { ComponentRef, Injectable } from '@angular/core';
import { merge, Observable, Subject } from 'rxjs';
import { finalize, switchMap, takeUntil, tap } from 'rxjs/operators';

import { pebCreateLogger, PebElementDef, PebElementType } from '@pe/builder-core';

import { PebEditorVideoSidebarComponent } from './video.sidebar';
import { AbstractEditElementWithSidebar } from '../_sidebar.behavior';
import { SelectOption } from '../_deprecated-sidebars/shared/select/select.component';
import { VideoSourceType, VideoSubTab } from '../../../renderer/editor-element';
import { PebEditorElementVideo } from '../../../renderer/elements/editor-element-video';

const log = pebCreateLogger('editor:behaviors:edit-video');

@Injectable({ providedIn: 'any' })
export class PebEditorBehaviorEditVideo extends AbstractEditElementWithSidebar<PebEditorVideoSidebarComponent> {
  static elementTypes = [ PebElementType.Video ];
  VideoSourceType = VideoSourceType;

  sourceTypeOptions: SelectOption[] = [
    { name: 'My video', value: VideoSourceType.MyVideo },
    // { name: 'Link', value: VideoSourceType.Link },
  ];

  sidebarComponent = PebEditorVideoSidebarComponent;

  logger = { log };

  init(): Observable<any> {
    return this.singleElementOfTypeSelected$().pipe(
      switchMap((elCmp: PebEditorElementVideo) => {
        this.initVideoForm(elCmp);
        this.initPositionForm(elCmp);
        this.initDimensionsForm(elCmp);
        this.initOpacityForm(elCmp);
        this.initProportionsForm(elCmp);

        const sidebarRef = this.initSidebar(elCmp);

        return merge(
          this.handleVideoForm(elCmp, sidebarRef),
          this.handlePositionForm(elCmp),
          this.handleDimensionsForm(elCmp),
          this.handleOpacityForm(elCmp),
          this.handleProportionsForm(elCmp),
        ).pipe(
          takeUntil(this.state.selectionChanged$()),
          finalize(() => sidebarRef.destroy()),
        );
      }),
    );
  }

  private initVideoForm(elementCmp: PebEditorElementVideo) {
    const initialValue = {
      videoSubTab: VideoSubTab.Media,
      sourceOptions: this.sourceTypeOptions,
      sourceType: this.sourceTypeOptions[ 0 ],
      source: elementCmp.definition?.data?.source,
      preview: elementCmp.definition?.data?.preview,
      file: elementCmp.definition?.data?.file,
      autoplay: elementCmp.definition?.data?.autoplay,
      controls: elementCmp.definition?.data?.controls,
      loop: elementCmp.definition?.data?.loop,
      sound: elementCmp.definition?.data?.sound,
    };

    elementCmp.video = {
      initialValue,
      form: this.formBuilder.group({
        sourceType: [initialValue.sourceType],
        source: [initialValue.source],
        file: [initialValue.file],
        preview: [initialValue.preview],
        autoplay: [initialValue.autoplay],
        controls: [initialValue.controls],
        loop: [initialValue.loop],
        sound: [initialValue.sound],
      }),
      update: null,
      submit: new Subject<any>(),
    };
  }

  private handleVideoForm(elementCmp: PebEditorElementVideo, sidebarRef: ComponentRef<any>): Observable<any> {
    const video = elementCmp.video;

    return merge(
      video.form.valueChanges.pipe(
        tap(async (changes) => {

          const newElementDef: PebElementDef = {
            ...elementCmp.definition,
            data: {
              ...elementCmp.definition.data,
              ...changes,
            },
          };
          return this.store.updateElement(newElementDef).pipe(
            tap(() => {
              elementCmp.detectChanges();
            }),
          );
        }),
      ),
    );
  }

}
