import {DebugElement} from '@angular/core';
import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {By} from '@angular/platform-browser';

import {CurrentTopicDetailService, TopicDetailsConfigComponent} from '..';
import {
  LeafTopic,
  NavigationService,
  NotificationService,
  XmppDataForm,
  XmppDataFormField,
  XmppDataFormFieldType,
  XmppError,
  XmppErrorCondition
} from '../../core';
import {ToastDirective} from '../../shared';
import {SharedModule} from '../../shared/shared.module';
import {TopicWidgetsModule} from '../../topic-widgets/topic-widgets.module';
import {TopicDetailsConfigurationService} from './topic-details-configuration.service';

const FORM_TYPE = new XmppDataFormField(
  XmppDataFormFieldType.hidden,
  'FORM_TYPE',
  'http://jabber.org/protocol/pubsub#node_config'
);

const TEST_FIELD_TEXT_SINGLE = new XmppDataFormField(
  XmppDataFormFieldType.textSingle,
  'pubsub#title',
  null
);

const TEST_FIELD_BOOLEAN = new XmppDataFormField(
  XmppDataFormFieldType.boolean,
  'pubsub#deliver_notifications',
  true,
  'Whether to deliver event notifications'
);

class MockTopicDetailsService {
  // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
  loadConfigurationForm(): Promise<XmppDataForm> {
    return Promise.resolve(new XmppDataForm([
      FORM_TYPE,
      TEST_FIELD_TEXT_SINGLE,
      TEST_FIELD_BOOLEAN
    ]));
  }

  // noinspection JSMethodCanBeStatic
  updateTopicConfiguration(): Promise<XmppDataForm> {
    return this.loadConfigurationForm();
  }

  // noinspection JSMethodCanBeStatic
  deleteTopic(): Promise<void> {
    return Promise.resolve();
  }
}

