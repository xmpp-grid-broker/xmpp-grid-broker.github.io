import {XmppClientFactory, XmppIqType, XmppService} from '.';
import {Config, XmppConfig, XmppTransport} from '../config';
import {NotificationService} from '../notifications';

describe(XmppService.name, () => {
  let client: any;
  let service: XmppService;
  let notificationService: jasmine.SpyObj<NotificationService>;

  beforeEach(() => {
    client = new FakeClient();//tslint:disable-line
    const xmppClientFactory = jasmine.createSpyObj(XmppClientFactory.name, ['createClient']);
    xmppClientFactory.createClient.and.returnValue(client);

    notificationService = jasmine.createSpyObj(NotificationService.name, ['alert']);

    const xmppConfig = new XmppConfig('openfire', XmppTransport.Bosh, undefined, 'localhost');
    const config = new Config(xmppConfig, 10);

    service = new XmppService(xmppClientFactory, notificationService);
    service.initialize(config);
  });

  it('should return the jid domain when calling getServerTitle', () => {
    expect(service.getServerTitle()).toBe('openfire');
  });

  it('should return the pubSubJid', () => {
    expect(service.pubSubJid.full).toBe('pubsub.openfire');
  });

  describe('when calling executeIqToPubsub', () => {
    it('should load and add the pubSubJid', (done) => {
      const spy = spyOn(service, 'executeIq').and.callFake(() => Promise.resolve());
      service.executeIqToPubsub({})
        .then(() => {
          expect(spy).toHaveBeenCalledTimes(1);

          const args = spy.calls.mostRecent().args;
          expect(args[0].to.full).toBe('pubsub.openfire');
          done();
        })
        .catch((err) => fail(err));
    });
  });
  describe('when calling executeIq', () => {

    it('should call sendIq on the client', (done) => {
      const spy = spyOn(client, 'sendIq').and.callThrough();
      const cmd = {type: XmppIqType.Get};
      service.executeIq(cmd)
        .then(() => {
          expect(spy).toHaveBeenCalledTimes(1);

          const args = spy.calls.mostRecent().args;
          expect(args[0]).toBe(cmd);
          done();
        })
        .catch((err) => fail(err));
    });

    it('should resolve with result', (done) => {
      const expectedResult = {result: 'any'};
      spyOn(client, 'sendIq').and.callFake((command, cb) =>
        cb(undefined, expectedResult)
      );

      service.executeIq({type: XmppIqType.Get})
        .then((actualResult) => {
          expect(actualResult).toBe(expectedResult);
          done();
        })
        .catch((err) => fail(err));
    });

    it('should reject with the error', (done) => {
      const expectedError = {error: 'any'};
      spyOn(client, 'sendIq').and.callFake((command, cb) =>
        cb(expectedError, undefined)
      );

      service.executeIq({type: XmppIqType.Get})
        .then(() => {
          fail('Expected Promise to reject');
        })
        .catch((actualError) => {
          expect(actualError).toBe(expectedError.error);
          done();
        });
    });
  });


  it('should call the client connection method on first query', (done) => {
    spyOn(client, 'connect').and.callThrough();
    service.getClient().then(() => {
      expect(client.connect).toHaveBeenCalled();
      service.getClient().then(() => {
        expect(client.connect.calls.count()).toEqual(1);
        done();
      }).catch((err) => fail(err));
    });
  });

  [{
    event: 'auth:failed',
    title: 'Authentication Failed',
    message: 'Failed to authenticate on the XMPP server. Are using the right credentials?',
    canHide: false
  }].forEach(({event, title, message, canHide}) => {
    it(`should show a notification when ${event} is emitted`, (done) => {
      service.getClient().then(() => {
        client.emit(event);
        expect(notificationService.alert).toHaveBeenCalledTimes(1);
        const args = notificationService.alert.calls.mostRecent().args;
        expect(args[0]).toBe(title);
        expect(args[1]).toBe(message);
        expect(args[2]).toBe(canHide);
        done();
      }).catch((err) => fail(err));
    });
  });
});

class FakeClient {
  private handlers: Map<string, Array<() => any>> = new Map();

  connect() {
    this.emit('session:started');
  }

  on(event: string, action: () => any) {
    let handlers: Array<() => any> = [];

    if (this.handlers.has(event)) {
      handlers = this.handlers.get(event);
    }

    handlers.push(action);
    this.handlers.set(event, handlers);
  }

  // noinspection JSUnusedGlobalSymbols
  off(event: string, action: () => any) {

    if (this.handlers.has(event)) {
      const handlers = this.handlers.get(event);
      const idx = handlers.indexOf(action);
      if (idx > -1) {
        handlers.splice(idx, 1);
      }
    }
  }

  emit(event: string) {
    if (this.handlers.has(event)) {
      this.handlers.get(event).forEach((command) => command());
    }
  }

  // noinspection JSMethodCanBeStatic
  sendIq(cmd, cb) {
    cb(undefined, {});
  }

  use() {
  }
}
