// noinspection JSUnusedGlobalSymbols
import {LogLevel} from '../app/core/errors/log-level';

/**
 * Production environment configuration.
 */
export const environment = {
  production: false,
  config_url: 'http://e2e.localhost.redbackup.org:8080/configuration.json',
  log_level: LogLevel.Debug
};
