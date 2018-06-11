import {TopicIteratorHelperService} from '.';
import {LeafTopic, XmppService} from '../core';

describe(TopicIteratorHelperService.name, () => {

  let xmppService: jasmine.SpyObj<XmppService>;
  let service: TopicIteratorHelperService;

  beforeEach(() => {
    xmppService = jasmine.createSpyObj('XmppService', ['executeIqToPubsub']);
    service = new TopicIteratorHelperService(xmppService);

    xmppService.executeIqToPubsub.and.callFake((cmd) => {
        if (cmd.discoItems) {
          return Promise.resolve(DISCO_ITEMS[cmd.discoItems.node]);  //tslint:disable-line
        }
        return Promise.resolve(DISCO_INFO[cmd.discoInfo.node]);  //tslint:disable-line
      }
    );
  });

  describe('concerning createChildTopicsIterator', () => {
    it('should return all direct subtopics topics when undefined is given', async () => {
      const iterator = service.createChildTopicsIterator(undefined, false);
      await expect((await iterator.next()).value.title).toBe('leaf1');
      await expect((await iterator.next()).value.title).toBe('collection1');
      await expect((await iterator.next()).value.title).toBe('collection3');
      await expect((await iterator.next()).done).toBe(true);
    });

    it('should recursively return all subtopics when undefined is given', async () => {
      const iterator = service.createChildTopicsIterator(undefined, true);
      await expect((await iterator.next()).value.title).toBe('leaf1');
      await expect((await iterator.next()).value.title).toBe('collection1');
      await expect((await iterator.next()).value.title).toBe('collection3');
      await expect((await iterator.next()).value.title).toBe('leaf3');
      await expect((await iterator.next()).value.title).toBe('leaf2');
      await expect((await iterator.next()).value.title).toBe('collection2');
      await expect((await iterator.next()).done).toBe(true);
    });

    it('should recursively return all subtopics for a given name', async () => {
      const iterator = service.createChildTopicsIterator('collection1', true);
      await expect((await iterator.next()).value.title).toBe('leaf2');
      await expect((await iterator.next()).value.title).toBe('collection2');
      await expect((await iterator.next()).value.title).toBe('leaf3');
      await expect((await iterator.next()).done).toBe(true);
    });

  });

  describe('concerning createChildTopicsIterator', () => {
    it('should return all direct parent collections for a given name', async () => {
      const iterator = service.createParentsTopicsIterator('leaf2', false);
      await expect((await iterator.next()).value.title).toBe('collection1');
      await expect((await iterator.next()).done).toBe(true);
    });

    it('should return all recursive parent collections for a given name', async () => {
      const iterator = service.createParentsTopicsIterator('leaf3', true);
      await expect((await iterator.next()).value.title).toBe('collection2');
      await expect((await iterator.next()).value.title).toBe('collection3');
      await expect((await iterator.next()).value.title).toBe('collection1');
      await expect((await iterator.next()).done).toBe(true);
    });

    it('should return nothing for a root collection/topic', async () => {
      const iterator = service.createParentsTopicsIterator('collection1', false);
      await expect((await iterator.next()).done).toBe(true);
    });

  });

  describe('concerning filterTopicsIterator', () => {
    it('should apply the predicate properly ', async () => {
      const baseIterator = service.createChildTopicsIterator(undefined, true);
      const iterator = service.filterTopicsIterator(baseIterator, (value) => value instanceof LeafTopic);
      await expect((await iterator.next()).value.title).toBe('leaf1');
      await expect((await iterator.next()).value.title).toBe('leaf3');
      await expect((await iterator.next()).value.title).toBe('leaf2');
      await expect((await iterator.next()).done).toBe(true);
    });
  });
});


/**
 * The following declarations define prepared fake responses
 * (they are placed here to improve the readability)
 * of the XMPP server representing the following structure on the xmpp server:
 *
 * . (root)
 * ├── leaf1
 * ├── collection1
 * │   ├── leaf2
 * │   └── collection2
 * │       └── leaf3
 * └── collection3
 *     └── leaf3
 */

