import {ComponentFactoryResolver, ViewContainerRef} from '@angular/core';

import {AlertNotificationComponent, ConfirmNotificationComponent, NotificationService} from '.';

class FakeComponentRef {
  instance: any;

  constructor(componentCls) {
    if (componentCls === AlertNotificationComponent) {
      this.instance = new AlertNotificationComponent();
    } else if (componentCls === ConfirmNotificationComponent) {
      this.instance = new ConfirmNotificationComponent();
    } else {
      throw new Error('Not implemented');
    }
  }

  destroy() {
    this.instance = undefined;
  }

  create(): any {
    return this;
  }
}

describe(NotificationService.name, () => {
  let service: NotificationService;
  let componentFactoryResolverSpy: jasmine.SpyObj<ComponentFactoryResolver>;
  let fakeComponentRef: FakeComponentRef;
  let rootViewContainerSpy: jasmine.SpyObj<ViewContainerRef>;

  beforeEach(() => {
    componentFactoryResolverSpy = jasmine.createSpyObj('ComponentFactoryResolver', ['resolveComponentFactory']);
    componentFactoryResolverSpy.resolveComponentFactory.and.callFake((component) => {
      fakeComponentRef = new FakeComponentRef(component);
      return fakeComponentRef;
    });
    rootViewContainerSpy = jasmine.createSpyObj('ViewContainerRef', ['insert']);
    service = new NotificationService(componentFactoryResolverSpy);
    service.setRootViewContainerRef(rootViewContainerSpy);
  });

  describe('when calling alert', () => {
    it('should set given parameters on the component', () => {
      service.alert('title', 'message', true, 'details', false);
      expect(fakeComponentRef.instance.title).toBe('title');
      expect(fakeComponentRef.instance.message).toBe('message');
      expect(fakeComponentRef.instance.canHide).toBe(true);
      expect(fakeComponentRef.instance.details).toBe('details');
      expect(fakeComponentRef.instance.messageIsHtml).toBe(false);
    });

    it('should call insert on the rootViewContainer', () => {
      service.alert('title', 'message');
      expect(rootViewContainerSpy.insert).toHaveBeenCalledTimes(1);
    });

    it('should destroy on componentRef when hiding and hiding is possible', () => {
      service.alert('title', 'message', true);
      spyOn(fakeComponentRef, 'destroy').and.callThrough();
      fakeComponentRef.instance.hide();
      expect(fakeComponentRef.destroy).toHaveBeenCalledTimes(1);
    });

    it('should not call destroy on componentRef when hiding and hiding disabled', () => {
      service.alert('title', 'message', false);
      spyOn(fakeComponentRef, 'destroy').and.callThrough();
      fakeComponentRef.instance.hide();
      expect(fakeComponentRef.destroy).toHaveBeenCalledTimes(0);
    });
  });
  describe('when calling reportError', () => {
    it('should forward the call to alert', () => {
      service.reportError('errorMsg', true);
      expect(fakeComponentRef.instance.title).toBe('Oops, we have a problem...');
      expect(fakeComponentRef.instance.message).toBe('<p>We are sorry, but an unexpected problem occurred</p>' +
        '<p>Please <a href="https://github.com/xmpp-grid-broker/xmpp-grid-broker/" target="_blank">' +
        'report this issue</a> so that we can fix it.</p>');
      expect(fakeComponentRef.instance.messageIsHtml).toBe(true);
      expect(fakeComponentRef.instance.details).toBe('errorMsg');
      expect(fakeComponentRef.instance.canHide).toBe(true);

    });

    it('should show a human readable error when no string is given', () => {
      service.reportError({x: 'y'}, true);
      expect(fakeComponentRef.instance.details).toBe('{"x":"y"}');
    });
  });

  describe('when calling confirm', () => {
    it('should set given parameters on the component', async () => {
      // noinspection JSIgnoredPromiseFromCall
      service.confirm('title', 'message', 'confirmLabel', 'cancelLabel');
      expect(fakeComponentRef.instance.title).toBe('title');
      expect(fakeComponentRef.instance.message).toBe('message');
      expect(fakeComponentRef.instance.confirmButtonLabel).toBe('confirmLabel');
      expect(fakeComponentRef.instance.cancelButtonLabel).toBe('cancelLabel');
    });

    it('should call insert on the rootViewContainer', () => {
      // noinspection JSIgnoredPromiseFromCall
      service.confirm('title', 'message');
      expect(rootViewContainerSpy.insert).toHaveBeenCalledTimes(1);
    });

    it('should destroy and return true on componentRef when confirming', (done) => {
      // noinspection JSIgnoredPromiseFromCall
      const promise = service.confirm('title', 'message');
      spyOn(fakeComponentRef, 'destroy').and.callThrough();
      fakeComponentRef.instance.complete(true);
      expect(fakeComponentRef.destroy).toHaveBeenCalledTimes(1);
      promise.then((result) => {
        expect(result).toBe(true);
        done();
      });
    });

    it('should destroy and return false on componentRef when confirming', (done) => {
      const promise = service.confirm('title', 'message');
      spyOn(fakeComponentRef, 'destroy').and.callThrough();
      fakeComponentRef.instance.complete(false);
      expect(fakeComponentRef.destroy).toHaveBeenCalledTimes(1);
      promise.then((result) => {
        expect(result).toBe(false);
        done();
      });
    });
  });

});
