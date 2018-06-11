import {by, ElementFinder} from 'protractor';
import {Locatable} from './locatable';
import {UrlAddressableComponent} from './urlAddressableComponent';

export abstract class Tab extends UrlAddressableComponent implements Locatable {

  protected constructor(public parentElement: Locatable) {
    super();
  }

  abstract get linkText(): string;

  get locator(): ElementFinder {
    return this.parentElement.locator;
  }

  get tabBarLocator(): ElementFinder {
    return this.parentElement.locator.element(by.tagName('xgb-tabs'));
  }

  get linkElement(): ElementFinder {
    return this.tabBarLocator.element(by.linkText(this.linkText));
  }
}
