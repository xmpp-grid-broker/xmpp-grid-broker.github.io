import {Component, OnInit} from '@angular/core';

import {NavigationService, NotificationService, Topic, XmppDataForm} from '../../core';
import {FormProcessingStatus} from '../../shared';
import {CurrentTopicDetailService} from '../current-topic-detail.service';
import {TopicDetailsConfigurationService} from './topic-details-configuration.service';

@Component({
  selector: 'xgb-topic-details-config',
  templateUrl: './topic-details-config.component.html'
})
export class TopicDetailsConfigComponent implements OnInit {
  /**
   * The topic on which to operate.
   */
  topic: undefined | Topic;

  /**
   * The formStatus is used as a helper
   * to render the spinner, error and info boxes.
   */
  formProcessing: FormProcessingStatus = new FormProcessingStatus();

  /**
   * The form that is currently loaded.
   */
  loadedForm: XmppDataForm;

  /**
   * A utility property that helps hide the update
   * button if the loading fails.
   * @type {boolean}
   */
  initialFormLoaded = false;

  constructor(private topicDetailsService: TopicDetailsConfigurationService,
              private detailsService: CurrentTopicDetailService,
              private navigationService: NavigationService,
              private notificationService: NotificationService) {
  }

  ngOnInit(): void {
    this.formProcessing.begin();
    this.topic = this.detailsService.currentTopic();
    this.topicDetailsService.loadConfigurationForm(this.topic.title)
      .then((form: XmppDataForm) => {
        this.initialFormLoaded = true;
        this.loadedForm = form;
        this.formProcessing.done();
      })
      .catch((error) => this.formProcessing.done({error}));
  }

  submit(submittedForm: XmppDataForm): void {
    this.formProcessing.begin();
    this.topicDetailsService.updateTopicConfiguration(this.topic.title, submittedForm)
      .then((dataForm) => {
        this.loadedForm = dataForm;
        this.formProcessing.done({
          successMessage: 'Form successfully updated!'
        });
      })
      .catch((error) => {
        this.formProcessing.done({error});
      });
  }

  deleteTopic(event) {

    this.notificationService.confirm(
      'Warning',
      `You are about to permanently delete the Topic ${this.topic.title}! Are you sure to proceed?`,
      `Yes, permanently delete ${this.topic.title}`, 'Cancel')
      .then((confirmed) => {
        if (confirmed) {
          this.doDeleteTopic();
        }
      });
    event.preventDefault();
  }

  private doDeleteTopic() {
    this.topicDetailsService.deleteTopic(this.topic.title)
      .then(() => {
        this.navigationService.goToHome();
      })
      .catch((error) => this.formProcessing.done({error}));
  }
}
