import {by, ElementArrayFinder, ElementFinder} from 'protractor';
import {Locatable} from './locatable';

export class BreadCrumbs implements Locatable {

  constructor(readonly parentElement: Locatable) {
  }

  get locator(): ElementFinder {
    return this.parentElement.locator.element(by.tagName('xgb-bread-crumb'));
  }

  get crumbElements(): ElementArrayFinder {
    return this.locator.all(by.css('.breadcrumb-item'));
  }

  async crumbContent(): Promise<string[]> {
    const elements = await this.crumbElements;
    return Promise.all(elements.map((crumbElement: ElementFinder) => crumbElement.$('a').getText()));
  }

  async length(): Promise<number> {
    const list = await this.crumbElements;
    return list.length;
  }
}
