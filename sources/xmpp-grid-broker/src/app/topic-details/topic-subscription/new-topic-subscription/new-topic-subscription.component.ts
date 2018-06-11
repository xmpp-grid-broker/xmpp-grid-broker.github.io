import {Component, OnInit} from '@angular/core';
import {NgForm} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';

import {ErrorLogService, ErrorToString, NavigationService} from '../../../core';
import {TopicSubscriptionService} from '../topic-subscription.service';

@Component({
  selector: 'xgb-new-topic-subscription',
  templateUrl: './new-topic-subscription.component.html',
  styleUrls: ['./new-topic-subscription.component.css']
})
export class NewTopicSubscriptionComponent implements OnInit {

  nodeId: string;
  errorMessage: string | undefined;

  constructor(private route: ActivatedRoute,
              private navigationService: NavigationService,
              private topicSubscriptionService: TopicSubscriptionService,
              private errorLogService: ErrorLogService) {
  }

  ngOnInit() {
    this.nodeId = this.route.snapshot.params.id;
    this.errorMessage = undefined;
  }

  submit(formRef: NgForm) {
    formRef.form.disable();
    const jid = formRef.form.get('jid').value;
    this.topicSubscriptionService.subscribe(this.nodeId, jid)
      .then(() => this.navigationService.goToSubscriptions(this.nodeId))
      .catch((err) => {
        formRef.form.enable();
        this.errorMessage = ErrorToString(err);
        this.errorLogService.error(this.errorMessage, err);
      });
  }
}
