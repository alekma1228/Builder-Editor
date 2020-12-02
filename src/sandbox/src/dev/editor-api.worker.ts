/// <reference lib="webworker" />

import { NgxIndexedDBService } from 'ngx-indexed-db';

import {
  hashString,
  PebAction, pebActionHandler,
  pebCompileActions,
  PebShopId,
  PebShopThemeEntity,
  PebShopThemeSnapshot,
} from '@pe/builder-core';

import { DatabaseEntity, MockEditorDatabaseConfig } from './editor.idb-config';
import { MockLockingService } from './locking.service';
import { WorkerMessage, WorkerMessageType } from './worker-messages';

(self as any).window = self;

export class SandboxMockApiWorker {

  private locking = new MockLockingService();
  private idb: NgxIndexedDBService;

  constructor() {

    this.idb = new NgxIndexedDBService(MockEditorDatabaseConfig, 'browser');

    addEventListener('message', event => {
      const { messageType, messageId, data } = event.data as WorkerMessage;
      switch (messageType) {
        case WorkerMessageType.DeleteAction: {
          const { themeId, actionId } = data;
          this.undoAction(themeId, actionId).then(result => {
            postMessage({ messageType, messageId, data: result })
          });
          break;
        }
        case WorkerMessageType.AddAction: {
          const { themeId, action } = data;
          this.addAction(themeId, action).then(result => {
            postMessage({ messageType, messageId, data: result })
          });
          break;
        }
      }
    });
  }

  async addAction(themeId: PebShopId, action: PebAction): Promise<{ sourceHash: string; snapshotHash: string }> {
    const lock = await this.locking.acquireLock(themeId);

    let { source, snapshot } = await this.getThemeWithRelations(themeId);

    source = {
      ...source,
      hash: hashString(source.hash + action.id),
      actions: [...source.actions, action],
    };

    snapshot = pebActionHandler(snapshot, action);

    await Promise.all([
      this.idb.update(DatabaseEntity.ShopThemeSource, source),
      this.idb.update(DatabaseEntity.ShopThemeSnapshot, snapshot),
    ]);
    await lock.release();

    return {
      sourceHash: source.hash,
      snapshotHash: snapshot.hash,
    };
  }

  async undoAction(themeId: PebShopId, actionId: string): Promise<{ snapshot: PebShopThemeSnapshot }> {
    const lock = await this.locking.acquireLock(themeId);

    let { source, snapshot } = await this.getThemeWithRelations(themeId);

    source = {
      ...source,
      actions: source.actions.filter(a => a.id !== actionId),
    };
    snapshot = {
      ...pebCompileActions(source.actions),
      id: snapshot.id,
    };

    await Promise.all([
      this.idb.update(DatabaseEntity.ShopThemeSource, source),
      this.idb.update(DatabaseEntity.ShopThemeSnapshot, snapshot),
    ])
    await lock.release()

    return { snapshot };
  }

  private async getThemeWithRelations(themeId: string) {
    const theme = await this.idb.getByID<PebShopThemeEntity>(
      DatabaseEntity.ShopTheme, themeId,
    );
    const source = await this.idb.getByID<any>(
      DatabaseEntity.ShopThemeSource, theme.sourceId,
    );
    const snapshot = await this.idb.getByID<PebShopThemeSnapshot>(
      DatabaseEntity.ShopThemeSnapshot, source.snapshotId,
    );

    return { theme, source, snapshot };
  }
}

const worker = new SandboxMockApiWorker();
