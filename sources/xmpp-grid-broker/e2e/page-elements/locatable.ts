import {ElementFinder} from 'protractor';

export interface Locatable {
  readonly locator: ElementFinder;
}
