import {PersistedItem, XmppErrorCondition, XmppIqType, XmppService} from '../../core';
import {PersistedItemsService} from './persisted-items.service';

describe(PersistedItemsService.name, () => {
  let service: PersistedItemsService;

  let xmppService: jasmine.SpyObj<XmppService>;

  beforeEach(() => {
    xmppService = jasmine.createSpyObj('XmppService', ['executeIqToPubsub']);
    service = new PersistedItemsService(xmppService);

  });

  describe('when calling loadPersistedItemContent', () => {
    it('should call retrieve command on the service', async () => {
      xmppService.executeIqToPubsub.and.returnValue(Promise.resolve({
        pubsub: {
          retrieve: {
            item: {
              rawXML: '<foo><baa></baa></foo>'
            }
          }
        }
      }));

      const testItem = new PersistedItem('001');

      const returnedItem: PersistedItem = await service.loadPersistedItemContent(
        'test-topic',
        testItem);

      // Verify stanza object
      expect(xmppService.executeIqToPubsub).toHaveBeenCalledTimes(1);
      const args = xmppService.executeIqToPubsub.calls.mostRecent().args;
      expect(args[0].type).toBe(XmppIqType.Get);
      expect(args[0].pubsub.retrieve.node).toBe('test-topic');
      expect(args[0].pubsub.retrieve.item.id).toBe('001');

      // Ensure the element is updated in-place
      expect(testItem.rawXML).toBe('<foo><baa></baa></foo>');
      await expect(returnedItem).toBe(testItem);
    });

    it('should reject when executeIqToPubsub fails', async () => {
      xmppService.executeIqToPubsub.and.returnValue(Promise.reject(
        {condition: 'example-error'}
      ));

      try {
        const result = await service.loadPersistedItemContent('test-topic', new PersistedItem('001'));
        fail(`expected an error but got: ${result}`);
      } catch (e) {
        expect(e.message).toBe('An unknown error has occurred: {"condition":"example-error"}');
      }
    });
  });

  describe('when calling persistedItems', () => {

    /**
     * Helper method to generate jxt-xmpp disco responses...
     */
    const createDiscoItemsResponse = (allItems: { name: string }[], firstIdx: number, lastIdx: number) => {
      const subsetToReturn = allItems.slice(firstIdx, lastIdx);
      return Promise.resolve({
        discoItems: {
          items: subsetToReturn,
          rsm: {
            last: subsetToReturn.length === 0 ? undefined : `${subsetToReturn[subsetToReturn.length - 1].name}`,
            firstIndex: `${firstIdx}`,
            count: `${allItems.length}`
          }
        }
      });
    };

    it('should yield no results when service discovery response is empty', async () => {
      xmppService.executeIqToPubsub.and.returnValue(createDiscoItemsResponse([], 0, 0));

      const iterator = service.persistedItems('test-topic');

      expect((await iterator.next()).done).toBeTruthy();
    });

    it('should yield each item loaded using service discovery', async () => {
      xmppService.executeIqToPubsub.and.returnValue(createDiscoItemsResponse([
        {name: '001'},
        {name: '002'},
        {name: '003'},
        {name: '004'}
      ], 0, 4));


      const iterator = service.persistedItems('test-topic');

      expect((await iterator.next()).value.id).toBe('001');
      expect((await iterator.next()).value.id).toBe('002');
      expect((await iterator.next()).value.id).toBe('003');
      expect((await iterator.next()).value.id).toBe('004');
      expect((await iterator.next()).done).toBeTruthy();
    });

    it('should fetch all items using paging (rsm)', async () => {

      // Generate 125 fake results
      const items = [];
      for (let i = 1; i <= 125; i++) {
        items.push({name: `item ${i}`});
      }

      // setup the executeIqToPubsub to return them in tranches of 10
      xmppService.executeIqToPubsub.and.returnValues(
        createDiscoItemsResponse(items, 0, 50),
        createDiscoItemsResponse(items, 50, 100),
        createDiscoItemsResponse(items, 100, 125)
      );

      // Verify that the service yields them all in a sequence
      const iterator = service.persistedItems('test-topic');
      for (let i = 1; i <= 125; i++) {
        expect((await iterator.next()).value.id).toBe(`item ${i}`);
      }
      expect((await iterator.next()).done).toBeTruthy();

      // verify calls rsm calls are correct
      expect(xmppService.executeIqToPubsub).toHaveBeenCalledTimes(3);
      let args = xmppService.executeIqToPubsub.calls.argsFor(0);
      await expect(args[0].discoItems.rsm.max).toBe(50);
      await expect(args[0].discoItems.rsm.after).toBe(undefined);
      args = xmppService.executeIqToPubsub.calls.argsFor(1);
      await expect(args[0].discoItems.rsm.max).toBe(50);
      await expect(args[0].discoItems.rsm.after).toBe('item 50');
      args = xmppService.executeIqToPubsub.calls.argsFor(2);
      await expect(args[0].discoItems.rsm.max).toBe(50);
      await expect(args[0].discoItems.rsm.after).toBe('item 100');
    });
  });
  describe('when calling loadPersistedItemContent', () => {

    it('it should call the xmpp service', async () => {
      xmppService.executeIqToPubsub.and.returnValue(Promise.resolve({}));

      await service.deletePersistedItem('test-topic', new PersistedItem('001'));

      expect(xmppService.executeIqToPubsub).toHaveBeenCalledTimes(1);
      const cmd = xmppService.executeIqToPubsub.calls.mostRecent().args[0];
      expect(cmd.pubsub.retract.node).toBe('test-topic');
      expect(cmd.pubsub.retract.id).toBe('001');
    });

    it('should reject when executeIqToPubsub fails', async () => {
      xmppService.executeIqToPubsub.and.returnValue(Promise.reject(
        {condition: 'example-error'}
      ));

      try {
        await service.deletePersistedItem('test-topic', new PersistedItem('001'));
        fail(`expected an error`);
      } catch (e) {
        expect(e.message).toBe('An unknown error has occurred: {"condition":"example-error"}');
      }
    });
  });

  describe('when calling purgePersistedItem', () => {
    it('it should call the xmpp service', async () => {
      xmppService.executeIqToPubsub.and.returnValue(Promise.resolve({}));

      await service.purgePersistedItem('test-topic');

      expect(xmppService.executeIqToPubsub).toHaveBeenCalledTimes(1);
      const cmd = xmppService.executeIqToPubsub.calls.mostRecent().args[0];
      expect(cmd.pubsubOwner.purge).toBe('test-topic');
    });

    it('should reject when executeIqToPubsub fails', async () => {
      xmppService.executeIqToPubsub.and.returnValue(Promise.reject(
        {condition: XmppErrorCondition.NotAcceptable}
      ));

      try {
        await service.purgePersistedItem('test-topic');
        fail(`expected an error`);
      } catch (e) {
        expect(e.message).toBe('An unknown error has occurred: {"condition":"not-acceptable"}');
      }
    });
  });

  describe('when calling publishItem', () => {
    it('it should call the xmpp service', async () => {
      xmppService.executeIqToPubsub.and.returnValue(Promise.resolve({}));

      await service.publishItem('test-topic', '<xml/>');

      expect(xmppService.executeIqToPubsub).toHaveBeenCalledTimes(1);
      const cmd = xmppService.executeIqToPubsub.calls.mostRecent().args[0];
      expect(cmd.pubsub.publish.node).toBe('test-topic');
      expect(cmd.pubsub.publish.item.rawXML).toBe('<xml/>');
    });

    it('should reject when executeIqToPubsub fails', async () => {
      xmppService.executeIqToPubsub.and.returnValue(Promise.reject(
        {condition: 'example-error'}
      ));

      try {
        await service.publishItem('test-topic', '<xml/>');
        fail(`expected an error`);
      } catch (e) {
        expect(e.message).toBe('An unknown error has occurred: {"condition":"example-error"}');
      }
    });
  });
});
