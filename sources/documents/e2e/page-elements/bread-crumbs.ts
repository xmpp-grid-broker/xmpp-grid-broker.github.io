import {by, ElementArrayFinder, ElementFinder} from 'protractor';

import {Component, promisePresenceOf, toPromise} from '../utilities';

export class BreadCrumbs implements Component {

  constructor(readonly parentElement: Component) {
  }

  get locator(): ElementFinder {
    return this.parentElement.locator.element(by.tagName('xgb-bread-crumb'));
  }

  get crumbElements(): ElementArrayFinder {
    return this.locator.all(by.css('.breadcrumb-item'));
  }

  public awaitPresence(): Promise<void> {
    return this.parentElement.awaitPresence()
      .then(() => promisePresenceOf(this.locator));
  }

  public awaitFullyLoaded(): Promise<void> {
    return this.awaitPresence().then(() => promisePresenceOf(this.crumbElements.first()));
  }

  public crumbContent(): Promise<string[]> {
    const elements = this.crumbElements
      .map(crumbElement => toPromise(crumbElement.$('a').getText()));
    return toPromise(elements).then((content) => Promise.all(content));
  }

  public async length(): Promise<number> {
    return toPromise(this.crumbElements.then(arr => arr.length));
  }
}
