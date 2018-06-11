import {promise} from 'protractor';

export function toPromise<T>(wrapMe: promise.IThenable<T>): Promise<T> {
  return new Promise((resolve, reject) => wrapMe.then(resolve).catch(reject));
}
