import {Injectable} from '@angular/core';

import {CollectionTopic, Topic, XmppIqType, XmppService} from '../core';

/**
 * This service provides commonly used functionality
 * to iterate (recursively) trough all children or parent
 * topics/collections (of a given topic).
 */
@Injectable()
export class TopicIteratorHelperService {
  // The internally used page size, meaning how many nodes to load at a time using result set management
  private readonly PAGE_SIZE = 50;

  constructor(private xmppService: XmppService) {
  }

  /**
   * Returns an async iterator that yields all child topics/collections of the given topic.
   * Setting topicIdentifier to undefined returns all root topics/collections.
   * If recursive is set to true, all child topics/collections of the
   * root topics/collections are yielded as well.
   */
  public async* createChildTopicsIterator(topicIdentifier: string, recursive: boolean): AsyncIterableIterator<Topic> {

    const topicsForWhichTheChildrenShallBeLoaded: Array<string | undefined> = [topicIdentifier];
    const visitedTopics = []; // To prevent duplicates...

    while (topicsForWhichTheChildrenShallBeLoaded.length > 0) {
      const topicName = topicsForWhichTheChildrenShallBeLoaded.pop();
      // Iterate over all it's children
      const iterator = this.createTopicChildrenIterator(topicName);
      let next = await iterator.next();

      while (!next.done) {
        const topic = next.value;

        // top prevent duplicates...
        if (visitedTopics.indexOf(topic.title) >= 0) {
          next = await iterator.next();
          continue;
        }
        yield topic;
        visitedTopics.push(topic.title);
        if (recursive && topic instanceof CollectionTopic) {
          topicsForWhichTheChildrenShallBeLoaded.push(topic.title);
        }
        next = await iterator.next();
      }
    }
  }

  /**
   * Returns an async iterator that yields all parent collections of the given topic/collection.
   */
  public async* createParentsTopicsIterator(topicIdentifier: string, recursive: boolean): AsyncIterableIterator<Topic> {
    const topicsToLoad: Array<string> = [topicIdentifier];
    const visitedTopics = [];
    while (topicsToLoad.length > 0) {
      const topicName = topicsToLoad.pop();
      // Iterate over all direct parents
      for (const topic of await this.loadParents(topicName)) {
        // prevent duplicates...
        if (visitedTopics.indexOf(topic.title) >= 0) {
          continue;
        }
        yield topic;
        visitedTopics.push(topic.title);
        if (recursive) {
          topicsToLoad.push(topic.title);
        }
      }
    }
  }

  // noinspection JSMethodCanBeStatic
  /**
   * Filters the given iterator using the provided predicate.
   */
  public async* filterTopicsIterator(iterator: AsyncIterableIterator<Topic>, predicate: (value) => boolean): AsyncIterableIterator<Topic> {
    let next = await iterator.next();
    while (!next.done) {
      if (predicate(next.value)) {
        yield next.value;
      }
      next = await iterator.next();
    }
  }

  /**
   * Returns an async iterator that yields all direct child topics/collections
   * of the given topic identifier.
   */
  private async* createTopicChildrenIterator(topicIdentifier: string): AsyncIterableIterator<Topic> {
    let loadAfter: number | undefined;
    let hasMore = true;
    do {
      // noinspection JSUnusedAssignment
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
      const items = response.discoItems.items === undefined ? [] : response.discoItems.items;
      const rsm = response.discoItems.rsm;
      loadAfter = rsm.last;
      hasMore = parseInt(rsm.firstIndex, 10) + this.PAGE_SIZE < parseInt(rsm.count, 10);

      for (let idx = 0; idx < items.length; idx++) {
        const item = items[idx];
        const topic = await this.loadTopicByIdentifier(item.node);
        yield topic;
      }
    } while (hasMore);
  }

  /**
   * Loads all parent nodes of the given topic based on the disco form.
   */
  private async loadParents(topicName: string): Promise<Topic[]> {
    const cmd = {
      type: XmppIqType.Get,
      discoInfo: {
        node: topicName
      }
    };
    const response = await this.xmppService.executeIqToPubsub(cmd);
    for (const field of response.discoInfo.form.fields) {
      if (field.name === 'pubsub#collection' && field.value) {
        const parents: [Promise<Topic>] = field.value.split('\n')
          .filter(value => value)
          .map(parent => this.loadTopicByIdentifier(parent));
        return await Promise.all(parents);
      }
    }
    return [];
  }


  /**
   * Load detailed Topic information (ie. Leaf or Collection) by its identifier.
   */
  private async loadTopicByIdentifier(name: string): Promise<Topic> {
    const cmd = {
      type: XmppIqType.Get,
      discoInfo: {
        node: name
      }
    };
    const response = await this.xmppService.executeIqToPubsub(cmd);
    return Topic.fromDiscoInfo(response.discoInfo);

  }
}
