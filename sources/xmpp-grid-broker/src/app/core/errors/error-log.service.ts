import {Injectable} from '@angular/core';

import {environment} from '../../../environments';
import {LogLevel} from './log-level';

/**
 * This service is intended to be used instead of
 * `console.log` to improve it's testability and control
 * the log level.
 */
@Injectable()
export class ErrorLogService {
  readonly logLevel: LogLevel;

  constructor() {
    this.logLevel = environment.log_level;
  }

  /**
   * Logs a number of messages to a log level on the console,
   * if log entries of this level are kept.
   *
   * @param {any[]} messages
   * @param {LogLevel} level
   */
  public logWithLevel(messages: any[], level: LogLevel) {
    if (level > this.logLevel) {
      return;
    }

    switch (level) {
      case LogLevel.Error:
        console.error.apply(null, messages);
        break;
      case LogLevel.Warn:
        console.warn.apply(null, messages);
        break;
      case LogLevel.Info:
        console.info.apply(null, messages);
        break;
      case LogLevel.Log:
        console.log.apply(null, messages);
        break;
      case LogLevel.Debug:
        console.debug.apply(null, messages);
        break;
    }
  }

  public error(...messages: any[]) {
    this.logWithLevel(messages, LogLevel.Error);
  }

  public warn(...messages: any[]) {
    this.logWithLevel(messages, LogLevel.Warn);
  }

  public info(...messages: any[]) {
    this.logWithLevel(messages, LogLevel.Info);
  }

  public log(...messages: any[]) {
    this.logWithLevel(messages, LogLevel.Log);
  }

  public debug(...messages: any[]) {
    this.logWithLevel(messages, LogLevel.Debug);
  }
}
