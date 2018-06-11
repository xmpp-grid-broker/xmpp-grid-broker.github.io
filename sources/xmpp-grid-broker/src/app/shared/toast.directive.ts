import {Directive, ElementRef} from '@angular/core';

/**
 * A directive to be applied to containers containing
 * error/success messages.
 *
 * Variations:
 *
 * * Default
 * * Success (add attribute `toast-success`)
 * * Error (add attribute `toast-error`)
 */
@Directive({
  selector: '[xgbToast]'
})
export class ToastDirective {
  constructor(private el: ElementRef) {
    el.nativeElement.classList.add('toast');
    if (el.nativeElement.hasAttribute('toast-success')) {
      el.nativeElement.classList.add('toast-success');
    } else if (el.nativeElement.hasAttribute('toast-error')) {
      el.nativeElement.classList.add('toast-error');
    }
  }

}
