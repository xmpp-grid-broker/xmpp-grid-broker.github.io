import {SubscriptionState} from './subscription-state';

/**
 * A class that represents a subscription
 * of a JID (to a node) as defied in xep-0060.
 */
export class Subscription {
  constructor(public jid: string,
              public subid?: string,
              public expiry?: string,
              public state?: SubscriptionState) {
  }
}
