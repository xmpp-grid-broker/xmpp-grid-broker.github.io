import {XmppIqType, XmppService} from '../../core/xmpp/';
import {TopicCreationService} from '../';


describe(TopicCreationService.name, () => {

  let service: TopicCreationService;
  let xmppService: jasmine.SpyObj<XmppService>;
  beforeEach(() => {
    xmppService = jasmine.createSpyObj(XmppService.name, [
      'executeIqToPubsub'
    ]);
    service = new TopicCreationService(xmppService);
  });

  it('should be created', () => {
      expect(service).toBeTruthy();
    }
  );

  describe('when creating a new topic', () => {

    it('should call `xmppService` on the service', async () => {
      xmppService.executeIqToPubsub.and.returnValue(Promise.resolve({}));
      const topicTitle = await service.createTopic('testing', null);
      await expect(topicTitle).toBe('testing');

      await expect(xmppService.executeIqToPubsub).toHaveBeenCalledTimes(1);
      const cmd = xmppService.executeIqToPubsub.calls.mostRecent().args[0];
      await expect(cmd.type).toBe(XmppIqType.Set);
      await expect(cmd.pubsub.create).toBe('testing');
    });

    it('should set `create` to `true` if no topic identifier is provided', async () => {
      xmppService.executeIqToPubsub.and.returnValue(Promise.resolve({pubsub: {create: 'generatedNodeID'}}));
      await service.createTopic(null, null);

      const cmd = xmppService.executeIqToPubsub.calls.mostRecent().args[0];
      await expect(cmd.type).toBe(XmppIqType.Set);
      await expect(cmd.pubsub.create).toBe(true);

    });

    it('should return an error object if it fails', (done) => {

      xmppService.executeIqToPubsub.and.callFake(() => Promise.reject({condition: 'conflict'}));

      service.createTopic(null, null)
        .then(() => {
          fail('Expected an error instead of a successful result!');
        })
        .catch((error) => {
          expect(error.message).toBe('Node true does already exists');
          done();
        });
    });
  });

  describe('when loading the default configuration', () => {
    it('should execute an IQ on the client', async () => {
      xmppService.executeIqToPubsub.and.returnValue(Promise.resolve({pubsubOwner: {default: {form: {fields: []}}}}));
      await service.loadDefaultConfig();
      expect(xmppService.executeIqToPubsub).toHaveBeenCalledTimes(1);
      const cmd = xmppService.executeIqToPubsub.calls.mostRecent().args[0];

      expect(cmd.type).toBe(XmppIqType.Get);
      expect(cmd.pubsubOwner.default).toBe(true);
    });

    it('should reject the promise when sendIq fails', (done) => {
      xmppService.executeIqToPubsub.and.callFake(() => Promise.reject({condition: 'feature-not-implemented'}));

      service.loadDefaultConfig()
        .then(() => {
          fail('Expected an error instead of a successful result!');
        })
        .catch((error) => {
          expect(error.message).toBe('Service does not support node creation or loading the default node configuration');
          done();
        });
    });
  });
});
