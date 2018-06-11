import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {By} from '@angular/platform-browser';

import {FormFieldNamePipe, GenericFormConfigComponent, JidMultiComponent} from '..';
import {ListOption, XmppDataForm, XmppDataFormField, XmppDataFormFieldType} from '../../core';
import {FormFieldComponent} from '../../shared';
import {SharedModule} from '../../shared/shared.module';

const TEST_FIELD_TEXT_SINGLE = new XmppDataFormField(
  XmppDataFormFieldType.textSingle,
  'pubsub#title',
  'Princely Musings (Atom)',
  'A friendly name for the node'
);
const TEST_FIELD_TEXT_MULTI = new XmppDataFormField(
  XmppDataFormFieldType.textMulti,
  'pubsub#children',
  '',
  'The child nodes (leaf or collection) associated with a collection'
);
const TEST_FIELD_BOOLEAN = new XmppDataFormField(
  XmppDataFormFieldType.boolean,
  'pubsub#deliver_notifications',
  true,
  'Whether to deliver event notifications'
);
const TEST_FIELD_LIST_SINGLE = new XmppDataFormField(
  XmppDataFormFieldType.listSingle,
  'pubsub#access_model',
  null,
  'Specify the subscriber model',
  [
    new ListOption('authorize', 'Subscription requests must be approved and only subscribers may retrieve items'),
    new ListOption('open', 'Anyone may subscribe and retrieve items'),
    new ListOption('presence', 'Anyone with a presence subscription of both or from may subscribe and retrieve items'),
    new ListOption('roster', 'Anyone in the specified roster group(s) may subscribe and retrieve items'),
    new ListOption('whitelist', 'Only those on a whitelist may subscribe and retrieve items'),
  ],
);
const TEST_FIELD_LIST_MULTI = new XmppDataFormField(
  XmppDataFormFieldType.listMulti,
  'pubsub#show-values',
  null,
  'The presence states for which an entity wants to receive notifications',
  [
    new ListOption('away', 'XMPP Show Value of Away'),
    new ListOption('chat', 'XMPP Show Value of Chat'),
    new ListOption('dnd', 'XMPP Show Value of DND (Do Not Disturb)'),
    new ListOption('online', 'Mere Availability in XMPP (No Show Value)'),
    new ListOption('xa', 'XMPP Show Value of XA (Extended Away)'),
  ]
);

const TEST_FIELD_JID_SINGLE = new XmppDataFormField(
  XmppDataFormFieldType.jidSingle,
  'pubsub#subscriber_jid',
  'eva@openfire',
  'The address (JID) of the subscriber'
);

