import {Directive, Input} from '@angular/core';
import {AbstractControl, NG_VALIDATORS, ValidationErrors, Validator} from '@angular/forms';

/**
 * A validator directive that can be applied to an input field
 * to prevent adding one of the given elements to the list to prevent
 * duplicates.
 */
@Directive({
  selector: '[xgbNoDuplicatesAllowed]',
  providers: [{provide: NG_VALIDATORS, useExisting: NoDuplicatesAllowedDirective, multi: true}]
})
export class NoDuplicatesAllowedDirective implements Validator {
  /**
   * The set of elements already exist.
   */
  @Input() xgbNoDuplicatesAllowed: any[];

  /**
   * The property key on the elements stored xgbNoDuplicatesAllowed
   * that is checked for duplicates.
   */
  @Input() xgbDuplicateKey: any;

  validate(c: AbstractControl): ValidationErrors | null {
    let list = this.xgbNoDuplicatesAllowed;
    if (this.xgbDuplicateKey) {
      list = this.xgbNoDuplicatesAllowed.map((item) => item[this.xgbDuplicateKey]);
    }
    if (list.indexOf(c.value) >= 0) {
      return {duplicate: true};
    }
    return null;

  }
}
