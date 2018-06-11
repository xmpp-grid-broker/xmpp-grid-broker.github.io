import {ErrorLogService} from '../errors/';
import {XmppService} from '../xmpp/';
import {FeatureService} from './feature.service';


describe(FeatureService.name, () => {
  let service: FeatureService;
  let errorLogService: jasmine.SpyObj<ErrorLogService>;

  const PUBSUB_IQ_DISCOVERY_RESULT = {
    discoInfo: {
      features: FeatureService.REQUIRED_PUBSUB_FEATURES
        .map(feature => `http://jabber.org/protocol/pubsub#${feature}`)
    }
  };
  PUBSUB_IQ_DISCOVERY_RESULT.discoInfo.features.push('http://jabber.org/protocol/pubsub');

  let xmppService: jasmine.SpyObj<XmppService>;

  beforeEach(() => {
    xmppService = jasmine.createSpyObj(XmppService.name, ['executeIqToPubsub', 'getServerTitle']);
    xmppService.getServerTitle.and.returnValue('openfire');
    errorLogService = jasmine.createSpyObj(ErrorLogService.name, ['warn']);
    service = new FeatureService(xmppService, errorLogService);
  });

  it('should detect a supported feature', done => {
    xmppService.executeIqToPubsub.and.returnValue(Promise.resolve(PUBSUB_IQ_DISCOVERY_RESULT));
    service.checkFeature('pubsub', 'subscribe').then(result => {
      expect(xmppService.executeIqToPubsub).toHaveBeenCalled();
      expect(result).toBe(true);
      done();
    });
  });

  it('should detect a supported protocol', done => {
    xmppService.executeIqToPubsub.and.returnValue(Promise.resolve(PUBSUB_IQ_DISCOVERY_RESULT));
    service.checkFeature('pubsub').then(result => {
      expect(xmppService.executeIqToPubsub).toHaveBeenCalled();
      expect(result).toBe(true);
      done();
    });
  });

  it('should detect an unsupported feature', done => {
    xmppService.executeIqToPubsub.and.returnValue(Promise.resolve(PUBSUB_IQ_DISCOVERY_RESULT));
    const protocol = 'pubsub';
    const feature = 'do-magic';
    service.checkFeature(protocol, feature).then(result => {
      expect(xmppService.executeIqToPubsub).toHaveBeenCalled();
      expect(result).toBe(false);
      expect(errorLogService.warn).toHaveBeenCalledWith(`XMPP feature ${feature} of protocol ${protocol} is not supported.`);
      done();
    });
  });

  it('should detect if one of multiple features is unsupported', done => {
    xmppService.executeIqToPubsub.and.returnValue(Promise.resolve(PUBSUB_IQ_DISCOVERY_RESULT));
    const protocol = 'pubsub';
    const feature = 'do-magic';
    service.checkFeatures(protocol, [feature, 'subscribe']).then(result => {
      expect(xmppService.executeIqToPubsub).toHaveBeenCalled();
      expect(result.length).toBe(1);
      expect(result).toContain('do-magic(pubsub)');
      expect(errorLogService.warn).toHaveBeenCalledWith(`XMPP feature ${feature} of protocol ${protocol} is not supported.`);
      done();
    });
  });

  it('should detect if all of multiple features are supported', done => {
    xmppService.executeIqToPubsub.and.returnValue(Promise.resolve(PUBSUB_IQ_DISCOVERY_RESULT));
    service.checkFeatures('pubsub', ['collections', 'subscribe']).then(result => {
      expect(xmppService.executeIqToPubsub).toHaveBeenCalled();
      expect(result.length).toBe(0);
      done();
    });
  });

  it('should check if all required features are supported', done => {
    const discovery_result = PUBSUB_IQ_DISCOVERY_RESULT;
    discovery_result.discoInfo.features = discovery_result.discoInfo.features
      .filter(feature => !feature.endsWith('collections'));

    xmppService.executeIqToPubsub.and.returnValue(Promise.resolve(discovery_result));
    service.getMissingRequiredFeatures().then(result => {
      expect(xmppService.executeIqToPubsub).toHaveBeenCalled();
      expect(result.length).toBe(1);
      expect(result).toContain('collections(pubsub)');

      done();
    });
  });
});
