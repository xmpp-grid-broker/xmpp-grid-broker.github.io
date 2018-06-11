import {Component, EventEmitter, Input, Output} from '@angular/core';

import {Topic} from '../../core';
import {IteratorListPager} from '../../shared';

/**
 * A specialized {@type ListComponent} used to render topics.
 * Provides paging.
 */
@Component({
  selector: 'xgb-topics',
  templateUrl: './topic-list.component.html',
  styleUrls: ['./topic-list.component.css']
})
export class TopicListComponent {
  @Input() topicList: IteratorListPager<Topic>;
  @Output() topicClicked = new EventEmitter<Topic>();

  topicClick(node: Topic) {
    this.topicClicked.next(node);
  }

}
