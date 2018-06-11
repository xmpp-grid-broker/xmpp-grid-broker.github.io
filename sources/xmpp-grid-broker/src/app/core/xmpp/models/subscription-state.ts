/**
 * Represents the state of a subscription as defied in xep-0060.
 */
export enum SubscriptionState {
  // noinspection JSUnusedGlobalSymbols
  None = 'none',
  Pending = 'pending',
  Subscribed = 'subscribed',
  Unconfigured = 'unconfigured',
}
