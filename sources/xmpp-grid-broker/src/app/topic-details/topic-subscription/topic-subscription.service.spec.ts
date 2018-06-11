import {JID} from 'xmpp-jid';

import {TopicSubscriptionService} from '..';
import {
  Subscription,
  SubscriptionState,
  XmppDataForm,
  XmppDataFormField,
  XmppDataFormFieldType,
  XmppErrorCondition,
  XmppService
} from '../../core';

describe(TopicSubscriptionService.name, () => {
  let service: TopicSubscriptionService;

  let xmppService: jasmine.SpyObj<XmppService>;

  beforeEach(() => {
    xmppService = jasmine.createSpyObj('XmppService', ['executeIqToPubsub']);
    service = new TopicSubscriptionService(xmppService);
  });

  describe('when calling loadSubscriptions', () => {
    it('it should call the xmpp service', async () => {
      xmppService.executeIqToPubsub.and.returnValue(Promise.resolve({pubsubOwner: {subscriptions: {list: []}}}));

      const subscriptions = await service.loadSubscriptions('test-topic');
      expect(subscriptions.length).toBe(0);

      await expect(xmppService.executeIqToPubsub).toHaveBeenCalledTimes(1);
      const cmd = xmppService.executeIqToPubsub.calls.mostRecent().args[0];
      await expect(cmd.pubsubOwner.subscriptions.node).toBe('test-topic');
    });

    it('it can handle unset subscriptions list', async () => {
      xmppService.executeIqToPubsub.and.returnValue(Promise.resolve({pubsubOwner: {subscriptions: {}}}));

      const subscriptions = await service.loadSubscriptions('test-topic');

      expect(subscriptions.length).toBe(0);
      await expect(xmppService.executeIqToPubsub).toHaveBeenCalledTimes(1);
      const cmd = xmppService.executeIqToPubsub.calls.mostRecent().args[0];
      await expect(cmd.pubsubOwner.subscriptions.node).toBe('test-topic');
    });


    it('it map the results to subscription objects', async () => {
      const rawSubscriptions = [
        {jid: new JID('foo@openfire'), type: 'subscribed', expiry: '2006-02-28T23:59:59Z', subid: '123-123-123'},
        {jid: new JID('baa@openfire')}
      ];
      xmppService.executeIqToPubsub.and.returnValue(Promise.resolve({pubsubOwner: {subscriptions: {list: rawSubscriptions}}}));

      const subscriptions = await service.loadSubscriptions('test-topic');

      await expect(subscriptions[0].jid).toBe('foo@openfire');
      await expect(subscriptions[0].state).toBe(SubscriptionState.Subscribed);
      await expect(subscriptions[0].expiry).toBe('2006-02-28T23:59:59Z');
      await expect(subscriptions[0].subid).toBe('123-123-123');

      await expect(subscriptions[1].jid).toBe('baa@openfire');
      await expect(subscriptions[1].state).toBeUndefined();
      await expect(subscriptions[1].expiry).toBeUndefined();
      await expect(subscriptions[1].subid).toBeUndefined();

    });

    it('should reject when executeIqToPubsub fails', async () => {
      xmppService.executeIqToPubsub.and.returnValue(Promise.reject(
        {condition: XmppErrorCondition.FeatureNotImplemented}
      ));

      try {
        await service.loadSubscriptions('test-topic');
        fail(`expected an error`);
      } catch (e) {
        await expect(e.message).toBe('Topic or service does not support subscription management');
      }
    });
  });
  describe('when calling subscribe', () => {
    it('it should call the xmpp service', async () => {
      xmppService.executeIqToPubsub.and.returnValue(Promise.resolve({}));

      await service.subscribe('test-topic', 'test-jid');

      await expect(xmppService.executeIqToPubsub).toHaveBeenCalledTimes(1);
      const cmd = xmppService.executeIqToPubsub.calls.mostRecent().args[0];
      await expect(cmd.pubsub.subscribe.node).toBe('test-topic');
      await expect(cmd.pubsub.subscribe.jid).toBe('test-jid');

    });

    it('should reject when executeIqToPubsub fails', async () => {
      xmppService.executeIqToPubsub.and.returnValue(Promise.reject(
        {condition: XmppErrorCondition.FeatureNotImplemented}
      ));

      try {
        await service.subscribe('test-topic', 'test-jid');
        fail(`expected an error`);
      } catch (e) {
        await expect(e.message).toBe('Topic test-topic does not support subscriptions.');
      }
    });
  });

  describe('when calling unsubscribe', () => {
    it('it should call the xmpp service', async () => {
      xmppService.executeIqToPubsub.and.returnValue(Promise.resolve({}));

      await service.unsubscribe('test-topic', new Subscription('test-jid', 'test-subid'));

      await expect(xmppService.executeIqToPubsub).toHaveBeenCalledTimes(1);
      const cmd = xmppService.executeIqToPubsub.calls.mostRecent().args[0];
      await expect(cmd.pubsub.unsubscribe.node).toBe('test-topic');
      await expect(cmd.pubsub.unsubscribe.jid).toBe('test-jid');
      await expect(cmd.pubsub.unsubscribe.subid).toBe('test-subid');

    });

    it('should reject when executeIqToPubsub fails', async () => {
      xmppService.executeIqToPubsub.and.returnValue(Promise.reject(
        {condition: XmppErrorCondition.Forbidden}
      ));

      try {
        await service.unsubscribe('test-topic', new Subscription('test-jid', 'test-subid'));
        fail(`expected an error`);
      } catch (e) {
        await expect(e.message).toBe('You have insufficient privileges to unsubscribe test-jid');
      }
    });
  });

  describe('when calling loadConfiguration', () => {
    it('it should call the xmpp service', async () => {
      xmppService.executeIqToPubsub.and.returnValue(Promise.resolve({pubsub: {subscriptionOptions: {form: {fields: []}}}}));

      await service.loadConfiguration('test-topic', 'test-jid', 'test-subid');

      await expect(xmppService.executeIqToPubsub).toHaveBeenCalledTimes(1);
      const cmd = xmppService.executeIqToPubsub.calls.mostRecent().args[0];
      await expect(cmd.pubsub.subscriptionOptions.node).toBe('test-topic');
      await expect(cmd.pubsub.subscriptionOptions.jid).toBe('test-jid');
      await expect(cmd.pubsub.subscriptionOptions.subid).toBe('test-subid');

    });

    it('it should map the form into an XmppDataForm object', async () => {
      xmppService.executeIqToPubsub.and.returnValue(Promise.resolve({
        pubsub: {
          subscriptionOptions: {
            form: {
              fields: [
                {type: 'hidden', name: 'example'},
                {type: 'boolean', name: 'foo'}
              ]
            }
          }
        }
      }));

      const result = await service.loadConfiguration('test-topic', 'test-jid', 'test-subid');

      expect(result.fields.length).toBe(2);
      expect(result.fields[0].name).toBe('example');
      expect(result.fields[1].name).toBe('foo');

    });

    it('should reject when executeIqToPubsub fails', async () => {
      xmppService.executeIqToPubsub.and.returnValue(Promise.reject(
        {condition: XmppErrorCondition.Forbidden}
      ));

      try {
        await service.loadConfiguration('test-topic', 'test-jid', 'test-subid');
        fail(`expected an error`);
      } catch (e) {
        await expect(e.message).toBe('You have insufficient privileges to modify this subscription options');
      }
    });
  });

  describe('when calling updateConfiguration', () => {
    it('it should call the xmpp service', async () => {
      xmppService.executeIqToPubsub.and.returnValue(Promise.resolve({}));

      await service.updateConfiguration('test-topic', 'test-jid', 'test-subid', new XmppDataForm([
        new XmppDataFormField(XmppDataFormFieldType.boolean, 'name', 'val'),
        new XmppDataFormField(XmppDataFormFieldType.boolean, 'example', 'foo'),
      ]));

      await expect(xmppService.executeIqToPubsub).toHaveBeenCalledTimes(1);
      const cmd = xmppService.executeIqToPubsub.calls.mostRecent().args[0];
      await expect(cmd.pubsub.subscriptionOptions.node).toBe('test-topic');
      await expect(cmd.pubsub.subscriptionOptions.jid).toBe('test-jid');
      await expect(cmd.pubsub.subscriptionOptions.subid).toBe('test-subid');
      await expect(cmd.pubsub.subscriptionOptions.form.type).toBe('submit');
      await expect(cmd.pubsub.subscriptionOptions.form.fields.length).toBe(2);
      await expect(cmd.pubsub.subscriptionOptions.form.fields[0].name).toBe('name');
      await expect(cmd.pubsub.subscriptionOptions.form.fields[0].value).toBe('val');

    });

    it('should reject when executeIqToPubsub fails', async () => {
      xmppService.executeIqToPubsub.and.returnValue(Promise.reject(
        {condition: XmppErrorCondition.BadRequest}
      ));

      try {
        await service.updateConfiguration('test-topic', 'test-jid', 'test-subid', new XmppDataForm([]));
        fail(`expected an error`);
      } catch (e) {
        await expect(e.message).toBe('Invalid group of options');
      }
    });
  });

});
