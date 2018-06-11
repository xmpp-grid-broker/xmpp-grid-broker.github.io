import {Injectable} from '@angular/core';

import {JxtErrorToXmppError, PersistedItem, XmppErrorCondition, XmppIqType, XmppService} from '../../core';

@Injectable()
export class PersistedItemsService {
  /**
   * The number of items to fetch at a time from
   * the xmpp server (result management page size).
   */
  private PAGE_SIZE = 50;

  constructor(private xmppService: XmppService) {
  }

  /**
   * Loads and sets the XML payload of the given persisted item.
   * Will set the value in-place on the provided item and returns
   * the same instance as well with the raw-xml field populated.
   */
  public loadPersistedItemContent(topicIdentifier: string, item: PersistedItem): Promise<PersistedItem> {
    const detailedCmd = {
      type: XmppIqType.Get,
      pubsub: {
        retrieve: {
          node: topicIdentifier,
          item: {
            id: item.id
          }
        },
      }
    };

    return this.xmppService.executeIqToPubsub(detailedCmd)
      .then((result) => {
        const detailedItem = result.pubsub.retrieve.item;
        item.rawXML = detailedItem.rawXML;
        return item;
      })
      .catch((error) => {
        throw JxtErrorToXmppError(error, {
          [XmppErrorCondition.BadRequest]: 'Both, subscription id and jid are required to load an item',
          [XmppErrorCondition.Forbidden]: 'You are blocked from retrieving persisted items',
          [XmppErrorCondition.NotAcceptable]: `The given subscription id ${item.id} is invalid`,
          [XmppErrorCondition.NotAuthorized]: `You must be subscribed to the topic ${topicIdentifier} to fetch this item`,
          [XmppErrorCondition.NotAllowed]: `You must be whitelisted to the topic ${topicIdentifier} to fetch this item`,
          [XmppErrorCondition.PaymentRequired]: 'Payment is required to fetch this item',
          [XmppErrorCondition.FeatureNotImplemented]: 'Service does not support persisted items or the retrieval of persisted items',
          [XmppErrorCondition.ItemNotFound]: `Topic ${topicIdentifier} does not exist`
        });
      });
  }

  /**
   * Returns an Async iterator to iterate through all persisted items
   * of the topic with the given topic identifier.
   *
   * Note that the yielded persisted elements do not contain their payload.
   * Use the corresponding service method on {@link PersistedItemsService#loadPersistedItemContent} instead.
   */
  public async* persistedItems(topicIdentifier: string): AsyncIterableIterator<PersistedItem> {
    let loadAfter: number | undefined;
    let hasMore = true;

    do {
      const cmd = {
        type: XmppIqType.Get,
        discoItems: {
          node: topicIdentifier,
          rsm: {
            max: this.PAGE_SIZE,
            after: loadAfter
          }
        }
      };

      const response = await this.xmppService.executeIqToPubsub(cmd);
      const items = response.discoItems.items;
      if (!items) {
        return;
      }

      const rsm = response.discoItems.rsm;
      loadAfter = rsm.last;
      hasMore = parseInt(rsm.firstIndex, 10) + this.PAGE_SIZE < parseInt(rsm.count, 10);

      for (const item of items) {
        yield new PersistedItem(item.name);
      }
    } while (hasMore);

  }

  /**
   * Deletes the given persisted item from the given node.
   */
  public deletePersistedItem(topicIdentifier: string, item: PersistedItem): Promise<void> {
    const detailedCmd = {
      type: XmppIqType.Get,
      pubsub: {
        retract: {
          node: topicIdentifier,
          id: item.id
        },
      }
    };

    return this.xmppService.executeIqToPubsub(detailedCmd)
      .catch((error) => {
        throw JxtErrorToXmppError(error, {
          [XmppErrorCondition.FeatureNotImplemented]: 'Service does not support persisted items or their deletion',
          [XmppErrorCondition.Forbidden]: 'You have sufficient privileges delete this item',
          [XmppErrorCondition.ItemNotFound]: `Topic ${topicIdentifier} does not exist`,
          [XmppErrorCondition.BadRequest]: 'Topic identifier and item id are required'
        });
      });
  }

  /**
   * Purge all persisted items on the given topic.
   */
  public purgePersistedItem(topicIdentifier: string): Promise<void> {
    const detailedCmd = {
      type: XmppIqType.Get,
      pubsubOwner: {
        purge: topicIdentifier
      }
    };

    return this.xmppService.executeIqToPubsub(detailedCmd)
      .catch((error) => {
        throw JxtErrorToXmppError(error, {
          [XmppErrorCondition.FeatureNotImplemented]: 'Service does not support persisted items or purging',
          [XmppErrorCondition.Forbidden]: 'You have sufficient privileges to purge',
          [XmppErrorCondition.ItemNotFound]: `Topic ${topicIdentifier} does not exist`
        });
      });
  }

  public publishItem(topicIdentifier: string, rawXML: string): Promise<void> {
    const cmd = {
      type: XmppIqType.Get,
      pubsub: {
        publish: {
          node: topicIdentifier,
          item: {
            rawXML: rawXML
          },
        }
      }
    };
    return this.xmppService.executeIqToPubsub(cmd)
      .then(() => {
      }).catch((error) => {
        throw JxtErrorToXmppError(error, {
          [XmppErrorCondition.Forbidden]: 'You do not have sufficient privileges to publish to this topic',
          [XmppErrorCondition.FeatureNotImplemented]: 'Item Publication Not Supported',
          [XmppErrorCondition.ItemNotFound]: `Topic ${topicIdentifier} does not exist`,
          [XmppErrorCondition.NotAcceptable]: 'The payload size exceeds a service-defined limit',
          [XmppErrorCondition.BadRequest]: 'The payload does not match the configured namespace for this topic',
        });
      });
  }
}
