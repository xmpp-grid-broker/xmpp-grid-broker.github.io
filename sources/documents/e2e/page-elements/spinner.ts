import {$, browser, protractor} from 'protractor';

export class Spinner {
  /**
   * Returns promise that resolves as soon as no `xgb-spinner`-tags are visible.
   */
  static waitOnNone(retryMs: number = 20000): Promise<void> {
    const EC = protractor.ExpectedConditions;
    return new Promise(resolve => {
      setTimeout(() => {
        const spinner = $('xgb-spinner');
        browser.wait(EC.not(EC.presenceOf(spinner)), retryMs)
          .then(() => resolve());
      }, 200); // wait a moment to give the spinner time to initialise
    });
  }
}
