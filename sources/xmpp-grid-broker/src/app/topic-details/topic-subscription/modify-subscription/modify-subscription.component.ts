import {Component, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';

import {ErrorLogService, ErrorToString, NavigationService, XmppDataForm} from '../../../core';
import {TopicSubscriptionService} from '../topic-subscription.service';

@Component({
  selector: 'xgb-modify-subscription',
  templateUrl: './modify-subscription.component.html'
})
export class ModifySubscriptionComponent implements OnInit {

  /**
   * topic identifier to display in the form - loaded from the url.
   */
  nodeId: string;

  /**
   * jid to display in the form - loaded from the url.
   */
  jid: string;

  /**
   * subscription id to display in the form - loaded from the url.
   */
  subId: string;


  /**
   * Flag indicating if the form is loaded or it's submission is in progress.
   */
  loading: boolean;

  /**
   * If defined, it contains a service response result, eg. if the update failed
   * or if the loading of the form has failed.
   */
  errorMessage: string | undefined;

  /**
   * The angular form used for the form binding.
   */
  formGroup: FormGroup;

  /**
   * The XMPP Data Form (XEP-0004) containing the loaded config.
   */
  xmppForm: XmppDataForm;

  constructor(private route: ActivatedRoute,
              private topicSubscriptionService: TopicSubscriptionService,
              private navigationService: NavigationService,
              private errorLogService: ErrorLogService) {
  }

  ngOnInit() {
    // read parameters from the url
    this.nodeId = this.route.parent.snapshot.params.id;
    this.jid = this.route.snapshot.params.jid;
    this.subId = this.route.snapshot.params.subId;

    // load the data form
    this.loading = true;
    this.topicSubscriptionService.loadConfiguration(
      this.nodeId,
      this.jid,
      this.subId
    ).then((form) => {
      this.loading = false;
      this.xmppForm = form;
      this.formGroup = new FormGroup({});
    }).catch((err) => {
      this.loading = false;
      this.errorMessage = ErrorToString(err);
      this.errorLogService.error(this.errorMessage, err);
    });

  }

  onFormSubmit(): boolean {
    this.loading = true;
    this.topicSubscriptionService.updateConfiguration(
      this.nodeId,
      this.jid,
      this.subId,
      XmppDataForm.fromFormGroup(this.formGroup, this.xmppForm)
    )
      .then(() => {
        this.navigationService.goToSubscriptions(this.nodeId);
      })
      .catch((err) => {
        this.loading = false;
        this.errorMessage = ErrorToString(err);
        this.errorLogService.error(this.errorMessage, err);
      });

    return false;
  }

}
