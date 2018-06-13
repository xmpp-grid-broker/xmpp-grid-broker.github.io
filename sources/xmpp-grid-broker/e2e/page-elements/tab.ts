import {by, ElementFinder} from 'protractor';

import {Component, promisePresenceOf, UrlAddressableComponent} from '../utilities';

export abstract class Tab extends UrlAddressableComponent {

  protected constructor(readonly parentElement: Component) {
    super();
  }

  abstract get linkText(): string;

  abstract get locator(): ElementFinder;


  get tabBarLocator(): ElementFinder {
    return this.parentElement.locator.element(by.tagName('xgb-tabs'));
  }

  get linkElement(): ElementFinder {
    return this.tabBarLocator.element(by.linkText(this.linkText));
  }

  public awaitPresence(): Promise<void> {
    return this.parentElement.awaitPresence()
      .then(() => promisePresenceOf(this.locator))
      .then(() => promisePresenceOf(this.tabBarLocator));
  }

  public awaitFullyLoaded(): Promise<void> {
    return this.awaitPresence();
  }
}