/**
 * responses for discovering items.
 */
const DISCO_ITEMS = {
  undefined: {
    discoItems: {
      items: [
        {
          node: 'leaf1'
        },
        {
          node: 'collection1'
        },
        {
          node: 'collection3'
        }
      ],
      rsm: {
        count: 3,
        firstIndex: 0,
        first: 'pubsub.xmppserver#leaf1',
        last: 'pubsub.xmppserver#collection3'
      }
    },
  },
  collection1: {
    discoItems: {
      items: [
        {
          node: 'leaf2'
        },
        {
          node: 'collection2'
        },
      ],
      rsm: {
        count: 2,
        firstIndex: 0,
        first: 'pubsub.xmppserver#leaf2',
        last: 'pubsub.xmppserver#collection2'
      }
    },
  },
  collection2: {
    discoItems: {
      items: [
        {
          node: 'leaf3'
        }
      ],
      rsm: {
        count: 1,
        firstIndex: 0,
        first: 'pubsub.xmppserver#leaf3',
        last: 'pubsub.xmppserver#leaf3'
      }
    },
  },
  collection3: {
    discoItems: {
      items: [
        {
          node: 'leaf3'
        }
      ],
      rsm: {
        count: 1,
        firstIndex: 0,
        first: 'pubsub.xmppserver#leaf3',
        last: 'pubsub.xmppserver#leaf3'
      }
    },
  }
};

/**
 * responses for discovery info.
 */
const DISCO_INFO = {
  leaf1: {
    discoInfo: {
      'form': {
        type: 'result',
        fields: [{name: 'pubsub#collection', value: ''}] // root collection
      },
      node: 'leaf1',
      features: [
        'http://jabber.org/protocol/pubsub',
        'http://jabber.org/protocol/disco#info'
      ],
      identities: [
        {
          category: 'pubsub',
          type: 'leaf'
        }
      ],
    },
  },
  leaf2: {
    discoInfo: {
      'form': {
        type: 'result',
        fields: [{name: 'pubsub#collection', value: 'collection1'}]
      },
      node: 'leaf2',
      features: [
        'http://jabber.org/protocol/pubsub',
        'http://jabber.org/protocol/disco#info'
      ],
      identities: [
        {
          category: 'pubsub',
          type: 'leaf'
        }
      ],
    },
  },
  leaf3: {
    discoInfo: {
      'form': {
        type: 'result',
        fields: [{name: 'pubsub#collection', value: 'collection2\ncollection3'}]
      },
      node: 'leaf3',
      features: [
        'http://jabber.org/protocol/pubsub',
        'http://jabber.org/protocol/disco#info'
      ],
      identities: [
        {
          category: 'pubsub',
          type: 'leaf'
        }
      ],
    },
  },
  collection1: {
    discoInfo: {
      'form': {
        type: 'result',
        fields: [{name: 'pubsub#collection'}] // no parent
      },
      node: 'collection1',
      features: [
        'http://jabber.org/protocol/pubsub',
        'http://jabber.org/protocol/disco#info'
      ],
      identities: [
        {
          category: 'pubsub',
          type: 'collection'
        }
      ],
    },
  },
  collection2: {
    discoInfo: {
      'form': {
        type: 'result',
        fields: [{name: 'pubsub#collection', value: 'collection1'}]
      },
      node: 'collection2',
      features: [
        'http://jabber.org/protocol/pubsub',
        'http://jabber.org/protocol/disco#info'
      ],
      identities: [
        {
          category: 'pubsub',
          type: 'collection'
        }
      ],
    },
  },
  collection3: {
    discoInfo: {
      'form': {
        type: 'result',
        fields: [{name: 'pubsub#collection'}]
      },
      node: 'collection3',
      features: [
        'http://jabber.org/protocol/pubsub',
        'http://jabber.org/protocol/disco#info'
      ],
      identities: [
        {
          category: 'pubsub',
          type: 'collection'
        }
      ],
    },
  }
};

