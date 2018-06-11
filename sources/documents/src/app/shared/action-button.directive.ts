import {Directive, ElementRef} from '@angular/core';


/**
 * This directive can be applied to buttons or links
 * to style them as action buttons.
 *
 * The following (optional) properties can be applied as variants:
 * * `primary`
 * * `danger`
 */
@Directive({
  selector: '[xgbActionButton]'
})
export class ActionButtonDirective {
  constructor(private el: ElementRef) {
    el.nativeElement.classList.add('btn');
    if (el.nativeElement.hasAttribute('primary')) {
      el.nativeElement.classList.add('btn-primary');
    }
    if (el.nativeElement.hasAttribute('danger')) {
      el.nativeElement.classList.add('btn-error');
    }
  }

}
