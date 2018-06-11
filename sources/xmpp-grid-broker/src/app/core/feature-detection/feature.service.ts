import {Injectable} from '@angular/core';

import {ErrorLogService} from '../errors/';
import {XmppIqType, XmppService} from '../xmpp/';

/**
 * Service that queries the xmpp server for all required features.
 */
@Injectable()
export class FeatureService {
  /**
   * Set of required features to be queried with service discovery.
   */
  static readonly REQUIRED_PUBSUB_FEATURES = [
    'access-open', 'collections', 'config-node', 'create-and-configure', 'create-nodes', 'delete-nodes', 'get-pending', 'instant-nodes',
    'item-ids', 'meta-data', 'modify-affiliations', 'manage-subscriptions', 'multi-subscribe', 'outcast-affiliation', 'persistent-items',
    'presence-notifications', 'publish', 'publisher-affiliation', 'purge-nodes', 'retract-items', 'retrieve-affiliations',
    'retrieve-default', 'retrieve-items', 'retrieve-subscriptions', 'subscribe', 'subscription-options'
  ];

  /**
   * map used to cache protocol features.
   */
  private _protocolFeatures: Map<string, Promise<string[]>> = new Map();

  constructor(private xmppService: XmppService, private errorLogService: ErrorLogService) {
  }

  /**
   * Checks for a basic set of required features and returns
   * a list of all missing features.
   * If all required features are present, the list is empty
   */
  public getMissingRequiredFeatures(): Promise<string[]> {
    return this.checkFeatures('pubsub', FeatureService.REQUIRED_PUBSUB_FEATURES);
  }

  /**
   * Queries the XMPP server for the support of a specific feature.
   * Unsupported features are logged.
   */
  public checkFeature(protocol: string, feature: string = ''): Promise<boolean> {
    return this._getProtocolFeatures(protocol)
      .then(features => {
        const supported = features.includes(feature);

        if (!supported) {
          this.errorLogService.warn(`XMPP feature ${feature} of protocol ${protocol} is not supported.`);
        }
        return supported;
      });
  }

  /**
   * Queries the XMPP server for supported feature of a protocol,
   * and returns a list unsupported features.
   *
   * If all required features are present, the returned list is empty.
   */
  public checkFeatures(protocol: string, features: string[]): Promise<string[]> {
    const featureSupport = features
      .map((feature => this.checkFeature(protocol, feature)));
    // check that _every_ requested feature is supported.
    return Promise.all(featureSupport)
      .then((resolvedFeatures) => {
        return resolvedFeatures
          .map((item, idx) => {
            return {isSupported: item, label: `${features[idx]}(${protocol})`};
          })
          .filter((feature) => !feature.isSupported)
          .map((feature) => feature.label);
      });
  }

  /**
   * Queries the features of a specific protocol (e.g. 'pubsub')
   * from the XMPP server.
   */
  private _getProtocolFeatures(protocol: string): Promise<string[]> {
    if (this._protocolFeatures.has(protocol)) {
      return this._protocolFeatures.get(protocol);
    }

    const cmd = {
      type: XmppIqType.Get,
      to: this.xmppService.getServerTitle(),
      discoInfo: {}
    };
    const req = protocol === 'pubsub' ? this.xmppService.executeIqToPubsub(cmd) : this.xmppService.executeIq(cmd);
    const query = req.then(rawFeatures => {
      return rawFeatures.discoInfo.features
      // Map URLs to feature strings
        .map(url => {
          if (url.startsWith(`http://jabber.org/protocol/${protocol}`)) {
            if (url.includes('#')) {
              return url.split('#', 2).pop();
            } else {
              return ''; // general protocol support
            }
          } else {
            return undefined;
          }
        })
        // Filter features that do not belong to this protocol
        .filter(feature => feature !== undefined);
    });

    this._protocolFeatures.set(protocol, query);
    return query;
  }
}
