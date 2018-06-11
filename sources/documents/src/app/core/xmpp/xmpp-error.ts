import {XmppErrorCondition} from './models';

/**
 * An XMPP specific error object that contains the condition in addition to a user friendly message.
 */
export class XmppError extends Error {

  constructor(message: string, public readonly condition: XmppErrorCondition | string) {
    super(message);

    // Set the prototype explicitly
    // (See https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work)
    Object.setPrototypeOf(this, XmppError.prototype);
  }
}
