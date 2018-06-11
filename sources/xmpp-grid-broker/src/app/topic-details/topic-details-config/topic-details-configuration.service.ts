import {Injectable} from '@angular/core';

import {JxtErrorToXmppError, XmppDataForm, XmppErrorCondition, XmppIqType, XmppService} from '../../core';

@Injectable()
export class TopicDetailsConfigurationService {

  constructor(private xmppService: XmppService) {
  }

  public loadConfigurationForm(topicIdentifier: string): Promise<XmppDataForm> {
    const cmd = {
      type: XmppIqType.Get,
      pubsubOwner: {
        config: {
          node: topicIdentifier,
        }
      }
    };
    return this.xmppService.executeIqToPubsub(cmd).then((result) =>
      XmppDataForm.fromJSON(result.pubsubOwner.config.form)
    ).catch(error => {
      throw JxtErrorToXmppError(error, {
        [XmppErrorCondition.ItemNotFound]: `Topic ${topicIdentifier} does not exist`,
        [XmppErrorCondition.BadRequest]: 'Missing topic identifier',
        [XmppErrorCondition.FeatureNotImplemented]: 'The service does not support node configuration',
        [XmppErrorCondition.Forbidden]: `You have insufficient Privileges to configure topic ${topicIdentifier}`,
        [XmppErrorCondition.NotAllowed]: 'The topic has no configuration options'
      });
    });
  }

  public async updateTopicConfiguration(topicIdentifier: string, xmppDataForm: XmppDataForm): Promise<XmppDataForm> {
    const form = xmppDataForm.toJSON();

    const cmd = {
      type: XmppIqType.Set,
      pubsubOwner: {
        config: {
          node: topicIdentifier,
          form: form
        }
      }
    };

    return this.xmppService.executeIqToPubsub(cmd)
      .then(() => this.loadConfigurationForm(topicIdentifier))
      .catch(error => {
        throw JxtErrorToXmppError(error, {
          [XmppErrorCondition.NotAcceptable]: 'The server could not process the configuration change'
        });
      });
  }

  /**
   * Deletes the topic with the given topicIdentifier.
   */
  public deleteTopic(topicIdentifier: string): Promise<void> {
    const cmd = {
      type: XmppIqType.Set,
      pubsubOwner: {
        del: topicIdentifier
      }
    };
    return this.xmppService.executeIqToPubsub(cmd)
      .catch(error => JxtErrorToXmppError(error, {
        [XmppErrorCondition.ItemNotFound]: `Topic ${topicIdentifier} does not exist!`,
        [XmppErrorCondition.Forbidden]: 'You have insufficient Privileges to delete this node',
        [XmppErrorCondition.NotAllowed]: `You are not allowed to delete the root node ${topicIdentifier}`,
      }));
  }


}
