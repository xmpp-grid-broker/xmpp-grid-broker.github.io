import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ConfigService} from 'app/core/config';
import 'rxjs/add/operator/filter';

import {NavigationService, Topic, XmppService} from '../../core';
import {IteratorListPager} from '../../shared';
import {TopicOverviewService} from '../topic-overview-service';


@Component({
  selector: 'xgb-topic-overview',
  templateUrl: './topic-overview.component.html'
})
export class TopicOverviewComponent implements OnInit {

  topicPager: IteratorListPager<Topic>;

  serverTitle: string;

  constructor(private navigationService: NavigationService,
              private xmppService: XmppService,
              private topicOverviewService: TopicOverviewService,
              private route: ActivatedRoute,
              configService: ConfigService) {
    this.topicPager = new IteratorListPager<Topic>(configService.getConfig().pageSize);
  }

  ngOnInit() {
    this.serverTitle = this.xmppService.getServerTitle();

    let iterator: AsyncIterableIterator<Topic>;

    switch (this.route.snapshot.data.filter) {
      case 'root':
        iterator = this.topicOverviewService.rootTopics();
        break;
      case 'all':
        iterator = this.topicOverviewService.allTopics();
        break;
      case 'collections':
        iterator = this.topicOverviewService.allCollections();
        break;
    }
    this.topicPager.useIterator(iterator);
  }

  createNew(what: string) {
    switch (what) {
      case 'collection':
        this.navigationService.goToNewCollection();
        break;
      default:
        this.navigationService.goToNewTopic();
    }
  }

  onTopicClicked(topic: Topic) {
    this.navigationService.goToTopic(topic);
  }
}
