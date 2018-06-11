import {Component, Input} from '@angular/core';

/**
 * A switch input element that is used instead of checkboxes.
 */
@Component({
  selector: 'xgb-form-switch',
  templateUrl: './form-switch.component.html'
})
export class FormSwitchComponent {
  @Input() public fieldLabel: string;
}
