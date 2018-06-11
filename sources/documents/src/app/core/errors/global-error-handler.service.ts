import {ErrorHandler, Injectable, Injector} from '@angular/core';

import {NotificationService} from '../notifications';
import {ErrorLogService} from './error-log.service';

/*
 * Custom global error handler, that catches all uncaught errors
 * and shows a popup message to the user.
 */
@Injectable()
export class GlobalErrorHandlerService implements ErrorHandler {
  constructor(private injector: Injector) {
  }

  handleError(error: any) {
    const notificationService = this.injector.get(NotificationService);
    const errorLog = this.injector.get(ErrorLogService);
    if (error == null) {
      // ignore "null" errors
      return;
    }

    if (error instanceof Error) {
      errorLog.error(error);
      notificationService.reportError(`${error.stack}`);
    } else if (error != null) {
      notificationService.reportError(error.toString());
    }

  }

}
