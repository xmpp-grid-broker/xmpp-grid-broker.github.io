import {Component, Input} from '@angular/core';

/**
 * Just a wrapper that can be collapsed and expanded by clicking
 * on it.
 */
@Component({
  selector: 'xgb-collapsible',
  templateUrl: './collapsible.component.html',
  styleUrls: ['./collapsible.component.css'],
})
export class CollapsibleComponent {

  @Input() public isVisible = false;
  @Input() public title: string;

  toggle() {
    this.isVisible = !this.isVisible;
  }

}
