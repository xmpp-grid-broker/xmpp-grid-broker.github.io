import {XmppErrorCondition} from './models';
import {XmppError} from './xmpp-error';

/**
 * Maps the given error object into an XmppError.
 * You must only provide error message mappings for the conditions that can occur during the xmpp request.
 * Generic errors such as timeout and internal server errors are handled by this method.
 *
 * @param error the error as returned by stanza.io or the xmpp service.
 * @param conditionToErrorMapping Specific error handling. Use {@link XmppErrorCondition} as keys!
 */
export function JxtErrorToXmppError(error: any, conditionToErrorMapping: { [key: string]: string }): XmppError {
  if (error && error.condition) {
    if (conditionToErrorMapping && conditionToErrorMapping[error.condition]) {
      return new XmppError(conditionToErrorMapping[error.condition], error.condition);
    } else if (error.condition === XmppErrorCondition.Timeout) {
      return new XmppError('Connection has timed out', error.condition);
    } else if (error.condition === XmppErrorCondition.InternalServerError) {
      return new XmppError('Internal Server Error', error.condition);
    }
  }
  if (error instanceof Error) {
    return new XmppError(`An unknown error has occurred: ${error.message}`, undefined);
  }
  return new XmppError(`An unknown error has occurred: ${JSON.stringify(error)}`, undefined);
}

/**
 * Safely converts the given error into a human readable error.
 */
export function ErrorToString(error: any): string {
  if (error instanceof XmppError) {
    return error.message;
  } else {
    return JxtErrorToXmppError(error, {}).message;
  }
}
