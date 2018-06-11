import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {Subscription} from 'rxjs/Subscription';

import {ErrorToString, Topic} from '../core';
import {CurrentTopicDetailService} from './current-topic-detail.service';


@Component({
  selector: 'xgb-topic-details',
  templateUrl: './topic-details.component.html'
})
export class TopicDetailsComponent implements OnInit, OnDestroy {

  topic: undefined | Topic;
  errorMessage: undefined | string;
  private paramsSubscription: Subscription;

  constructor(private route: ActivatedRoute,
              private service: CurrentTopicDetailService) {
  }

  ngOnInit() {
    this.paramsSubscription = this.route.params.subscribe((params: Params) => {
      this.topic = undefined;
      const topicInUrl = params.id;
      this.service.loadTopic(topicInUrl).then((topic) => {
        this.topic = topic;
      }).catch((err) => {
        this.errorMessage = ErrorToString(err);
      });
    });
  }

  ngOnDestroy(): void {
    this.paramsSubscription.unsubscribe();
  }

}
