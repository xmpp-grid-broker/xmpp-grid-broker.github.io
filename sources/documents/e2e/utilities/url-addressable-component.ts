import {browser} from 'protractor';
import {Component} from './component';
import {toPromise} from './helpers';

export abstract class UrlAddressableComponent implements Component {

  abstract get locator();

  abstract get landingUrl();

  get fullUrl() {
    return browser.baseUrl + this.landingUrl;
  }

  public abstract awaitPresence(): Promise<void>;

  public abstract awaitFullyLoaded(): Promise<void>;

  /**
   * Navigate to {@member fullUrl} and wait until
   * the page loads and there are no waiting spinners.
   */
  public async navigateTo() {
    browser.waitForAngularEnabled(false);
    await toPromise(browser.get(this.landingUrl));
    await this.awaitFullyLoaded();
  }
}
