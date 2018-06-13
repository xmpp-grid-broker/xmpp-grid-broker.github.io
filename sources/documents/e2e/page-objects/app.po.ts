import {by, element, ElementFinder} from 'protractor';

import {BreadCrumbs} from '../page-elements';
import {promisePresenceOf, UrlAddressableComponent} from '../utilities';

export class AppPage extends UrlAddressableComponent {
  get landingUrl(): string {
    return '/';
  }

  get locator(): ElementFinder {
    return element(by.tagName('xgb-root'));
  }

  get breadCrumbs(): BreadCrumbs {
    return new BreadCrumbs(this);
  }

  public awaitPresence(): Promise<void> {
    return promisePresenceOf(this.locator);
  }

  public awaitFullyLoaded(): Promise<void> {
    return this.breadCrumbs.awaitFullyLoaded();
  }
}
