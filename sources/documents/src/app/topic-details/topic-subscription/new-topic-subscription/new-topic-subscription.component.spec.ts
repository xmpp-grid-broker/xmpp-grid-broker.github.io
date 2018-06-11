import {async, ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {FormsModule} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';

import {TopicSubscriptionService} from '..';
import {ErrorLogService, NavigationService, XmppError, XmppErrorCondition} from '../../../core';
import {SharedModule} from '../../../shared/shared.module';
import {NewTopicSubscriptionComponent} from './new-topic-subscription.component';

describe(NewTopicSubscriptionComponent.name, () => {
  let component: NewTopicSubscriptionComponent;
  let fixture: ComponentFixture<NewTopicSubscriptionComponent>;
  let el: HTMLElement;
  let service: jasmine.SpyObj<TopicSubscriptionService>;
  let navigationService: jasmine.SpyObj<NavigationService>;
  let errorLogService: jasmine.SpyObj<ErrorLogService>;

  beforeEach(async(() => {
    service = jasmine.createSpyObj('TopicSubscriptionService', ['subscribe']);
    navigationService = jasmine.createSpyObj('NavigationService', ['goToSubscriptions']);
    errorLogService = jasmine.createSpyObj('ErrorLogService', ['error']);

    TestBed.configureTestingModule({
      declarations: [NewTopicSubscriptionComponent],
      imports: [FormsModule, SharedModule],
      providers: [
        {provide: TopicSubscriptionService, useValue: service},
        {provide: NavigationService, useValue: navigationService},
        {provide: ActivatedRoute, useValue: {snapshot: {params: {id: 'testing'}}}},
        {provide: ErrorLogService, useValue: errorLogService}
      ]
    });
  }));

  let inputField: HTMLInputElement;
  let submitButton: HTMLButtonElement;

  beforeEach(fakeAsync(() => {
    fixture = TestBed.createComponent(NewTopicSubscriptionComponent);
    component = fixture.componentInstance;
    el = fixture.debugElement.nativeElement;

    // ngOnInit
    fixture.detectChanges();
    tick();

    // trigger initial validation
    fixture.detectChanges();
    tick();

    inputField = el.querySelector('#jid') as HTMLInputElement;
    submitButton = el.querySelector('button[primary]') as HTMLButtonElement;

  }));

  it('should render input filed', fakeAsync(() => {
    expect(inputField).toBeDefined();
    expect(inputField.placeholder).toBe('Enter Subscription JID');
  }));


  it('should render disabled submit button', fakeAsync(() => {
    expect(submitButton).toBeDefined();
    expect(submitButton.disabled).toBeTruthy();
  }));

  describe('given some input values', () => {
    beforeEach(fakeAsync(() => {
      inputField.value = 'eva@exampe.com';
      inputField.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      tick();
    }));

    it('the submit button should be enabled', fakeAsync(() => {
      expect(submitButton.disabled).toBeFalsy();
    }));

    it('should disable the form while submitting the form', fakeAsync(() => {
      service.subscribe.and.returnValue(Promise.resolve());
      submitButton.click();

      fixture.detectChanges();
      tick();

      expect(submitButton.disabled).toBeTruthy();
      expect(inputField.disabled).toBeTruthy();
    }));

    it('should render error message when subscription fails', fakeAsync(() => {
      const error = new XmppError('timeout', XmppErrorCondition.Timeout);
      service.subscribe.and.returnValue(Promise.reject(error));
      submitButton.click();

      // submit
      fixture.detectChanges();
      tick();
      // get result
      fixture.detectChanges();
      tick();

      expect(el.querySelector('[toast-error]').innerHTML).toBe('timeout');
      expect(submitButton.disabled).toBeFalsy();
      expect(inputField.disabled).toBeFalsy();
      expect(errorLogService.error).toHaveBeenCalledWith(error.message, error);
    }));

    it('should render redirect when subscription succeeds', fakeAsync(() => {
      service.subscribe.and.returnValue(Promise.resolve());
      submitButton.click();

      // submit
      fixture.detectChanges();
      tick();
      // get result
      fixture.detectChanges();
      tick();

      expect(navigationService.goToSubscriptions).toHaveBeenCalledTimes(1);
      expect(navigationService.goToSubscriptions).toHaveBeenCalledWith('testing');
    }));

  });


});
