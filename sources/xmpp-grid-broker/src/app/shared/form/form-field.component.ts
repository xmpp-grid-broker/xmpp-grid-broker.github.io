import {Component, Input} from '@angular/core';

/**
 * A component that contains an input field, providing
 * a help field, label and styling for that wrapped
 * field.
 */
@Component({
  selector: 'xgb-form-field',
  templateUrl: './form-field.component.html',
  styleUrls: ['./form-field.component.css']
})
export class FormFieldComponent {
  @Input() public fieldId: string;
  @Input() public fieldLabel: string;
  @Input() public fieldHelp: string;
}
