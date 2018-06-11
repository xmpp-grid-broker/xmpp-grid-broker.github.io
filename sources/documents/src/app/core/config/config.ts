/**
 * Possible XMPP transports supported by stanza.
 */
export enum XmppTransport {
  Bosh = 'bosh',
  WebSocket = 'websocket'
}

/**
 * XMPP specific configuration. Will be passed
 * directly into stanza.io.
 * More configuration options can be found in the stanza documentation.
 */
export class XmppConfig {
  // noinspection JSUnusedGlobalSymbols
  constructor(
    readonly server: string,
    readonly transport: XmppTransport,
    readonly wsURL?: string,
    readonly boshURL?: string,
    readonly useStreamManagement = true,
    readonly sasl = ['EXTERNAL'],
    readonly password?: string,
    readonly resource?: string,
    readonly timeout?: number
  ) {
    if (wsURL === undefined && boshURL === undefined) {
      throw new Error('XMPP configuration wsURL or boshURL property must be configured.');
    }
  }

  /**
   * Creates a typed {@type XmppConfig} object from untyped json object.
   */
  static fromJson(json: any): XmppConfig {
    const requiredFieldNames = ['transport', 'server'];
    for (const fieldName of requiredFieldNames) {
      if (!json[fieldName]) {
        throw Error(`XMPP configuration field "${fieldName}" must be configured`);
      }
    }

    if (json.transport && json.transport !== XmppTransport.Bosh && json.transport !== XmppTransport.WebSocket) {
      throw new Error('XMPP configuration "transport" must either be bosh or websocket.');
    }

    return new XmppConfig(
      json.server,
      json.transport,
      json.wsURL,
      json.boshURL,
      json.useStreamManagement,
      json.sasl,
      json.password,
      json.timeout
    );
  }
}

/**
 * Main configuration object for the broker application.
 */
export class Config {
  constructor(readonly xmpp: XmppConfig, readonly pageSize: number) {
  }

  /**
   * Creates a typed {@type Config} object from a plain json object.
   */
  static fromJson(json: any): Config {
    const requiredFieldNames = ['xmpp'];
    for (const fieldName of requiredFieldNames) {
      if (!json[fieldName]) {
        throw Error(`Configuration field "${fieldName}" is undefined!`);
      }
    }

    return new Config(XmppConfig.fromJson(json.xmpp), json.pageSize || 20);
  }
}
