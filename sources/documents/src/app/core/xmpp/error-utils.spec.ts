import {ErrorToString, JxtErrorToXmppError} from './error-utils';
import {XmppError, XmppErrorCondition} from './index';

describe(XmppError.name, () => {
  // (See https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work)
  it('XmppError instance should be instance of XmppError', async () => {
    const instance = new XmppError('msg', XmppErrorCondition.BadRequest);
    // noinspection SuspiciousInstanceOfGuard
    await expect(instance instanceof XmppError).toBe(true);
  });
});

describe(ErrorToString.name, () => {
  it('should return the XmppError message', async () => {
    const instance = new XmppError('msg', XmppErrorCondition.BadRequest);

    const result = ErrorToString(instance);

    await expect(result).toBe('msg');
  });

  it('should return the an understandable error message for an Error', async () => {
    const instance = new Error('confusing');

    const result = ErrorToString(instance);

    await expect(result).toBe('An unknown error has occurred: confusing');
  });

  it('should return the an understandable error message for null', async () => {
    const result = ErrorToString(null);

    await expect(result).toBe('An unknown error has occurred: null');
  });


  it('should return the an understandable error message for undefined', async () => {
    const result = ErrorToString(undefined);

    await expect(result).toBe('An unknown error has occurred: undefined');
  });

  it('should return the an understandable error message for an object', async () => {
    const result = ErrorToString({'foo': 'baa'});

    await expect(result).toBe('An unknown error has occurred: {"foo":"baa"}');
  });
});


describe(JxtErrorToXmppError.name, () => {

  it('should map acceding to the provided spec', async () => {
    const error = {
      condition: 'feature-not-implemented'
    };
    const errorMapping = {
      [XmppErrorCondition.FeatureNotImplemented]: 'It Works!'
    };

    const mappedError = JxtErrorToXmppError(error, errorMapping);

    await expect(mappedError.message).toBe('It Works!');
    await expect(mappedError.condition).toBe(XmppErrorCondition.FeatureNotImplemented);
  });


  it('should handle unmapped conditions', async () => {
    const error = {
      condition: 'unknown'
    };
    const errorMapping = {
      [XmppErrorCondition.FeatureNotImplemented]: 'An example'
    };

    const mappedError = JxtErrorToXmppError(error, errorMapping);

    await expect(mappedError.message).toBe('An unknown error has occurred: {"condition":"unknown"}');
    await expect(mappedError.condition).toBeUndefined();
  });

  it('should handle null errors', async () => {
    const error = null;
    const errorMapping = {};

    const mappedError = JxtErrorToXmppError(error, errorMapping);

    await expect(mappedError.message).toBe('An unknown error has occurred: null');
    await expect(mappedError.condition).toBeUndefined();
  });
  it('should handle undefined errors', async () => {
    const error = undefined;
    const errorMapping = {};

    const mappedError = JxtErrorToXmppError(error, errorMapping);

    await expect(mappedError.message).toBe('An unknown error has occurred: undefined');
    await expect(mappedError.condition).toBeUndefined();
  });
  it('should handle Errors', async () => {
    const error = new Error('Sth. went wrong');
    const errorMapping = {};

    const mappedError = JxtErrorToXmppError(error, errorMapping);

    await expect(mappedError.message).toBe('An unknown error has occurred: Sth. went wrong');
    await expect(mappedError.condition).toBeUndefined();
  });

  it('should map timeouts', async () => {
    const error = {
      condition: 'timeout'
    };
    const errorMapping = {};

    const mappedError = JxtErrorToXmppError(error, errorMapping);

    await expect(mappedError.message).toBe('Connection has timed out');
    await expect(mappedError.condition).toBe(XmppErrorCondition.Timeout);
  });
  it('should map internal server error', async () => {
    const error = {
      condition: 'internal-server-error'
    };
    const errorMapping = {};

    const mappedError = JxtErrorToXmppError(error, errorMapping);

    await expect(mappedError.message).toBe('Internal Server Error');
    await expect(mappedError.condition).toBe(XmppErrorCondition.InternalServerError);
  });
});
