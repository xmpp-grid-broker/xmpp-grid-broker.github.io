import {Pipe, PipeTransform} from '@angular/core';

/**
 * Variable (names) in DataForms (XEP-0004) are usually namespaced.
 * This pipe gets rid of the namespace to improve readability for the user.
 *
 * Eg. `pubsub#max_items` -> `max_items`
 */
@Pipe({
  name: 'FormFieldName',
  pure: true
})
export class FormFieldNamePipe implements PipeTransform {
  transform(value: string): any {
    const lastHash = value.lastIndexOf('#');
    if (lastHash > -1) {
      return value.substr(lastHash + 1);
    }
    return value;
  }

}