describe(GenericFormConfigComponent.name, () => {

  let component: GenericFormConfigComponent;
  let fixture: ComponentFixture<GenericFormConfigComponent>;
  let de: HTMLElement;
  let formFieldComponent: FormFieldComponent;

  beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [SharedModule, FormsModule, ReactiveFormsModule],
        declarations: [FormFieldNamePipe, GenericFormConfigComponent, JidMultiComponent],
      });

      fixture = TestBed.createComponent(GenericFormConfigComponent);
      component = fixture.componentInstance;
      component.formGroup = new FormGroup({});
      de = fixture.debugElement.nativeElement;
    }
  );

  describe('given a hidden field', () => {
    beforeEach(() => {
      component.xmppDataForm = new XmppDataForm([
        new XmppDataFormField(
          XmppDataFormFieldType.hidden,
          'FORM_TYPE',
          'http://jabber.org/protocol/pubsub#node_config'
        ),
      ]);
      fixture.detectChanges();
    });

    it('should not render it', (() => {
      expect(de.childElementCount).toBe(0);
    }));

  });

  describe('given a text-single field', () => {
    beforeEach(() => {
      component.xmppDataForm = new XmppDataForm([
        TEST_FIELD_TEXT_SINGLE
      ]);
      fixture.detectChanges();
      formFieldComponent = fixture.debugElement.query(By.css('xgb-form-field')).componentInstance;
    });

    it('should render it', (() => {
      expect(de.childElementCount).toBe(1);
    }));

    it('should render variable name as field label', (() => {
      expect(formFieldComponent.fieldLabel).toBe('title');
    }));

    it('should render variable name in placeholder', (() => {
      expect(de.querySelector('#title')
        .getAttribute('placeholder'))
        .toBe(`Enter title`);
    }));

    it('should render the label as help message', (() => {
      expect(formFieldComponent.fieldHelp).toBe('A friendly name for the node');
    }));

    it('should update the form binding when changed', (() => {
      const input = de.querySelector('input');
      input.value = 'Foo baa';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      const formControl = component.formGroup.get('pubsub#title');
      expect(formControl.value).toBe('Foo baa');
    }));
  });

  describe('given a text-multi field', () => {
    beforeEach(() => {
      component.xmppDataForm = new XmppDataForm([
        TEST_FIELD_TEXT_MULTI
      ]);
      fixture.detectChanges();
      formFieldComponent = fixture.debugElement.query(By.css('xgb-form-field')).componentInstance;
    });

    it('should render it', (() => {
      expect(de.childElementCount).toBe(1);
    }));

    it('should render variable name as field label', (() => {
      expect(formFieldComponent.fieldLabel).toBe('children');
    }));

    it('should render variable name in placeholder', (() => {
      expect(de.querySelector('textarea#children')
        .getAttribute('placeholder'))
        .toBe(`List children`);
    }));

    it('should render the label as help message', (() => {
      expect(formFieldComponent.fieldHelp).toBe('The child nodes (leaf or collection) associated with a collection');
    }));

    it('should update the form binding when changed', (() => {
      const input = de.querySelector('textarea');
      input.value = 'Foo\nbaa';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      const formControl = component.formGroup.get('pubsub#children');
      expect(formControl.value).toBe('Foo\nbaa');
    }));

  });


  describe('given a boolean field', () => {
    beforeEach(() => {
      component.xmppDataForm = new XmppDataForm([
        TEST_FIELD_BOOLEAN
      ]);
      fixture.detectChanges();
      formFieldComponent = fixture.debugElement.query(By.css('xgb-form-field')).componentInstance;
    });

    it('should render it', (() => {
      expect(de.childElementCount).toBe(1);
    }));

    it('should render variable name as field label', (() => {
      expect(de.querySelector('.form-switch').textContent.trim())
        .toBe('deliver_notifications');
    }));

    it('should render the label as help message', (() => {
      expect(formFieldComponent.fieldHelp).toBe('Whether to deliver event notifications');
    }));

    it('should update the form binding when changed', (() => {
      const formControl = component.formGroup.get('pubsub#deliver_notifications');
      expect(formControl.value).toBeTruthy();

      const input = de.querySelector('input');
      input.checked = false;
      input.dispatchEvent(new Event('change'));
      fixture.detectChanges();

      expect(formControl.value).toBeFalsy();
    }));
  });

  describe('given a list-single field', () => {
    beforeEach(() => {
      component.xmppDataForm = new XmppDataForm([
        TEST_FIELD_LIST_SINGLE
      ]);
      fixture.detectChanges();
      formFieldComponent = fixture.debugElement.query(By.css('xgb-form-field')).componentInstance;
    });

    it('should render it', (() => {
      expect(de.childElementCount).toBe(1);
    }));

    it('should render variable name as field label', (() => {
      expect(formFieldComponent.fieldLabel).toBe('access_model');
    }));

    it('should use the variable name as field id', (() => {
      expect(de.querySelector('select').getAttribute('id')).toBe('access_model');
      expect(formFieldComponent.fieldId).toBe('access_model');
    }));

    it('should render options in a select field', (() => {
      expect(de.querySelector('select').querySelectorAll('option').length)
        .toBe(6); // 5 + "empty"
      expect(de.querySelector('select').querySelectorAll('option')[2].textContent)
        .toBe('open');
    }));

    it('should render the label plus all option labels as help message', (() => {
      const dl = de.querySelector('[xgbFieldHelp] dl');

      expect(formFieldComponent.fieldHelp).toBe(TEST_FIELD_LIST_SINGLE.label);
      expect(dl.childElementCount).toBe(10);
      expect(dl.firstElementChild.innerHTML).toBe('authorize');
      expect(dl.lastElementChild.innerHTML).toBe('Only those on a whitelist may subscribe and retrieve items');
    }));

    it('should update the form binding when changed', (() => {
      const selectBox = de.querySelector('select');
      selectBox.querySelectorAll('option')[5].selected = true;
      selectBox.dispatchEvent(new Event('change'));
      fixture.detectChanges();
      const valueInForm = component.formGroup.get('pubsub#access_model').value;
      expect(valueInForm).toBe('whitelist');
    }));

    it('should update the form binding to null when first element is selected', (() => {
      const selectBox = de.querySelector('select');

      selectBox.querySelectorAll('option')[1].selected = true;
      selectBox.dispatchEvent(new Event('change'));
      fixture.detectChanges();
      expect(component.formGroup.get('pubsub#access_model').value).toBe('authorize');
      selectBox.querySelectorAll('option')[0].selected = true;
      selectBox.dispatchEvent(new Event('change'));
      fixture.detectChanges();

      expect(component.formGroup.get('pubsub#access_model').value).toBe('null');
    }));
  });

  describe('given a list-multi field', () => {
    beforeEach(() => {
      component.xmppDataForm = new XmppDataForm([
        TEST_FIELD_LIST_MULTI
      ]);
      fixture.detectChanges();
      formFieldComponent = fixture.debugElement.query(By.css('xgb-form-field')).componentInstance;
    });

    it('should render it', (() => {
      expect(de.childElementCount).toBe(1);
    }));

    it('should render variable name as field label', (() => {
      expect(formFieldComponent.fieldLabel).toBe('show-values');
    }));

    it('should use the variable name as field id', (() => {
      expect(de.querySelector('select').getAttribute('id')).toBe('show-values');
      expect(formFieldComponent.fieldId).toBe('show-values');
    }));

    it('should render options in a select field', (() => {
      expect(de.querySelector('select').querySelectorAll('option').length)
        .toBe(5);
      expect(de.querySelector('select').querySelectorAll('option')[1].textContent)
        .toBe('chat');
    }));

    it('should render the label plus all option labels as help message', (() => {
      const dl = de.querySelector('[xgbFieldHelp] dl');

      expect(formFieldComponent.fieldHelp).toBe(TEST_FIELD_LIST_MULTI.label);
      expect(dl.childElementCount).toBe(10);
      expect(dl.firstElementChild.innerHTML).toBe('away');
      expect(dl.lastElementChild.innerHTML).toBe('XMPP Show Value of XA (Extended Away)');
    }));

    it('should update the form binding when changed', (() => {
      const selectBox = de.querySelector('select');
      selectBox.querySelectorAll('option')[1].selected = true;
      selectBox.querySelectorAll('option')[2].selected = true;
      selectBox.dispatchEvent(new Event('change'));
      fixture.detectChanges();

      const valueInForm = component.formGroup.get('pubsub#show-values').value;
      expect(valueInForm).toContain('chat');
      expect(valueInForm).toContain('dnd');
      expect(valueInForm.length).toBe(2);
    }));
  });

  describe('given a jid-single field', () => {
    beforeEach(() => {
      component.xmppDataForm = new XmppDataForm([
        TEST_FIELD_JID_SINGLE
      ]);
      fixture.detectChanges();
      formFieldComponent = fixture.debugElement.query(By.css('xgb-form-field')).componentInstance;
    });

    it('should render it', (() => {
      expect(de.childElementCount).toBe(1);
    }));

    it('should render variable name as field label', (() => {
      expect(formFieldComponent.fieldLabel).toBe('subscriber_jid');
    }));

    it('should render variable name in placeholder', (() => {
      expect(de.querySelector('#subscriber_jid')
        .getAttribute('placeholder'))
        .toBe(`Enter subscriber_jid`);
    }));

    it('should render the label as help message', (() => {
      expect(formFieldComponent.fieldHelp).toBe('The address (JID) of the subscriber');
    }));

    it('should update the form binding when changed', (() => {
      const input = de.querySelector('input');
      input.value = 'eva@openfire';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      const formControl = component.formGroup.get('pubsub#subscriber_jid');
      expect(formControl.value).toBe('eva@openfire');
    }));
  });

});