describe(TopicDetailsConfigComponent.name, () => {

  let component: TopicDetailsConfigComponent;
  let fixture: ComponentFixture<TopicDetailsConfigComponent>;
  let de: DebugElement;
  let mockService: MockTopicDetailsService;
  let submitButton: HTMLElement;
  let navigationService: jasmine.SpyObj<NavigationService>;
  let notificationService: jasmine.SpyObj<NotificationService>;

  beforeEach(fakeAsync(() => {
      mockService = new MockTopicDetailsService();
      navigationService = jasmine.createSpyObj('NavigationService', ['goToHome']);
      notificationService = jasmine.createSpyObj('NotificationService', ['confirm']);
      const currentTopicDetailService = jasmine.createSpyObj('CurrentTopicDetailService', ['currentTopic']);
      currentTopicDetailService.currentTopic.and.returnValue(new LeafTopic('testing'));

      TestBed.configureTestingModule({
        imports: [SharedModule, FormsModule, ReactiveFormsModule, TopicWidgetsModule],
        declarations: [TopicDetailsConfigComponent],
        providers: [{provide: TopicDetailsConfigurationService, useValue: mockService},
          {provide: CurrentTopicDetailService, useValue: currentTopicDetailService},
          {provide: NavigationService, useValue: navigationService},
          {provide: NotificationService, useValue: notificationService}
        ]
      });

      fixture = TestBed.createComponent(TopicDetailsConfigComponent);
      component = fixture.componentInstance;
      de = fixture.debugElement;

    }
  ));

  const waitUntilLoaded = () => {
    // Render for the first time, the spinner will be shown
    fixture.detectChanges();
    tick();

    expect(de.query(By.css('xgb-spinner')).nativeElement).toBeDefined();

    // The loading is done, get rid of the spinner...
    fixture.detectChanges();
    tick();

    const deBtn = de.query(By.css('button[type="submit"][primary]'));
    submitButton = (deBtn) ? deBtn.nativeElement : undefined;
  };

  it('should show an error message when loading the configuration form fails', fakeAsync(() => {
    spyOn(mockService, 'loadConfigurationForm').and.callFake(() => {
      return Promise.reject(new XmppError('This is an error', XmppErrorCondition.NotAcceptable));
    });
    waitUntilLoaded();
    const notificationDivs = de.queryAll(By.directive(ToastDirective));
    expect(notificationDivs.length).toBe(1);
    expect(notificationDivs[0].nativeElement.innerText).toBe(
      'This is an error'
    );
    expect(notificationDivs[0].attributes['toast-error']).toBeDefined();
    expect(submitButton).toBeUndefined();
  }));

  describe('given some advanced fields', () => {

    beforeEach(fakeAsync(() => {
      waitUntilLoaded();

      // show advanced collapsible
      de.query(By.css('xgb-collapsible')).componentInstance.isVisible = true;

      // Re-Render
      fixture.detectChanges();
      tick();
    }));

    it('advanced form entries are not included if nothing has changed', () => {
      const serviceSpy = spyOn(mockService, 'updateTopicConfiguration').and.callThrough();

      submitButton.click();
      fixture.detectChanges();

      expect(serviceSpy.calls.count()).toBe(1);

      const args = serviceSpy.calls.argsFor(0);
      const form = args[1];

      expect(args[0]).toBe('testing');
      expect(form.fields.length).toBe(1);
      expect(form.fields[0].name).toBe(FORM_TYPE.name);
      expect(form.fields[0].value).toBe(FORM_TYPE.value);
    });

    it('should emmit the changed fields and values', (() => {
      const serviceSpy = spyOn(mockService, 'updateTopicConfiguration').and.callThrough();

      const notificationCheckbox = de.nativeElement.querySelector('#deliver_notifications');
      notificationCheckbox['checked'] = false;
      notificationCheckbox.dispatchEvent(new Event('change'));

      submitButton.click();
      fixture.detectChanges();

      expect(serviceSpy.calls.count()).toBe(1);

      const args = serviceSpy.calls.argsFor(0);
      const form = args[1];

      expect(args[0]).toBe('testing');
      expect(form.fields.length).toBe(2);
      expect(form.fields[0].name).toBe(FORM_TYPE.name);
      expect(form.fields[0].value).toBe(FORM_TYPE.value);
      expect(form.fields[1].name).toBe('pubsub#deliver_notifications');
      expect(form.fields[1].value).toBe(false);


    }));

  });

  describe('concerning the danger zone', () => {

    let collapsible;
    let deleteTopicButton;

    beforeEach(fakeAsync(() => {
      waitUntilLoaded();

      collapsible = de.query(By.css('xgb-collapsible[title="Danger Zone"]'));
      deleteTopicButton = collapsible.query(By.css('button'));
    }));

    it('should render the danger zone as collapsible', fakeAsync(() => {
      expect(collapsible).toBeTruthy();
    }));

    it('should render the delete button', fakeAsync(() => {
      expect(deleteTopicButton).toBeTruthy();
      expect(deleteTopicButton.nativeElement.innerHTML.trim()).toBe('Delete Topic testing');
    }));

    it('should show a confirm dialog when clicking delete', fakeAsync(() => {
      notificationService.confirm.and.returnValue(Promise.resolve(true));
      spyOn(mockService, 'deleteTopic').and.callThrough();

      deleteTopicButton.nativeElement.click();
      fixture.detectChanges();
      tick();

      expect(notificationService.confirm).toHaveBeenCalledTimes(1);
    }));

    it('should not call the service and not redirect when delete was not confirmed', fakeAsync(() => {
      notificationService.confirm.and.returnValue(Promise.resolve(false));
      const serviceCallSpy = spyOn(mockService, 'deleteTopic').and.callThrough();

      deleteTopicButton.nativeElement.click();
      fixture.detectChanges();
      tick();

      expect(serviceCallSpy).toHaveBeenCalledTimes(0);
      expect(navigationService.goToHome).toHaveBeenCalledTimes(0);
    }));


    it('should call the service and redirect when clicking delete', fakeAsync(() => {
      notificationService.confirm.and.returnValue(Promise.resolve(true));
      const serviceCallSpy = spyOn(mockService, 'deleteTopic').and.callThrough();

      deleteTopicButton.nativeElement.click();
      fixture.detectChanges();
      tick();

      expect(serviceCallSpy).toHaveBeenCalledTimes(1);
      expect(serviceCallSpy.calls.mostRecent().args[0]).toBe('testing');
      expect(navigationService.goToHome).toHaveBeenCalledTimes(1);
    }));

    it('should not redirect when the delete service method fails', fakeAsync(() => {
      notificationService.confirm.and.returnValue(Promise.resolve(true));
      const serviceCallSpy = spyOn(mockService, 'deleteTopic')
        .and.returnValue(Promise.reject({condition: XmppErrorCondition.Forbidden}));

      deleteTopicButton.nativeElement.click();
      fixture.detectChanges();
      tick();

      expect(serviceCallSpy).toHaveBeenCalledTimes(1);
      expect(serviceCallSpy.calls.mostRecent().args[0]).toBe('testing');
      expect(navigationService.goToHome).toHaveBeenCalledTimes(0);
    }));


    it('should render an error message when the delete service method fails', fakeAsync(() => {
      notificationService.confirm.and.returnValue(Promise.resolve(true));
      spyOn(mockService, 'deleteTopic')
        .and.returnValue(Promise.reject(new XmppError('Error Message', XmppErrorCondition.NotAcceptable)));

      deleteTopicButton.nativeElement.click();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      tick();

      const notificationDivs = de.queryAll(By.directive(ToastDirective));
      expect(notificationDivs.length).toBe(1);
      expect(notificationDivs[0].attributes['toast-error']).toBeDefined();
      expect(notificationDivs[0].nativeElement.innerText).toBe('Error Message');
    }));

  });

  describe('given a changed title', () => {

    beforeEach(fakeAsync(() => {
      waitUntilLoaded();

      const inputField = de.query(By.css('#title')).nativeElement;
      inputField.value = 'ChangedTitle';
      inputField.dispatchEvent(new Event('input'));
      fixture.detectChanges();
    }));


    it('should show a message after success update', fakeAsync(() => {
      spyOn(mockService, 'updateTopicConfiguration').and.callThrough();

      submitButton.click();

      // Hello Spinner
      fixture.detectChanges();
      tick();

      // Is spinner rendered?
      expect(de.query(By.css('xgb-spinner')).nativeElement).toBeDefined();

      // Good bye spinner...
      fixture.detectChanges();
      tick();

      const notificationDivs = de.queryAll(By.directive(ToastDirective));
      expect(notificationDivs.length).toBe(1);
      expect(notificationDivs[0].nativeElement.innerText).toBe('Form successfully updated!');
      expect(notificationDivs[0].attributes['toast-success']).toBeDefined();

    }));

    it('should show a message on error when submission fails', fakeAsync(() => {
      spyOn(mockService, 'updateTopicConfiguration').and.callFake(() =>
        Promise.reject(new XmppError('Error Message', XmppErrorCondition.NotAcceptable)));

      submitButton.click();

      // Hello Spinner
      fixture.detectChanges();
      tick();

      // Is spinner rendered?
      expect(de.query(By.css('xgb-spinner')).nativeElement).toBeDefined();

      // Good bye spinner...
      fixture.detectChanges();
      tick();

      const notificationDivs = de.queryAll(By.directive(ToastDirective));
      expect(notificationDivs.length).toBe(1);
      expect(notificationDivs[0].nativeElement.innerText).toBe(
        'Error Message'
      );
      expect(notificationDivs[0].attributes['toast-error']).toBeDefined();
    }));

  });

});
