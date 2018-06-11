import {AfterViewInit, Directive, ElementRef} from '@angular/core';

/**
 * A simple directive that sets the focus on the element on which this is applied.
 * Intended as replacement for the native `autofocus` property for elements that are rendered conditionally.
 */
@Directive({
  selector: '[xgbSetFocus]'
})
export class SetFocusDirective implements AfterViewInit {
  constructor(private el: ElementRef) {
  }

  ngAfterViewInit() {
    this.el.nativeElement.focus();
  }
}
