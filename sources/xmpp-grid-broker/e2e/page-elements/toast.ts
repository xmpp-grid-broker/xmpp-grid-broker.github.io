import {browser, by, ElementArrayFinder, ElementFinder, ExpectedConditions} from 'protractor';

import {Component, promisePresenceOf, toPromise} from '../utilities';

export class ToastContent {
  constructor(
    readonly text: string,
    readonly success: boolean
  ) {
  }
}

export class Toast implements Component {

  constructor(public parentElement: Component) {
  }

  get locator(): ElementFinder {
    return this.parentElement.locator;
  }

  get toastLocators(): ElementArrayFinder {
    return this.locator.all(by.css('div.toast'));
  }

  get messages(): Promise<ToastContent[]> {
    return this.awaitFirstToast()
      .then(() => toPromise(this.toastLocators
        .map(async toastElement => new ToastContent(
          await toPromise(toastElement.getText()),
          await this.elementHasClass(toastElement, 'toast-success')
        ))
      ))
      .then(promises => Promise.all(promises));
  }

  public awaitFirstToast(): Promise<void> {
    return toPromise(browser.wait(ExpectedConditions.and(
      ExpectedConditions.presenceOf(this.toastLocators.first()),
      ExpectedConditions.visibilityOf(this.toastLocators.first())
    )));
  }

  public awaitPresence(): Promise<void> {
    return this.parentElement.awaitPresence().then(() => promisePresenceOf(this.locator));
  }

  public awaitFullyLoaded(): Promise<void> {
    return this.awaitPresence();
  }

  private elementHasClass(element: ElementFinder, cls: string): Promise<boolean> {
    const classAttribute = toPromise(element.getAttribute('class'));
    return classAttribute.then((classes) => classes.split(' ').includes(cls));
  }

}
