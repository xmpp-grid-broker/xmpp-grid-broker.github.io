import {by, ElementFinder} from 'protractor';

import {Component, promisePresenceOf, toPromise} from '../utilities';

export class Form implements Component {
  constructor(readonly parentElement: Component, readonly _locator: (parent: Component) => ElementFinder) {
  }

  get locator(): ElementFinder {
    return this._locator(this.parentElement);
  }

  public awaitPresence(): Promise<void> {
    return this.parentElement.awaitPresence().then(() => promisePresenceOf(this.locator));
  }

  public awaitFullyLoaded(): Promise<void> {
    return this.awaitPresence();
  }

  public async getFieldValue(fieldId: string): Promise<string> {
    return toPromise(this.getInputElement(fieldId).getAttribute('value'));
  }

  public async setFieldValue(fieldId: string, newValue: any): Promise<void> {
    return toPromise(this.getInputElement(fieldId).sendKeys(newValue));
  }

  private getInputElement(fieldId: string): ElementFinder {
    return this.locator.element(by.id(fieldId));
  }
}
