import {ChangeDetectorRef, Component, DoCheck, EventEmitter, Input, Output} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';

import {Topic, XmppDataForm, XmppDataFormField, XmppDataFormFieldType} from '../../core';

/**
 * A component that provides a specific form to create and configure a topic/collection.
 */
@Component({
  selector: 'xgb-topic-config',
  templateUrl: './topic-config.component.html'
})
export class TopicConfigComponent implements DoCheck {
  /**
   * The loaded topic (if modified)
   */
  @Input() public topic: undefined | Topic;

  /**
   * The label of the submit button.
   */
  @Input() public submitLabel: string;

  /**
   * Event to bind to when the form is submitted.
   * The changed fields will be passed in the
   * form of an {XmppDataForm}.
   */
  @Output() public configSubmitted = new EventEmitter<XmppDataForm>();

  /**
   * A subset of the xmppDataForm that contains
   * all fields, for which no specific widgets
   * have been specified.
   */
  advancedConfigForm: XmppDataForm;

  /**
   * Fields, for which a specialized widget / validation takes place.
   */
  specificFormFields: { [key: string]: XmppDataFormField } = {
    'pubsub#title': undefined,
    'pubsub#children': undefined,
    'pubsub#collection': undefined
  };

  /**
   * The Angular Form group used for form
   * binding (and eventually validation)
   * containing all fields of the
   * xmppDataForm. Form Binding is
   * managed by this
   */
  formGroup: FormGroup;
  XmppDataFormFieldType = XmppDataFormFieldType;

  constructor(private cd: ChangeDetectorRef) {
  }

  private _xmppDataForm: XmppDataForm;

  /**
   * The xmpp data for as loaded from the server.
   */
  @Input()
  public set xmppDataForm(form: XmppDataForm) {
    this.installForm(form);
  }

  onFormSubmit(): void {
    this.configSubmitted.emit(this.createFormToSubmit());
  }


  public ngDoCheck(): void {
    this.cd.detectChanges();
  }

  public installForm(form: XmppDataForm) {
    if (!form) {
      this._xmppDataForm = null;
      this.formGroup = null;

      return;
    }

    this._xmppDataForm = form;
    this.formGroup = new FormGroup({});
    this.installSpecificForm();
    this.installAdvancedConfigForm();

  }

  public createFormToSubmit(): XmppDataForm {
    return XmppDataForm.fromFormGroup(this.formGroup, this._xmppDataForm);
  }


  private installSpecificForm() {
    this._xmppDataForm.fields.forEach((field) => {
      if (this.isSpecificFormField(field.name)) {
        const control = new FormControl(field.value);
        this.formGroup.addControl(field.name, control);
        this.specificFormFields[field.name] = field;
      }
    });
  }

  private installAdvancedConfigForm() {
    const fields = this._xmppDataForm.fields.filter((field: XmppDataFormField) =>
      !this.isSpecificFormField(field.name)
    );
    this.advancedConfigForm = new XmppDataForm(fields);
  }

  private isSpecificFormField(fieldName: string): boolean {
    return Object.keys(this.specificFormFields).indexOf(fieldName) >= 0;
  }
}
