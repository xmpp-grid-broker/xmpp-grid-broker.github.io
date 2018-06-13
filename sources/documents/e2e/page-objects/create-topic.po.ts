import {by, element, ElementFinder} from 'protractor';

import {promisePresenceOf, UrlAddressableComponent} from '../utilities';

export class CreateTopicPage extends UrlAddressableComponent {
  get landingUrl(): string {
    return '/topics/new/topic';
  }

  get locator(): ElementFinder {
    return element(by.tagName('xgb-topic-creation'));
  }

  public awaitPresence(): Promise<void> {
    return promisePresenceOf(this.locator);
  }

  public awaitFullyLoaded(): Promise<void> {
    return this.awaitPresence();
  }
}
