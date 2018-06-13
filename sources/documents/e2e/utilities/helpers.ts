import {browser, ElementFinder, ExpectedConditions, promise} from 'protractor';

/**
 * Convert WebDriver-Promises into ES-Promises.
 */
export function toPromise<T>(wrapMe: promise.IThenable<T>): Promise<T> {
  return new Promise((resolve, reject) => wrapMe.then(resolve).catch(reject));
}

/**
 * Creates Promise that returns as soon as {@param element} is present.
 */
export function promisePresenceOf(element: ElementFinder): Promise<void> {
  return toPromise(browser.wait(ExpectedConditions.presenceOf(element)));
}
