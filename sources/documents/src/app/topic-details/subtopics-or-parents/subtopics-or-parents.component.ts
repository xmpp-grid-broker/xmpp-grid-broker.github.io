import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

import {ConfigService, NavigationService, Topic} from '../../core';
import {IteratorListPager} from '../../shared';
import {CurrentTopicDetailService} from '../current-topic-detail.service';
import {SubtopicsOrParentsService} from './subtopics-or-parents.service';

@Component({
  selector: 'xgb-subtopics-or-parents',
  templateUrl: './subtopics-or-parents.component.html'
})
export class SubtopicsOrParentsComponent implements OnInit {

  topicPager: IteratorListPager<Topic>;
  topic: Topic;

  constructor(private route: ActivatedRoute,
              private navigationService: NavigationService,
              private service: SubtopicsOrParentsService,
              private detailsService: CurrentTopicDetailService,
              configService: ConfigService) {
    this.topicPager = new IteratorListPager<Topic>(configService.getConfig().pageSize);
  }

  ngOnInit() {
    this.topic = this.detailsService.currentTopic();
    if (this.route.snapshot.data.subtopics) {
      this.topicPager.useIterator(this.service.subtopics(this.topic.title));
    } else {
      this.topicPager.useIterator(this.service.parents(this.topic.title));
    }

  }

  onTopicClicked(topic: Topic) {
    this.navigationService.goToTopic(topic);
  }
}
