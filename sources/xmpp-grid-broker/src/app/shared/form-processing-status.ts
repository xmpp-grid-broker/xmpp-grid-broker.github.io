/*
 * A utility class that simplifies loading and error handling
 * of forms.
 */
import {ErrorToString} from '../core/xmpp';

export class FormProcessingStatus {
  /**
   * Indicates weather the form is being processed / loaded
   */
  processing = true;

  /**
   * Optional success message, not necessarily set whe successful.
   */
  success: string | undefined;

  /**
   * error  message, set if an error has occurred.
   */
  error: string | undefined;

  /**
   * Begin to process the form.
   */
  public begin() {
    this.processing = true;
  }

  /**
   * Mark processing as done - optionally providing an error or success message.
   * If no error is provided, the loading is considered a success.
   */
  public done(params: { successMessage?: string, error?: any } = {}) {
    this.success = params.successMessage;
    this.error = params.error ? ErrorToString(params.error) : undefined;
    this.processing = false;
  }

}
