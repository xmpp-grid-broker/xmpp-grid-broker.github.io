export abstract class Topic {
  protected constructor(public title: string) {
  }

  /**
   * Creates a new topic from the discovery info as received by stanza.
   */
  static fromDiscoInfo(discoInfo: any): Topic {
    const topicTitle = discoInfo.node;
    const topicType = discoInfo.identities[0]['type'];

    if (topicType === 'leaf') {
      return new LeafTopic(topicTitle); //tslint:disable-line
    } else if (topicType === 'collection') {
      return new CollectionTopic(topicTitle); //tslint:disable-line
    } else {
      throw new Error(`XMPP: Unsupported PubSub type "${topicType}"`);
    }
  }

  /**
   * utility method to simplify template code.
   */
  public isCollection(): boolean {
    return this instanceof CollectionTopic; //tslint:disable-line
  }

  /**
   * utility method to simplify template code.
   */
  public isLeaf(): boolean {
    return this instanceof LeafTopic; //tslint:disable-line
  }
}

export class CollectionTopic extends Topic {
  constructor(public title: string) {
    super(title);
  }
}

export class LeafTopic extends Topic {
  constructor(public title: string) {
    super(title);
  }
}
