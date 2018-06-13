import {by, ElementArrayFinder, ElementFinder} from 'protractor';

import {Component, promisePresenceOf} from '../utilities';

export class List implements Component {

  constructor(readonly parentElement: Component) {
  }

  get locator(): ElementFinder {
    return this.parentElement.locator.element(by.tagName('xgb-list'));
  }

  get listElements(): ElementArrayFinder {
    return this.locator.all(by.tagName('xgb-list-item'));
  }

  public awaitPresence(): Promise<void> {
    return this.parentElement.awaitPresence().then(() => promisePresenceOf(this.locator));
  }

  public awaitFullyLoaded(): Promise<void> {
    return this.awaitPresence().then(() => promisePresenceOf(this.listElements.first()));
  }

  public async listContent(): Promise<string[]> {
    const elements = await this.listElements;
    return Promise.all(elements.map(listElement => listElement.getText()));
  }

  public async length(): Promise<number> {
    const list = await this.listElements;
    return list.length;
  }
}
