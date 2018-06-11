import {Injectable} from '@angular/core';

import {JxtErrorToXmppError, Subscription, XmppDataForm, XmppErrorCondition, XmppIqType, XmppService} from '../../core';

@Injectable()
export class TopicSubscriptionService {

  constructor(private xmppService: XmppService) {
  }

  /**
   * Loads all subscriptions of the given topic.
   */
  public loadSubscriptions(topicIdentifier: string): Promise<Subscription[]> {
    const cmd = {
      type: XmppIqType.Get,
      pubsubOwner: {
        subscriptions: {
          node: topicIdentifier
        }
      }
    };
    return this.xmppService.executeIqToPubsub(cmd)
      .then((response) => {
          const subscriptions = response.pubsubOwner.subscriptions.list || [];
          return subscriptions.map((entry) => new Subscription(entry.jid.full, entry.subid, entry.expiry, entry.type));
        }
      ).catch((err) => {
        throw JxtErrorToXmppError(err, {
            [XmppErrorCondition.FeatureNotImplemented]: `Topic or service does not support subscription management`,
            [XmppErrorCondition.Forbidden]: `You don't have sufficient privileges to manage subscriptions`,
            [XmppErrorCondition.ItemNotFound]: `Topic ${topicIdentifier} does not exist`
          }
        );
      });
  }

  /**
   * Subscribes the given jid to the provided topic.
   * Setting a configuration during creation is not supported.
   * If the promise resolves, the subscription was (according to the
   * server) successful.
   */
  public subscribe(topicIdentifier: string, jid: string): Promise<void> {
    const cmd = {
      type: XmppIqType.Set,
      pubsub: {
        subscribe: {
          node: topicIdentifier,
          jid: jid
        }
      }
    };
    return this.xmppService.executeIqToPubsub(cmd)
      .then(() => {
      })
      .catch((err) => {
        throw JxtErrorToXmppError(err, {
            [XmppErrorCondition.BadRequest]: `You are not allowed to subscribe ${jid} to ${topicIdentifier}`,
            [XmppErrorCondition.NotAuthorized]: `Either you or ${jid} are not authorized to subscribe on ${jid}. `
            + 'Checkout the access model and configuration.',
            [XmppErrorCondition.PaymentRequired]: `The service requires payment for subscriptions to ${topicIdentifier}`,
            [XmppErrorCondition.Forbidden]: `${jid} is blocked from subscribing`,
            [XmppErrorCondition.PolicyViolation]: 'Too many subscriptions',
            [XmppErrorCondition.FeatureNotImplemented]: `Topic ${topicIdentifier} does not support subscriptions.`,
            [XmppErrorCondition.Gone]: `Topic ${topicIdentifier} has been moved`,
            [XmppErrorCondition.ItemNotFound]: `Topic ${topicIdentifier} does not exist`
          }
        );
      });
  }

  /**
   * Removes the given subscription.
   *
   * If the promise resolves, unsubscribe was (according to the
   * server) successful.
   */
  public unsubscribe(topicIdentifier: string, subscription: Subscription): Promise<void> {
    const cmd = {
      type: XmppIqType.Set,
      pubsub: {
        unsubscribe: {
          node: topicIdentifier,
          jid: subscription.jid,
          subid: subscription.subid
        }
      }
    };
    return this.xmppService.executeIqToPubsub(cmd)
      .then(() => {
      })
      .catch((err) => {
        throw JxtErrorToXmppError(err, {
            [XmppErrorCondition.BadRequest]: `The subscription id ${subscription.subid} is invalid!`,
            [XmppErrorCondition.NotAcceptable]: `The subscription id ${subscription.subid} is invalid!`,
            [XmppErrorCondition.UnexpectedRequest]: `${subscription.jid} is not subscribed on ${topicIdentifier}`,
            [XmppErrorCondition.Forbidden]: `You have insufficient privileges to unsubscribe ${subscription.jid}`,
            [XmppErrorCondition.ItemNotFound]: `Topic ${topicIdentifier} does not exist`
          }
        );
      });
  }

  public loadConfiguration(topicIdentifier: string, jid: string, subid: string): Promise<XmppDataForm> {
    const cmd = {
      type: XmppIqType.Get,
      pubsub: {
        subscriptionOptions: {
          node: topicIdentifier,
          jid: jid,
          subid: subid
        }
      }
    };

    return this.xmppService.executeIqToPubsub(cmd)
      .then((result) =>
        XmppDataForm.fromJSON(result.pubsub.subscriptionOptions.form)
      ).catch((err) => {
        throw JxtErrorToXmppError(err, {
            [XmppErrorCondition.BadRequest]: `The jid ${jid} or subscription id ${subid} is invalid!`,
            [XmppErrorCondition.NotAcceptable]: `The subscription id ${subid} is invalid!`,
            [XmppErrorCondition.UnexpectedRequest]: `${jid} is not subscribed on ${topicIdentifier}`,
            [XmppErrorCondition.Forbidden]: 'You have insufficient privileges to modify this subscription options',
            [XmppErrorCondition.FeatureNotImplemented]: 'Subscription options are not supported by the XMPP Server',
            [XmppErrorCondition.ItemNotFound]: `Topic ${topicIdentifier} does not exist`
          }
        );
      });
  }

  public updateConfiguration(topicIdentifier: string, jid: string, subid: string, xmppDataForm: XmppDataForm) {
    const cmd = {
      type: XmppIqType.Set,
      pubsub: {
        subscriptionOptions: {
          node: topicIdentifier,
          jid: jid,
          subid: subid,
          form: xmppDataForm.toJSON()
        }
      }
    };
    return this.xmppService.executeIqToPubsub(cmd)
      .then(() => {
        }
      ).catch((err) => {
        throw JxtErrorToXmppError(err, {
            [XmppErrorCondition.BadRequest]: 'Invalid group of options'
          }
        );
      });
  }
}

