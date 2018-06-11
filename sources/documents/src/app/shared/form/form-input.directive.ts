import {Directive, ElementRef, HostListener, Input, OnChanges} from '@angular/core';

/**
 * This directive can be applied to all form elements
 * in order to apply the styling to them.
 *
 * Additionally, if the `hasError` attribute is set,
 * the field is marked as invalid if hasError changes to `true`.
 */
@Directive({
  selector: '[xgbFormInput]',
})
export class FormInputDirective implements OnChanges {

  @Input() hasError: boolean;

  constructor(private el: ElementRef) {
    if (el.nativeElement.tagName === 'SELECT') {
      el.nativeElement.classList.add('form-select');
    } else {
      el.nativeElement.classList.add('form-input');
    }
  }

  @HostListener('change') ngOnChanges() {
    if (this.hasError) {
      this.el.nativeElement.classList.add('is-error');
    } else {
      this.el.nativeElement.classList.remove('is-error');
    }
  }
}
