import {Directive, HostBinding} from '@angular/core';

/**
 * Simple directive that applies form styling.
 */
@Directive({
  selector: '[xgbForm]',
})
export class FormDirective {
  @HostBinding('class')
  elementClass = 'form-horizontal';

}
