import {async, ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import {CurrentTopicDetailService, TopicSubscriptionComponent, TopicSubscriptionService} from '../..';
import {ErrorLogService, LeafTopic, NavigationService, Subscription, SubscriptionState, XmppError} from '../../../core';
import {SharedModule} from '../../../shared/shared.module';

describe(TopicSubscriptionComponent.name, () => {
  let component: TopicSubscriptionComponent;
  let fixture: ComponentFixture<TopicSubscriptionComponent>;
  let el: HTMLElement;
  let service: jasmine.SpyObj<TopicSubscriptionService>;
  let navigationService: jasmine.SpyObj<NavigationService>;
  let errorLogService: jasmine.SpyObj<ErrorLogService>;

  beforeEach(async(() => {
    service = jasmine.createSpyObj('TopicSubscriptionService', ['loadSubscriptions', 'unsubscribe']);
    navigationService = jasmine.createSpyObj('NavigationService', ['goToSubscription', 'goToNewSubscription']);
    errorLogService = jasmine.createSpyObj('ErrorLogService', ['error']);
    const currentTopicDetailService = jasmine.createSpyObj('CurrentTopicDetailService', ['currentTopic']);
    currentTopicDetailService.currentTopic.and.returnValue(new LeafTopic('testing'));
    TestBed.configureTestingModule({
      declarations: [TopicSubscriptionComponent],
      imports: [SharedModule],
      providers: [
        {provide: TopicSubscriptionService, useValue: service},
        {provide: NavigationService, useValue: navigationService},
        {provide: CurrentTopicDetailService, useValue: currentTopicDetailService},
        {provide: ErrorLogService, useValue: errorLogService}
      ]
    });
  }));

  beforeEach(fakeAsync(() => {
    fixture = TestBed.createComponent(TopicSubscriptionComponent);
    component = fixture.componentInstance;
    el = fixture.debugElement.nativeElement;
  }));


  // Waits until the spinner is gone...
  const waitUntilLoaded = () => {
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    tick();
  };

  it('should show spinner until loaded', fakeAsync(() => {
    service.loadSubscriptions.and.returnValue(Promise.resolve([]));

    // ngOnInit
    fixture.detectChanges();
    tick();

    expect(el.querySelector('xgb-spinner')).toBeDefined();

    // it's loaded now
    fixture.detectChanges();
    tick();

    expect(el.querySelector('xgb-spinner')).toBeDefined();

  }));

  it('should show error when loading fails', fakeAsync(() => {
    const errorMessage = 'Sth went wrong!';
    const error = new XmppError(errorMessage, 'any');
    service.loadSubscriptions.and.returnValue(Promise.reject(error));

    waitUntilLoaded();

    expect(el.querySelector('[toast-error').innerHTML).toBe(errorMessage);
    expect(errorLogService.error).toHaveBeenCalledWith(errorMessage, error);
  }));

  it('should show empty message if no subscriptions exist', fakeAsync(() => {
    service.loadSubscriptions.and.returnValue(Promise.resolve([]));

    waitUntilLoaded();

    expect(el.querySelector('.empty-title').innerHTML).toBe('No Subscriptions found');

  }));
  it('should render New Subscription when no subscriptions exist', fakeAsync(() => {
    service.loadSubscriptions.and.returnValue(Promise.resolve([]));

    waitUntilLoaded();

    expect(el.querySelector('xgb-action-bar button').innerHTML).toBe('New Subscription');

  }));

  it('should render New Subscription when subscriptions exist', fakeAsync(() => {
    service.loadSubscriptions.and.returnValue(Promise.resolve([
      new Subscription('test@example')
    ]));

    waitUntilLoaded();

    expect(el.querySelector('xgb-action-bar button').innerHTML).toBe('New Subscription');

  }));

  it('should render subscription list', fakeAsync(() => {
    service.loadSubscriptions.and.returnValue(Promise.resolve([
      new Subscription('test1@example'),
      new Subscription('test2@example'),
    ]));

    waitUntilLoaded();


    const listElements = el.querySelectorAll('xgb-list-item');
    expect(listElements.length).toBe(2);
    expect(listElements[0].querySelector('.jid').innerHTML).toBe('test1@example');
    expect(listElements[1].querySelector('.jid').innerHTML).toBe('test2@example');

  }));


  it('should render an icon for pending states', fakeAsync(() => {
    service.loadSubscriptions.and.returnValue(Promise.resolve([
      new Subscription('test1@example', undefined, undefined, SubscriptionState.Pending),
      new Subscription('test2@example', undefined, undefined, SubscriptionState.Subscribed),
    ]));

    waitUntilLoaded();


    const listElements = el.querySelectorAll('xgb-list-item');
    expect(listElements[0].querySelector('.icon').classList).toContain('icon-time');
    expect(listElements[1].querySelector('.icon')).toBeNull();

  }));

  it('should render an icon for unconfigured states', fakeAsync(() => {
    service.loadSubscriptions.and.returnValue(Promise.resolve([
      new Subscription('test1@example', undefined, undefined, SubscriptionState.Unconfigured),
      new Subscription('test2@example', undefined, undefined, SubscriptionState.Subscribed),
    ]));

    waitUntilLoaded();


    const listElements = el.querySelectorAll('xgb-list-item');
    expect(listElements[0].querySelector('.icon').classList).toContain('icon-cross');
    expect(listElements[1].querySelector('.icon')).toBeNull();

  }));

  describe('concerning the removal of a subscription', () => {


    const getRemoveButtons = () => {
      return el.querySelectorAll('xgb-list-action :nth-child(2)');
    };

    beforeEach(fakeAsync(() => {
      service.loadSubscriptions.and.returnValue(Promise.resolve([
        new Subscription('test1@example', undefined, undefined, SubscriptionState.Unconfigured),
        new Subscription('test2@example', undefined, undefined, SubscriptionState.Subscribed),
      ]));

      waitUntilLoaded();


    }));

    it('render the remove buttons', fakeAsync(() => {
      const removeButtons = getRemoveButtons();
      expect(removeButtons.length).toBe(2);
      expect(removeButtons[0].innerHTML).toBe('unsubscribe');
      expect(removeButtons[1].innerHTML).toBe('unsubscribe');
    }));

    it('render show a spinner while loading', fakeAsync(() => {
      service.unsubscribe.and.returnValue(Promise.resolve());
      (getRemoveButtons()[0] as HTMLButtonElement).click();

      fixture.detectChanges();
      tick();

      expect(el.querySelector('xgb-spinner')).toBeDefined();

      // it's loaded now
      fixture.detectChanges();
      tick();

      expect(el.querySelector('xgb-spinner')).toBeDefined();
    }));

    it('render call unsubscribe on the service', fakeAsync(() => {
      service.unsubscribe.and.returnValue(Promise.resolve());
      (getRemoveButtons()[0] as HTMLButtonElement).click();

      // Wait until it's loaded
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      tick();

      expect(service.unsubscribe).toHaveBeenCalledTimes(1);
      expect(service.unsubscribe).toHaveBeenCalledWith(
        'testing',
        new Subscription('test1@example', undefined, undefined, SubscriptionState.Unconfigured)
      );
    }));
    it('render render an error if unsubscribe fails', fakeAsync(() => {
      const errorMessage = 'Sth went wrong!';
      const error = new XmppError(errorMessage, 'any');
      service.unsubscribe.and.returnValue(Promise.reject(error));
      (getRemoveButtons()[0] as HTMLButtonElement).click();

      // Wait until it's loaded
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      tick();

      expect(el.querySelector('[toast-error').innerHTML).toBe(errorMessage);
      expect(errorLogService.error).toHaveBeenCalledWith(errorMessage, error);
    }));

  });

});
