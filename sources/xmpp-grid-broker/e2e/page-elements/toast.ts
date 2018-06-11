import {browser, by, ElementArrayFinder, ElementFinder, ExpectedConditions} from 'protractor';
import {toPromise} from '../helpers';
import {Locatable} from './locatable';

export class ToastContent {
  constructor(
    readonly text: string,
    readonly success: boolean
  ) {
  }
}

export class Toast implements Locatable {

  constructor(public parentElement: Locatable) {
  }

  get locator(): ElementFinder {
    return this.parentElement.locator;
  }

  get toastLocators(): ElementArrayFinder {
    return this.locator.all(by.css('div.toast'));
  }

  get messages(): Promise<ToastContent[]> {
    const waitConditions = ExpectedConditions.and(
      ExpectedConditions.presenceOf(this.toastLocators.first()),
      ExpectedConditions.visibilityOf(this.toastLocators.first())
    );
    return toPromise(browser.wait(waitConditions))
      .then(() => toPromise(this.toastLocators.map<ToastContent>(async toastElement => {
        const text = await toastElement.getText();
        const success = await this.elementHasClass(toastElement, 'toast-success');
        return new ToastContent(text, success);
      })));
  }

  private elementHasClass(element: ElementFinder, cls: string): Promise<boolean> {
    return toPromise(element.getAttribute('class')).then((classes) => {
      return classes.split(' ').includes(cls);
    });
  }

}
