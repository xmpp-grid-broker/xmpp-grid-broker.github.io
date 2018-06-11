import {Injectable} from '@angular/core';
import {Client, createClient} from 'stanza.io';
import {JID} from 'xmpp-jid';

import {XmppConfig} from '../config';
import {NotificationService} from '../notifications';
import {RawXmlStanzaAddOn} from './raw-xml-stanza';

enum XmppConnectionState {
  Down = 0,
  Up = 1,
  Connecting = 2,
}

/**
 * Factory used to create new stanza.io
 * clients. This looses the coupling and
 * simplifies testing.
 */
@Injectable()
export class XmppClientFactory {
  // noinspection JSMethodCanBeStatic
  public createClient(config: any): any {
    return createClient(config);
  }
}

/**
 * Basic XmppService that allows
 * concrete services to use xmpp
 * functionality by submitting queries.
 */
@Injectable()
export class XmppService {
  /**
   * The JID used to address the pubsub service, see XEP-0060 for details
   */
  public pubSubJid: JID;

  private _client: any;
  private _config: XmppConfig;
  private _state = XmppConnectionState.Down;

  constructor(private xmppClientFactory: XmppClientFactory,
              private notificationService: NotificationService) {
  }

  /**
   * Must be called before any other method is called.
   * The config is required but is lazily loaded.
   *
   * Using promises instead would made the handling quite complicated.
   */
  public initialize(config) {
    this._config = config.xmpp;
    this._client = this._getClientInstance(this._config);
    this.pubSubJid = new JID(`pubsub.${this._config.server}`);
  }

  /**
   * Returns the title of the configured server.
   */
  public getServerTitle(): string {
    return this._config.server;
  }

  /**
   * Returns true if the given bare jid is
   * equal to the bare jid of the current user
   * (meaning the user who is connected to the xmpp server)
   */
  public isJidCurrentUser(bareJid: string): Promise<boolean> {
    return this.getClient().then((client) => client.jid.bare === bareJid);
  }

  /**
   * Returns a promise for a client with a working connection.
   * Automatically tries to connect if no connection is established.
   */
  public getClient(): Promise<any> {
    return new Promise((resolve) => {
      if (this._state === XmppConnectionState.Up) {
        resolve(this._client);
      } else if (this._state === XmppConnectionState.Down) {
        // Register specific callbacks to see if reconnecting fails.
        const errCallback = () => {
          this.notificationService.alert(
            'Connection lost',
            'Multiple attempts to connect to the XMPP server have failed. ' +
            'To retry, reload the page.',
            false);
        };
        const successCallBack = () => {
          // unsubscribe callbacks
          this._client.off('session:started', successCallBack);
          this._client.off('disconnected', errCallback);
          resolve(this._client);
        };
        this._client.on('session:started', successCallBack);
        this._client.on('disconnected', errCallback);

        this.connect();
      } else {
        this._client.on('session:started', () => resolve(this._client));
      }
    });
  }

  /**
   * Same as {@link executeIq} but automatically populates
   * the `to` field on the CMD. This reduces the number of
   * promises and makes the code more readable.
   */
  public executeIqToPubsub(cmdWithoutTo: any): Promise<any> {
    cmdWithoutTo.to = this.pubSubJid;
    return this.executeIq(cmdWithoutTo);
  }

  /**
   * Executes the given JXT info-query on the client.
   * This call reduces the number of promises and makes the code
   * more readable.
   */
  public executeIq(cmd: any): Promise<any> {
    return this.getClient().then((client: any) =>
      new Promise((resolve, reject) => {
        client.sendIq(cmd, (err, result) => {
          if (err && err.error) {
            reject(err.error);
          } else if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      })
    );
  }

  /**
   * Creates a new client instance and installs the basic
   * event handlers, such as session start/end etc., on it.
   */
  private _getClientInstance(config: XmppConfig): any {
    const client = this.xmppClientFactory.createClient(config);
    client.use(RawXmlStanzaAddOn);
    client.on('session:started', () => this._state = XmppConnectionState.Up);
    client.on('disconnected', () => {
      this._state = XmppConnectionState.Down;
    });
    client.on('session:end', () => this._state = XmppConnectionState.Down);
    client.on('auth:failed', () => {
      this._state = XmppConnectionState.Down;
      this.notificationService.alert(
        'Authentication Failed',
        'Failed to authenticate on the XMPP server. Are using the right credentials?',
        false);
    });
    return client;
  }

  /**
   * Try to establish a connection to
   * the XMPP server if the connection is down.
   *
   * Note that this call is not synchronous
   * and the connection is not instantly
   * available. However, the `getClient` method
   * takes this into account and waits for the
   * connection to be available.
   */
  private connect(): void {
    if (this._state === XmppConnectionState.Down) {
      this._state = XmppConnectionState.Connecting;
      this._client.connect();
    }
  }
}
