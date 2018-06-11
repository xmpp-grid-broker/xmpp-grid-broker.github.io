import {Injectable} from '@angular/core';

import {JxtErrorToXmppError, Topic, XmppErrorCondition, XmppIqType, XmppService} from '../core';

/**
 * This service is used to pass topics
 * from the topic details tab view to it's children.
 *
 * All children can consume the `currentTopic` promise.
 *
 * Child components won't be rendered if the loading
 * has failed.
 */
@Injectable()
export class CurrentTopicDetailService {

  private _topic: Topic;

  constructor(private xmppService: XmppService) {
  }

  /**
   * This method can be used from the tabs
   * of the topic details tab view ot get the currently
   * rendered topic. Because they are only rendered
   * when the topic is successfully loaded, this
   * will always return a valid topic.
   */
  public currentTopic(): Topic {
    return this._topic;
  }

  /**
   * Loads the topic with the given identifier.
   * Returns a promise to handle possible failures.
   */
  public loadTopic(topicIdentifier: string): Promise<Topic> {
    this._topic = undefined;
    const cmd = {
      type: XmppIqType.Get,
      discoInfo: {
        node: topicIdentifier
      }
    };
    return this.xmppService.executeIqToPubsub(cmd)
      .then((response) => {
        this._topic = Topic.fromDiscoInfo(response.discoInfo);
        return this._topic;
      })
      .catch((err) => {
        throw JxtErrorToXmppError(err, {
          [XmppErrorCondition.ItemNotFound]: `Topic ${topicIdentifier} does not exist`
        });
      });
  }
}
