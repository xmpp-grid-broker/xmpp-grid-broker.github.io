/**
 * All possible XMPP error conditions used in xep-0060.
 */
export enum XmppErrorCondition {
  BadRequest = 'bad-request',
  Conflict = 'conflict',
  FeatureNotImplemented = 'feature-not-implemented',
  Forbidden = 'forbidden',
  Gone = 'gone',
  InternalServerError = 'internal-server-error',
  ItemNotFound = 'item-not-found',
  NotAcceptable = 'not-acceptable',
  NotAllowed = 'not-allowed',
  NotAuthorized = 'not-authorized',
  PaymentRequired = 'payment-required',
  PolicyViolation = 'policy-violation',
  RegistrationRequired = 'registration-required',
  Timeout = 'timeout',
  UnexpectedRequest = 'unexpected-request',
  Unsupported = 'unsupported',
}
