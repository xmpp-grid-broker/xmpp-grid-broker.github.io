import {DebugElement} from '@angular/core';
import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {By} from '@angular/platform-browser';
import {ActivatedRoute} from '@angular/router';

import {TopicCreationComponent, TopicCreationService} from '..';
import {NavigationService, XmppError, XmppErrorCondition} from '../../core';
import {ToastDirective} from '../../shared';
import {SharedModule} from '../../shared/shared.module';
import {TopicWidgetsModule} from '../../topic-widgets/topic-widgets.module';

describe(TopicCreationComponent.name, () => {

  let component: TopicCreationComponent;
  let fixture: ComponentFixture<TopicCreationComponent>;
  let de: DebugElement;
  let topicCreationService: jasmine.SpyObj<TopicCreationService>;
  let navigationService: jasmine.SpyObj<NavigationService>;

  const waitUntilLoaded = () => {
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    tick();
  };


  beforeEach(fakeAsync(() => {
      topicCreationService = jasmine.createSpyObj(TopicCreationService.name, ['loadDefaultConfig', 'createTopic']);
      navigationService = jasmine.createSpyObj(NavigationService.name, ['goToTopic']);

      TestBed.configureTestingModule({
        imports: [SharedModule, FormsModule, ReactiveFormsModule, TopicWidgetsModule],
        declarations: [TopicCreationComponent],
        providers: [{provide: TopicCreationService, useValue: topicCreationService},
          {provide: NavigationService, useValue: navigationService},
          {provide: ActivatedRoute, useValue: {snapshot: {data: {type: 'collection'}}}}]
      });

      fixture = TestBed.createComponent(TopicCreationComponent);
      component = fixture.componentInstance;
      de = fixture.debugElement;

    }
  ));
  describe('when creating a new collection', () => {

    beforeEach(fakeAsync(() => {
      topicCreationService.loadDefaultConfig.and.callFake(() =>
        Promise.reject({})
      );
      waitUntilLoaded();
    }));

    it('should call the service if the form is filled out', fakeAsync(() => {
      topicCreationService.createTopic.and.returnValue(Promise.resolve('myNewTopic'));

      // Fill in node id
      const inputField = de.nativeElement.querySelector('#nodeID');
      inputField.value = 'myNewTopic';
      inputField.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      tick();

      // Click submit
      const submit = de.nativeElement.querySelector('button[type=submit]');
      submit.click();
      fixture.detectChanges();
      tick();

      expect(topicCreationService.createTopic).toHaveBeenCalledTimes(1);
      const args = topicCreationService.createTopic.calls.first().args;
      expect(args.length).toBe(2);
      expect(args[0]).toBe('myNewTopic');
      expect(args[1]).toBeTruthy();
    }));

    it('should redirect when creation was successful', fakeAsync(() => {
      topicCreationService.createTopic.and.returnValue(Promise.resolve('myNewTopic'));
      // Fill in node id
      const inputField = de.nativeElement.querySelector('#nodeID');
      inputField.value = 'myNewTopic';
      inputField.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      tick();

      component.submit();

      tick();
      tick();
      tick();

      expect(de.query(By.directive(ToastDirective))).toBeFalsy();
      expect(navigationService.goToTopic).toHaveBeenCalledTimes(1);
      const args = navigationService.goToTopic.calls.first().args;
      expect(args.length).toBe(1);
      expect(args[0]).toBe('myNewTopic');
    }));


    it(`should show an error if it fails `, fakeAsync(() => {
      topicCreationService.createTopic.and.callFake(() => {
        return Promise.reject(new XmppError('A problem occurred', XmppErrorCondition.NotAcceptable));
      });
      // Fill in node id
      const inputField = de.nativeElement.querySelector('#nodeID');
      inputField.value = 'myNewTopic';
      inputField.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      tick();

      // Click submit
      const submit = de.nativeElement.querySelector('button[type=submit]');
      submit.click();
      fixture.detectChanges();
      tick();

      // Ensure the service has been called
      expect(topicCreationService.createTopic).toHaveBeenCalledTimes(1);

      fixture.detectChanges();
      tick();
      const errorDiv = de.query(By.directive(ToastDirective)).nativeElement;
      expect(errorDiv.innerText).toBe('A problem occurred');

    }));
  });

});
