import {CurrentTopicDetailService} from '.';
import {XmppIqType, XmppService} from '../core';

describe(CurrentTopicDetailService.name, () => {

  let service: CurrentTopicDetailService;
  let xmppService: jasmine.SpyObj<XmppService>;

  beforeEach(() => {
    xmppService = jasmine.createSpyObj('XmppService', ['executeIqToPubsub']);
    xmppService.executeIqToPubsub.and.returnValue(Promise.resolve({
      discoInfo: {
        node: 'example',
        identities: [{'type': 'leaf'}]
      }
    }));

    service = new CurrentTopicDetailService(xmppService);
  });

  it('should call xmpp service when calling loadTopic', async () => {
    const result = await service.loadTopic('example');

    expect(result.title).toBe('example');
    expect(xmppService.executeIqToPubsub).toHaveBeenCalledTimes(1);
    const cmd = xmppService.executeIqToPubsub.calls.mostRecent().args[0];
    expect(cmd.type).toBe(XmppIqType.Get);
    expect(cmd.discoInfo.node).toBe('example');
  });

  it('should return undefined for currentTopic when not loaded', () => {
    expect(service.currentTopic()).toBeUndefined();
  });

  it('should return undefined for currentTopic when not loaded', async () => {
    await service.loadTopic('example');
    expect(service.currentTopic().title).toBe('example');
  });
});
