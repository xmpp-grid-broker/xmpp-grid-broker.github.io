import {by, ElementArrayFinder, ElementFinder} from 'protractor';
import {Locatable} from './locatable';

export class List implements Locatable {

  constructor(readonly parentElement: Locatable) {
  }

  get locator(): ElementFinder {
    return this.parentElement.locator.element(by.tagName('xgb-list'));
  }

  get listElements(): ElementArrayFinder {
    return this.locator.all(by.tagName('xgb-list-item'));
  }

  async listContent(): Promise<string[]> {
    const elements = await this.listElements;
    return Promise.all(elements.map(listElement => listElement.getText()));
  }

  async length(): Promise<number> {
    const list = await this.listElements;
    return list.length;
  }
}
