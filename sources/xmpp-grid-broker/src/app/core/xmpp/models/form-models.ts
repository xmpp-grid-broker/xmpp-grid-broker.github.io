import {FormGroup} from '@angular/forms';

/**
 * Field types as defined in xep-0004.
 */
export enum XmppDataFormFieldType {
  hidden = 'hidden',
  boolean = 'boolean',

  textSingle = 'text-single',
  textMulti = 'text-multi',

  jidMulti = 'jid-multi',
  listMulti = 'list-multi',
  listSingle = 'list-single',

  jidSingle = 'jid-single'
}

/**
 * Utility class to represent options of a selection field
 * as defined in XEP-0004.
 */
export class ListOption {
  constructor(public readonly value: string,
              public readonly label: string = null) {
  }

  /**
   * Maps the given option list as received from stanza
   * into {@type ListOption}s.
   */
  static optionsFromJSON(options: any): ListOption[] {
    if (options) {
      return options.map((option) =>
        new ListOption(option.value, option.label)
      );
    } else {
      return [];
    }
  }

}

/**
 * Represents an XMPP field as defined in XEP-0004.
 */
export class XmppDataFormField {
  constructor(public readonly type: XmppDataFormFieldType,
              public readonly name: string,
              public readonly value: any,
              public readonly label: string = null,
              public readonly options: ListOption[] = null) {
  }

  /**
   * Converts the given field into an {@type XmppDataFormField}.
   */
  static fromJSON(field: any) {
    return new XmppDataFormField(
      field.type,
      field.name,
      (field.value) ? field.value : null,
      field.label,
      (field.type === 'list-multi' || field.type === 'list-single') ? ListOption.optionsFromJSON(field.options) : null
    );
  }

  /**
   * Converts this instance into a plain js object to be used by stanza.
   */
  toJSON(): object {
    return {
      name: this.name,
      value: this.value
    };
  }

  /**
   * Creates an identical copy of this instance with a changed value.
   * Useful when creating submit forms.
   */
  cloneWithNewValue(newValue: any): XmppDataFormField {
    return new XmppDataFormField(
      this.type,
      this.name,
      newValue,
      this.label,
      this.options
    );
  }
}

/**
 * Utility class to represent a form as defined in XEP-0004.
 */
export class XmppDataForm {
  constructor(public readonly fields: XmppDataFormField[]) {
  }

  /**
   * Converts the given plain json value as received from
   * stanza.io into a {@type XmppDataForm}.
   */
  static fromJSON(jsonForm: any) {
    return new XmppDataForm(jsonForm.fields.map((field) => {
      return XmppDataFormField.fromJSON(field);
    }));
  }

  /**
   * Creates a new form group based on the given xmpp data form
   * but only containing the fields which values differ from
   * the original form.
   */
  static fromFormGroup(formGroup: FormGroup, form: XmppDataForm): XmppDataForm {
    if (!form || !formGroup) {
      return null;
    }

    const fields = [];

    form.fields.forEach((field: XmppDataFormField) => {
        const newValue = formGroup.get(field.name).value;
        if (field.name !== 'FORM_TYPE' && newValue === field.value) {
          return;
        }
        fields.push(field.cloneWithNewValue(newValue));
      }
    );

    return new XmppDataForm(fields);

  }

  /**
   * Converts this form into a plain json object, that can be submitted via
   * to stanza.
   */
  toJSON(type = 'submit'): object {
    return {fields: this.fields.map((field: XmppDataFormField) => field.toJSON()), type};
  }
}
