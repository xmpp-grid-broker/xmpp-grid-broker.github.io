import {Injectable} from '@angular/core';

import {CollectionTopic, LeafTopic, Topic} from '../../core';
import {TopicIteratorHelperService} from '../../topic-widgets';

@Injectable()
export class TopicOverviewService {

  constructor(private iteratorHelperService: TopicIteratorHelperService) {
  }

  public rootTopics(): AsyncIterableIterator<Topic> {
    return this.iteratorHelperService.createChildTopicsIterator(undefined, false);
  }

  public allTopics(): AsyncIterableIterator<Topic> {
    const iterator = this.iteratorHelperService.createChildTopicsIterator(undefined, true);
    return this.iteratorHelperService.filterTopicsIterator(iterator, (value) => value instanceof LeafTopic);
  }

  public allCollections(): AsyncIterableIterator<Topic> {
    const iterator = this.iteratorHelperService.createChildTopicsIterator(undefined, true);
    return this.iteratorHelperService.filterTopicsIterator(iterator, (value) => value instanceof CollectionTopic);
  }

}
