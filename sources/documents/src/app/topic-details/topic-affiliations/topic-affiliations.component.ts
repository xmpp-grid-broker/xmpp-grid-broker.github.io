import {Component, OnInit} from '@angular/core';
import {NgForm} from '@angular/forms';

import {Affiliation, ErrorToString, JidAffiliation, NotificationService, Topic, XmppService} from '../../core';
import {CurrentTopicDetailService} from '../current-topic-detail.service';
import {TopicAffiliationsService} from './topic-affiliations.service';

@Component({
  selector: 'xgb-topic-affiliations',
  templateUrl: './topic-affiliations.component.html',
  styleUrls: ['./topic-affiliations.component.css']
})
export class TopicAffiliationsComponent implements OnInit {

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
   * An array of the affiliations to manage.
   */
  jidAffiliations: JidAffiliation[];

  /**
   * Used within template because Object.keys cannot be used directly in
   * angular templates.
   */
  readonly affiliations = Object.keys(Affiliation).reduce((acc, key) => {
    if (Affiliation[key] === Affiliation.None) { // because none means delete
      return acc;
    }
    acc.push({label: key, value: Affiliation[key]});
    return acc;
  }, []);

  /**
   * The topic on which the affiliations are managed.
   */
  private topic: undefined | Topic;

  constructor(private xmppService: XmppService,
              private topicAffiliationsService: TopicAffiliationsService,
              private detailsService: CurrentTopicDetailService,
              private notificationService: NotificationService) {
  }

  ngOnInit() {
    this.topic = this.detailsService.currentTopic();
    this.refresh();
  }

  addAffiliation(formRef: NgForm) {
    const form = formRef.form;

    const newAffiliation = new JidAffiliation(
      form.get('jid').value,
      form.get('affiliation').value);

    this.isLoaded = false;
    this.topicAffiliationsService.modifyJidAffiliation(this.topic.title, newAffiliation)
      .then(() => {
        form.reset();
        this.refresh();
      })
      .catch(error => {
        this.errorMessage = ErrorToString(error);
      });
  }

  changeAffiliation(affiliation: JidAffiliation, newAffiliation, selectBox) {
    this.xmppService.isJidCurrentUser(affiliation.jid)
      .then((doChangeOwnConfig) => {
        if (!doChangeOwnConfig) {
          this.doChangeAffiliation(affiliation, newAffiliation);
          return;
        }
        this.notificationService.confirm('Warning', 'You are about to change your own access rights. ' +
          'This means that you may no longer have access rights. Are you sure to proceed?')
          .then((confirmed) => {
            if (confirmed) {
              this.doChangeAffiliation(affiliation, newAffiliation);
            } else {
              selectBox.value = affiliation.affiliation;
            }
          });
      });

  }

  removeAffiliation(affiliation: JidAffiliation) {
    this.xmppService.isJidCurrentUser(affiliation.jid).then((doChangeOwnConfig) => {
      if (!doChangeOwnConfig) {
        this.doRemoveAffiliation(affiliation);
        return;
      }
      this.notificationService.confirm('Warning', 'You\'re about to remove your affiliation with this topic. ' +
        'This means that you may no longer have access rights. Are you sure to proceed?')
        .then((confirmed) => {
          if (confirmed) {
            this.doRemoveAffiliation(affiliation);
          }
        });
    });
  }

  private doRemoveAffiliation(affiliation: JidAffiliation) {
    affiliation.affiliation = Affiliation.None;
    this.isLoaded = false;
    this.topicAffiliationsService.modifyJidAffiliation(this.topic.title, affiliation)
      .then(() => {
        this.refresh();
      })
      .catch(error => {
        this.errorMessage = ErrorToString(error);
      });
  }

  private doChangeAffiliation(affiliation: JidAffiliation, newAffiliation) {
    this.isLoaded = false;
    affiliation.affiliation = newAffiliation;
    this.topicAffiliationsService.modifyJidAffiliation(this.topic.title, affiliation)
      .then(() => {
        this.refresh();
      })
      .catch(error => {
        this.errorMessage = ErrorToString(error);
      });
  }

  private refresh() {
    this.isLoaded = false;
    this.topicAffiliationsService.loadJidAffiliations(this.topic.title)
      .then((loadedAffiliations: JidAffiliation[]) => {
        this.isLoaded = true;
        this.jidAffiliations = loadedAffiliations;
      })
      .catch((error) => {
        this.isLoaded = true;
        this.errorMessage = ErrorToString(error);
      });
  }


}
