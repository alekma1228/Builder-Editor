import { Inject, Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { defer, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { omit, orderBy, random } from 'lodash';
import { NgxIndexedDBService } from 'ngx-indexed-db';

import {
  hashString,
  PebAction,
  pebCloneShopTheme,
  pebCompileActions,
  pebCreateShopInitAction,
  PebEnvService,
  pebGenerateId,
  PebMediaService,
  PebShop,
  PebShopId,
  PebShopThemeEntity,
  PebShopThemeId,
  PebShopThemeSnapshot,
  PebShopThemeSourceEntityOld,
  PebShopThemeVersionEntity,
  PebShopThemeVersionId,
  PebTheme,
  PebThemeType,
} from '@pe/builder-core';
import { uuid } from '@pe/dom-to-image/lib/utils';
import { PEB_EDITOR_API_PATH } from '@pe/builder-api';

import { DatabaseEntity } from './editor.idb-config';
import { ImitateHttp } from './imitate-http.decorator';
import { WorkerMessage, WorkerMessageType } from './worker-messages';

export interface AddShopThemeInput {
  name: string;
  content: PebShop;
}

const emitFakeErrors = Boolean(localStorage.getItem('PEB_EMIT_FAKE_ERRORS'));

function getMockApiHttpError(url: string): HttpErrorResponse | null {
  if (Math.random() < 0.1) {
    if (Math.random() < 0.3) {
      /** Multiple error types if you need to handle errors differently depending on the status code */
      return new HttpErrorResponse({
        url,
        error: '500 Internal Server Error',
        statusText: '500 Internal Server Error',
        status: 500,
      })
    } else if (Math.random() > 0.7) {
      return new HttpErrorResponse({
        url,
        error: '502 Bad Gateway',
        statusText: '502 Bad Gateway',
        status: 502,
      })
    } else {
      return new HttpErrorResponse({
        url,
        error: '504 Gateway Timeout Error',
        statusText: '504 Gateway Timeout Error',
        status: 504,
      })
    }
  }

  return null;
}

/**
 * Api Mock class using IndexedDB as storage.
 *
 * To emulate http errors and snapshots hash inconsistency set local storage variable PEB_EMIT_FAKE_ERRORS to true.
 *
 * @see {@link getMockApiHttpError} if you need to adjust the probability of http errors or add more error types.
 */
@Injectable({ providedIn: 'root' })
export class SandboxMockBackend /* implements PebAbstractEditorApi */ {

  resolvers: { [key: string]: (value?: any | PromiseLike<any>) => void } = {};
  worker: Worker;

  constructor(
    private idb: NgxIndexedDBService,
    private envService: PebEnvService,
    private mediaService: PebMediaService,
    @Inject(PEB_EDITOR_API_PATH) private editorApiPath: string,
  ) {
    this.worker = new Worker('./editor-api.worker', { type: 'module' });
    this.worker.addEventListener('message', event => {
      const { messageId, messageType, data } = event.data as WorkerMessage;
      if (emitFakeErrors && messageType === WorkerMessageType.AddAction && Math.random() < 0.1) {
        /** Imitate Snapshot and Source hashes inconsistency */
        this.resolvers[messageId]({ ...data, source: 'other', snapshot: 'other' });
      } else {
        this.resolvers[messageId](data);
      }
      delete this.resolvers[messageId];
    });
  }

  //
  //  Theme methods
  //
  @ImitateHttp
  async getAllAvailableThemes() {
    return this.idb.getAll(DatabaseEntity.ShopTheme);
  }

  @ImitateHttp
  async getShopThemesList() {
    return this.idb.getAll(DatabaseEntity.ShopTheme);
  }

  @ImitateHttp
  async getShopThemeById(id): Promise<PebTheme> {
    const shopTheme = await this.idb.getByID<PebShopThemeEntity>(
      DatabaseEntity.ShopTheme, id,
    );
    const shopSource = await this.idb.getByID<PebShopThemeSourceEntityOld>(
      DatabaseEntity.ShopThemeSource, shopTheme.sourceId,
    );
    const shopSnapshot = await this.idb.getByID<PebShopThemeSnapshot>(
      DatabaseEntity.ShopThemeSnapshot, shopSource.snapshotId,
    );

    return {
      type: PebThemeType.Template,
      name: '',
      picture: '',
      source: {
        id: null,
        hash: null,
        previews: null,
        snapshot: shopSnapshot.id,
        // ...omit(shopSource, 'snapshotId'),
      },
      versions: [],
      ...omit(shopTheme, 'sourceId'),
    };
  }

  @ImitateHttp
  async createShopTheme(input: AddShopThemeInput) {
    const content = pebCloneShopTheme(input.content);

    const actions = [pebCreateShopInitAction(content)];
    const snapshot = pebCompileActions(actions);

    const snapshotEntity: PebShopThemeSnapshot = {
      ...snapshot,
      id: pebGenerateId('snapshot'),
    };
    const sourceEntity: PebShopThemeSourceEntityOld = {
      actions,
      id: pebGenerateId('source'),
      hash: actions.reduce((acc, cur) => hashString(acc + cur.id), ''),
      snapshotId: snapshotEntity.id,
      previews: {},
    };
    const themeEntity: PebShopThemeEntity = {
      id: pebGenerateId('theme'),
      name: input.name,
      picture: null,
      sourceId: sourceEntity.id,
      versionsIds: [],
      publishedId: null,
    };

    return Promise.all([
      this.idb.add(DatabaseEntity.ShopTheme, themeEntity),
      this.idb.add(DatabaseEntity.ShopThemeSource, sourceEntity),
      this.idb.add(DatabaseEntity.ShopThemeSnapshot, snapshotEntity),
    ]).then(() => themeEntity);
  }

  @ImitateHttp
  async updateThemeSourcePagePreviews(themeId: string, sourceId: string, previews: any) {
    const shopSource = await this.idb.getByID<PebShopThemeSourceEntityOld>(
      DatabaseEntity.ShopThemeSource, sourceId,
    );
    await this.idb.update(DatabaseEntity.ShopThemeSource, {
      ...shopSource,
      previews,
    });
    return previews;
  }

  //
  //  General flow
  //
  @ImitateHttp
  async getSnapshot(themeId: PebShopThemeId) {
    const shopTheme = await this.idb.getByID<PebShopThemeEntity>(
      DatabaseEntity.ShopTheme, themeId,
    );
    const shopSource = await this.idb.getByID<PebShopThemeSourceEntityOld>(
      DatabaseEntity.ShopThemeSource, shopTheme.sourceId,
    );
    const snapshot = await this.idb.getByID<PebShopThemeSnapshot>(
      DatabaseEntity.ShopThemeSnapshot, shopSource.snapshotId,
    );

    return snapshot;
  }

  @ImitateHttp
  async getActions(themeId: PebShopThemeId) {
    const shopTheme = await this.idb.getByID<PebShopThemeEntity>(
      DatabaseEntity.ShopTheme, themeId,
    );
    const shopSource = await this.idb.getByID<PebShopThemeSourceEntityOld>(
      DatabaseEntity.ShopThemeSource, shopTheme.sourceId,
    );

    return shopSource.actions;
  }


  @ImitateHttp
  addAction(themeId: PebShopId, action: PebAction): Observable<any> {
    const message: WorkerMessage = {
      messageType: WorkerMessageType.AddAction,
      messageId: uuid(),
      data: { themeId, action },
    };

    return defer(() => new Promise<{ sourceHash: string; snapshotHash: string }>( (resolve, reject) => {
      let error = null;
      if (emitFakeErrors) {
        const url = `${this.editorApiPath}/theme/${themeId}/action/`;
        error = getMockApiHttpError(url);
      }

      if (error) {
        setTimeout(() => reject(error), random(300, 500));
      } else {
        this.resolvers[message.messageId] = resolve;
        this.worker.postMessage(message);
      }
    }));
  }

  @ImitateHttp
  undoAction(themeId: PebShopId, actionId: string): Observable<{ snapshot: PebShopThemeSnapshot }> {

    const message: WorkerMessage = {
      messageType: WorkerMessageType.DeleteAction,
      messageId: uuid(),
      data: { themeId, actionId },
    };

    return defer(() => new Promise<{ snapshot: PebShopThemeSnapshot }>((resolve, reject) => {
      let error = null;
      if (emitFakeErrors) {
        const url = `${this.editorApiPath}/theme/${themeId}/action/${actionId}`;
        error = getMockApiHttpError(url);
      }

      if (error) {
        setTimeout(() => reject(error), random(300, 500));
      } else {
        this.resolvers[message.messageId] = resolve;
        this.worker.postMessage(message);
      }
    }));
  }

  @ImitateHttp
  async updateReplica(themeId, oldInitAction: PebAction, newInitAction: PebAction) {
    let { source, snapshot } = await this.getThemeWithRelations(themeId);

    source = {
      ...source,
      actions: source.actions.map(
        a => a.id === oldInitAction.id ? newInitAction : a,
      ),
    };

    snapshot = {
      ...pebCompileActions(source.actions),
      id: snapshot.id,
    };

    return Promise.all([
      this.idb.update(DatabaseEntity.ShopThemeSource, source),
      this.idb.update(DatabaseEntity.ShopThemeSnapshot, snapshot),
    ]).then(() => ({ snapshot }));
  }

  //
  //  Versioning
  //
  @ImitateHttp
  async getShopThemeVersions(themeId: PebShopThemeId) {
    const shopTheme: PebShopThemeEntity = await this.idb.getByID<PebShopThemeEntity>(
      DatabaseEntity.ShopTheme, themeId,
    );

    // https://github.com/w3c/IndexedDB/issues/19
    return Promise.all<PebShopThemeVersionEntity>(
      shopTheme.versionsIds.map(id => this.idb.getByID(DatabaseEntity.ShopThemeVersion, id)),
    ).then(versions => orderBy(versions, v => v.createdAt, ['desc']));
  }

  @ImitateHttp
  async createShopThemeVersion(shopId: PebShopId, name: string) {
    const shopThemeEntity = await this.idb.getByID<PebShopThemeEntity>(
      DatabaseEntity.ShopTheme, shopId,
    );

    const currentSourceEntity = await this.idb.getByID<PebShopThemeSourceEntityOld>(
      DatabaseEntity.ShopThemeSource, shopThemeEntity.sourceId,
    );
    const currentSnapshotEntity = await this.idb.getByID<PebShopThemeSnapshot>(
      DatabaseEntity.ShopThemeSnapshot, currentSourceEntity.snapshotId,
    );

    const duplicatedSnapshotEntity: PebShopThemeSnapshot = {
      ...currentSnapshotEntity,
      id: pebGenerateId(),
    };

    const savedSnapshotEntity = await this.idb
      .add(DatabaseEntity.ShopThemeSnapshot, duplicatedSnapshotEntity)
      .then(() => ({ ...duplicatedSnapshotEntity }));

    const duplicatedSourceEntity: PebShopThemeSourceEntityOld = {
      ...currentSourceEntity,
      id: pebGenerateId(),
      snapshotId: savedSnapshotEntity.id,
    };

    const savedSourceEntity = await this.idb
      .add(DatabaseEntity.ShopThemeSource, duplicatedSourceEntity)
      .then(() => ({ ...duplicatedSourceEntity }));

    const versionEntity: PebShopThemeVersionEntity = {
      id: pebGenerateId(),
      name,
      sourceId: savedSourceEntity.id,
      result: null, // will be calculated on publication
      createdAt: new Date(),
      published: false,
      description: '',
    };

    const nextShopThemeEntity: PebShopThemeEntity = {
      ...shopThemeEntity,
      versionsIds: [...shopThemeEntity.versionsIds, versionEntity.id],
    };

    await this.idb.update(DatabaseEntity.ShopTheme, nextShopThemeEntity);

    return this.idb
      .add(DatabaseEntity.ShopThemeVersion, versionEntity)
      .then(() => ({ ...versionEntity }));
  }

  @ImitateHttp
  async deleteShopThemeVersion(shopId: PebShopId, versionId: PebShopThemeVersionId) {
    const shopThemeEntity = await this.idb.getByID<PebShopThemeEntity>(
      DatabaseEntity.ShopTheme, shopId,
    );

    if (shopThemeEntity.publishedId === versionId) {
      throw new Error('Can\'t delete published version');
    }

    if (!shopThemeEntity.versionsIds.find(id => id === versionId)) {
      throw new Error('There is no version in theme');
    }

    const versionEntity = await this.idb.getByID<PebShopThemeVersionEntity>(
      DatabaseEntity.ShopThemeVersion, versionId,
    );

    const sourceEntity = await this.idb.getByID<PebShopThemeSourceEntityOld>(
      DatabaseEntity.ShopThemeSource, versionEntity.sourceId,
    );

    if (shopThemeEntity.sourceId === sourceEntity.id) {
      throw new Error('Can\'t delete activated version');
    }

    const snapshotEntity = await this.idb.getByID<PebShopThemeSnapshot>(
      DatabaseEntity.ShopThemeSnapshot, sourceEntity.snapshotId,
    );

    const shopSource: PebShopThemeEntity = {
      ...shopThemeEntity,
      versionsIds: shopThemeEntity.versionsIds.filter(id => id !== versionId),
    };

    return Promise.all([
      this.idb.delete(DatabaseEntity.ShopThemeVersion, versionEntity.id),
      this.idb.delete(DatabaseEntity.ShopThemeSource, sourceEntity.id),
      this.idb.delete(DatabaseEntity.ShopThemeSnapshot, snapshotEntity.id),
      this.idb.update(DatabaseEntity.ShopTheme, shopSource),
    ]);
  }

  @ImitateHttp
  async activateShopThemeVersion(shopId: PebShopId, versionId: PebShopThemeVersionId) {
    const shopThemeEntity = await this.idb.getByID<PebShopThemeEntity>(
      DatabaseEntity.ShopTheme, shopId,
    );

    const versionEntity = await this.idb.getByID<PebShopThemeVersionEntity>(
      DatabaseEntity.ShopThemeVersion, versionId,
    );

    // TODO: Delete 04.05.20 if not encountered
    if (shopThemeEntity.sourceId === versionEntity.sourceId) {
      throw new Error('Already activated');
    }

    const sourceEntityToDelete = await this.idb
      .getByID<PebShopThemeSourceEntityOld>(DatabaseEntity.ShopThemeSource, shopThemeEntity.sourceId);
    await this.idb.delete(DatabaseEntity.ShopThemeSource, sourceEntityToDelete.id);
    await this.idb.delete(DatabaseEntity.ShopThemeSnapshot, sourceEntityToDelete.snapshotId);

    const versionSourceEntity = await this.idb
      .getByID<PebShopThemeSourceEntityOld>(DatabaseEntity.ShopThemeSource, versionEntity.sourceId);

    const versionSnapshotEntity = await this.idb
      .getByID<PebShopThemeSourceEntityOld>(DatabaseEntity.ShopThemeSnapshot, versionSourceEntity.snapshotId);

    const duplicatedSnapshotEntity: PebShopThemeSourceEntityOld = {
      ...versionSnapshotEntity,
      id: pebGenerateId(),
    };

    const duplicatedSourceEntity: PebShopThemeSourceEntityOld = {
      ...versionSourceEntity,
      id: pebGenerateId(),
      snapshotId: duplicatedSnapshotEntity.id,
    };

    const nextShopThemeEntity: PebShopThemeEntity = {
      ...shopThemeEntity,
      sourceId: duplicatedSourceEntity.id,
    };

    return Promise.all([
      this.idb.update(DatabaseEntity.ShopTheme, nextShopThemeEntity),
      this.idb.add(DatabaseEntity.ShopThemeSnapshot, duplicatedSnapshotEntity),
      this.idb.add(DatabaseEntity.ShopThemeSource, duplicatedSourceEntity),
    ]).then((e) => ({
      ...nextShopThemeEntity,
      source: {
        ...duplicatedSourceEntity,
        snapshot: duplicatedSnapshotEntity,
      },
    }));
  }

  @ImitateHttp
  async publishShopThemeVersion(shopId: PebShopId, versionId: PebShopThemeVersionId) {
    const shopTheme = await this.idb.getByID<PebShopThemeEntity>(
      DatabaseEntity.ShopTheme, shopId,
    );

    if (shopTheme.publishedId === versionId) {
      throw new Error('Already published');
    }

    // const version = await this.idb.getByID<PebShopThemeEntity>(
    //   DatabaseEntity.ShopThemeVersion, versionId,
    // );

    // TODO: Calculate result for PebShopThemeVersionEntity

    // const shopSource = {
    //   ...shopTheme,
    //   publishedId: version.id,
    // };
    //
    // return this.idb.update(DatabaseEntity.ShopTheme, shopSource);

    let version: PebShopThemeVersionEntity;
    const versions = await this.idb.getAll<PebShopThemeVersionEntity>(DatabaseEntity.ShopThemeVersion);
    return Promise.all(versions.map(v => {
      if (v.id === versionId) {
        v.published = true;
        version = v;
      } else {
        v.published = false;
      }
      return this.idb.update(DatabaseEntity.ShopThemeVersion, v);
    })).then(() => version);
  }

  @ImitateHttp
  async updateShop(payload: any) {
    of(null);
  }

  @ImitateHttp
  async getShop(shopId: PebShopId) {
    return await this.idb.getByID(DatabaseEntity.ShopTheme, shopId);
    // return {
    //   shopId,
    //   businessId: '',
    //   channelId: '',
    //   name: 'Test Shop',
    //   picture: null,
    //   isDefault: false,
    //   deploy: {
    //     shopId,
    //     isLive: false,
    //     internalDomain: '',
    //     ownDomain: null,
    //     isPrivate: false,
    //     privateMessage: null,
    //     privatePassword: null,
    //   },
    // };
  }

  @ImitateHttp
  async uploadImage(container: string, file: File) {
    const { blobName } = await this.mediaService.uploadImage(file, container).toPromise()
    const result = {
      blobName,
      brightnessGradation: 'default',
      preview: '',
    };
    if (this.envService.shopId) {
      const shop = await this.idb.getByID<PebShopThemeEntity>(DatabaseEntity.ShopTheme, this.envService.shopId);
      shop.picture = result.blobName;
      await this.idb.update(DatabaseEntity.ShopTheme, shop);
    }
    return result;
  }

  @ImitateHttp
  uploadVideo(container: string, file: File) {
    return of({
      blobName: URL.createObjectURL(file),
      brightnessGradation: 'default',
      preview: '',
    });
  }

  @ImitateHttp
  uploadVideoWithProgress(container: string, file: File) {
    return of(null).pipe(
      delay(500),
      map(_ => ({
        body: {
          blobName: '',
          brightnessGradation: 'default',
          preview: '',
        },
        type: HttpEventType.UploadProgress,
        loaded: 50,
      })),
      delay(1000),
      map(_ => ({
        body: {
          blobName: URL.createObjectURL(file),
          brightnessGradation: 'default',
          preview: '',
        },
        type: HttpEventType.Response,
        loaded: 100,
      })),
    );
  }

  @ImitateHttp
  uploadImageWithProgress(container: string, file: File) {
    return of(null).pipe(
      delay(500),
      map(_ => ({
        body: {
          blobName: '',
          brightnessGradation: 'default',
          preview: '',
        },
        type: HttpEventType.UploadProgress,
        loaded: 50,
      })),
      delay(1000),
      map(_ => ({
        body: {
          blobName: URL.createObjectURL(file),
          brightnessGradation: 'default',
          preview: '',
        },
        type: HttpEventType.Response,
        loaded: 100,
      })),
    );
  }

  @ImitateHttp
  getProductsCategories() {
    return of([
      {
        title: 'First category',
        id: '1',
      },
      {
        title: 'Second category',
        id: '2',
      },
      {
        title: 'Third category',
        id: '3',
      },
      {
        title: 'Fourth category',
        id: '4',
      },
    ]);
  }

  @ImitateHttp
  getProducts() {
    return of([
      {
        id: '1',
        images: ['https://payeverproduction.blob.core.windows.net/builder/30620168-61f3-4961-8252-224ba3cb6633-nike-dream.jpg'],
        title: 'Sport sneakers',
        price: 1200,
      },
      {
        id: '2',
        images: ['https://payeverproduction.blob.core.windows.net/builder/30620168-61f3-4961-8252-224ba3cb6633-nike-dream.jpg'],
        title: 'Sport sneakers',
        price: 1200,
      },
      {
        id: '3',
        images: ['https://payeverproduction.blob.core.windows.net/builder/30620168-61f3-4961-8252-224ba3cb6633-nike-dream.jpg'],
        title: 'Sport sneakers',
        price: 1200,
      },
      {
        id: '4',
        images: ['https://payeverproduction.blob.core.windows.net/builder/30620168-61f3-4961-8252-224ba3cb6633-nike-dream.jpg'],
        title: 'Sport sneakers',
        price: 1200,
      },
    ])
  }

  //
  //  Utils
  //
  private async getThemeWithRelations(themeId: string) {
    const theme = await this.idb.getByID<PebShopThemeEntity>(
      DatabaseEntity.ShopTheme, themeId,
    );
    const source = await this.idb.getByID<PebShopThemeSourceEntityOld>(
      DatabaseEntity.ShopThemeSource, theme.sourceId,
    );
    const snapshot = await this.idb.getByID<PebShopThemeSnapshot>(
      DatabaseEntity.ShopThemeSnapshot, source.snapshotId,
    );

    return { theme, source, snapshot };
  }
}
