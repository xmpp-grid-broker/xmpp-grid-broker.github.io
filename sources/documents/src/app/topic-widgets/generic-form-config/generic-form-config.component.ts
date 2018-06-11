import {Component, Input, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';

import {XmppDataForm, XmppDataFormField, XmppDataFormFieldType} from '../../core';

/**
 * A component that renders any given {@type XmppDataForm} (see xep-0004)
 * using generic for elements.
 */
@Component({
  selector: 'xgb-generic-form-config',
  templateUrl: './generic-form-config.component.html',
  styleUrls: ['./generic-form-config.component.css']
})
export class GenericFormConfigComponent implements OnInit {
  /**
   * The xmpp data form to render. Must be available at `onInit`.
   */
  @Input() public xmppDataForm: XmppDataForm;

  /**
   * The form to which this config belongs to.
   * **NOTE** This component will create FormControls
   * for every element of the given XmppDataForm
   * including (possible) validators.
   */
  @Input() public formGroup: FormGroup;

  // This is a reference to be able to check types in the angular templates
  readonly fieldType = XmppDataFormFieldType;

  ngOnInit(): void {
    this.xmppDataForm.fields.forEach((field: XmppDataFormField) => {
      const validators = [];
      this.formGroup.addControl(field.name, new FormControl(field.value, validators));
    });
  }
}
