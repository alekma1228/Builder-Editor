import { DBConfig } from 'ngx-indexed-db';

export enum DatabaseEntity {
  ShopTheme = 'shop-theme',
  ShopThemeVersion = 'shop-theme-version',
  ShopThemeSource = 'shop-theme-source',
  ShopThemeSnapshot = 'shop-theme-snapshot',
  RawTheme = 'raw-theme',
}

export const MockEditorDatabaseConfig: DBConfig = {
  name: 'Sandbox Editor',
  version: 1,
  objectStoresMeta: [
    //
    //  Editor entities
    //
    {
      store: DatabaseEntity.ShopTheme,
      storeConfig: { keyPath: 'id', autoIncrement: false },
      storeSchema: [
        // { name: 'name', keypath: 'name', options: { unique: false } },
        // { name: 'sourceId', keypath: 'sourceId', options: { unique: false } },
      ],
    },
    {
      store: DatabaseEntity.ShopThemeVersion,
      storeConfig: { keyPath: 'id', autoIncrement: false },
      storeSchema: [],
    },
    {
      store: DatabaseEntity.ShopThemeSource,
      storeConfig: { keyPath: 'id', autoIncrement: false },
      storeSchema: [
        // { name: 'snapshotId', keypath: 'snapshotId', options: { unique: true } },
      ],
    },
    {
      store: DatabaseEntity.ShopThemeSnapshot,
      storeConfig: { keyPath: 'id', autoIncrement: false },
      storeSchema: [],
    },
    {
      store: DatabaseEntity.RawTheme,
      storeConfig: { keyPath: 'id', autoIncrement: false },
      storeSchema: [],
    },
  ],
};
