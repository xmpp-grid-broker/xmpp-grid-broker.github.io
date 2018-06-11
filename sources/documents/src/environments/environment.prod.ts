// noinspection JSUnusedGlobalSymbols
import {LogLevel} from '../app/core/errors/log-level';

/**
 * Production environment configuration.
 */
export const environment = {
  production: true,
  config_url: './configuration.json',
  log_level: LogLevel.Warn
};
