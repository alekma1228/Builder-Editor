import { PebShopThemeSnapshot } from './models/database';
import { PebPageType, PebShop } from './models/client';
import { PebScreen } from './constants';

export function snapshotToSourceConverter(snapshot: PebShopThemeSnapshot): PebShop {
  const pages = Object.values(snapshot.pages)
    // .filter(page => page.type === PebPageType.Replica)
    .map(page => ({
      id: page.id,
      name: page.name,
      variant: page.variant,
      data: page.data,
      type: page.type,
      template: snapshot.templates[page.templateId],
      stylesheets: {
        [PebScreen.Desktop]: snapshot.stylesheets[page.stylesheetIds[PebScreen.Desktop]],
        [PebScreen.Tablet]: snapshot.stylesheets[page.stylesheetIds[PebScreen.Tablet]],
        [PebScreen.Mobile]: snapshot.stylesheets[page.stylesheetIds[PebScreen.Mobile]],
      },
      context: snapshot.contextSchemas[page.contextId],
    }));

  return {
    data: (snapshot.shop as any).data,
    routing: (snapshot.shop as any).routing,
    pages,
    context: snapshot.contextSchemas[(snapshot.shop as any).contextId],
  } as any;
}
