import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';

import {environment} from '../../../../environments';
import {XmppService} from '../../xmpp';
import {Config} from '../config';

/**
 * Service used to load and read the
 * configuration of the application.
 */
@Injectable()
export class ConfigService {

  /**
   * The URL of the configuration file.
   * @type {string}
   */
  static readonly CONFIG_FILE = environment.config_url;

  private _config: Config;

  constructor(private http: HttpClient,
              private xmppService: XmppService) {
  }

  /**
   * Returns a Promise of the application configuration,
   * that is loaded on this services initialisation.
   *
   * This should only be called once initially - usually,
   * the `getConfig` method is the way to access the config.
   */
  public loadConfig(): Promise<Config> {
    return this.http.get(ConfigService.CONFIG_FILE)
      .toPromise()
      .then(json => {
        this._config = Config.fromJson(json);
        this.xmppService.initialize(this._config);
        return this._config;
      });
  }

  /**
   * Returns the loaded config. `loadConfig` must evaluate before
   * calling this - which is mostly the case as the configuration
   * ist the first thing that get's loaded (by a guard).
   * @returns {Config | undefined}
   */
  public getConfig(): Config | undefined {
    return this._config;
  }

}
