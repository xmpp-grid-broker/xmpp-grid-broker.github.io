import {Component, OnInit} from '@angular/core';

import {ErrorLogService, ErrorToString, NavigationService, Subscription, Topic} from '../../../core';
import {CurrentTopicDetailService} from '../../current-topic-detail.service';
import {TopicSubscriptionService} from '../topic-subscription.service';

@Component({
  selector: 'xgb-topic-subscription',
  templateUrl: './topic-subscription.component.html',
  styleUrls: ['./topic-subscription.component.css']
})
export class TopicSubscriptionComponent implements OnInit {

  /**
   * If a service method call is pending, this field is set to false,
   * otherwise true. Used for the spinner.
   */
  isLoaded: boolean;

  /**
   * will be set if a service method call has failed.
   * this is the error message to display
   * to the user.
   */
  errorMessage: string;

  /**
   * An array of the subscriptions to manage.
   */
  subscriptions: Subscription[];

  /**
   * The topic on which the subscriptions are managed.
   */
  private topic: Topic | undefined;

  constructor(private topicSubscriptionService: TopicSubscriptionService,
              private detailsService: CurrentTopicDetailService,
              private navigationService: NavigationService,
              private errorLogService: ErrorLogService) {
  }

  ngOnInit() {
    this.topic = this.detailsService.currentTopic();
    this.refresh();
  }

  unsubscribe(subscription: Subscription) {
    this.topicSubscriptionService.unsubscribe(this.topic.title, subscription)
      .then(() => {
        this.refresh();
      })
      .catch((error) => {
        this.isLoaded = true;
        this.errorMessage = ErrorToString(error);
        this.errorLogService.error(this.errorMessage, error);
      });
  }

  modify(subscription: Subscription) {
    this.navigationService.goToSubscription(this.topic.title, subscription.jid, subscription.subid);
  }

  newSubscription() {
    this.navigationService.goToNewSubscription(this.topic.title);
  }

  private refresh() {
    this.isLoaded = false;
    this.topicSubscriptionService.loadSubscriptions(this.topic.title)
      .then((loadedSubscriptions: Subscription[]) => {
        this.isLoaded = true;
        this.subscriptions = loadedSubscriptions;
      })
      .catch((error) => {
        this.isLoaded = true;
        this.errorMessage = ErrorToString(error);
        this.errorLogService.error(this.errorMessage, error);
      });
  }

}
