import {Observable} from 'rxjs/Observable';

import {Config, ConfigService, XmppConfig, XmppTransport} from '../';
import {XmppService} from '../../xmpp';


class FakeHttpClient {
  constructor(public fake_url: string, public fake_result: any = {}) {
  }

  get(url: string): Observable<any> {
    if (url === this.fake_url) {
      return Observable.of({});
    } else {
      return new Observable(({next, error}) => {
        return error({message: 'not found', status: 404, statusText: 'not found'});
      });
    }
  }
}

describe(ConfigService.name, () => {
  let httpClient, service: ConfigService;

  let xmppService: jasmine.SpyObj<XmppService>;
  beforeEach(() => {
    xmppService = jasmine.createSpyObj('XmppService', ['initialize']);
  });

  const JSON_CONFIG = {
    xmpp: {
      server: 'openfire',
      transport: 'bosh',
      boshURL: 'localhost',
      useStreamManagement: false
    }
  };

  const REFERENCE_CONFIG = new Config(new XmppConfig(
    'openfire',
    XmppTransport.Bosh,
    undefined,
    'localhost',
    false
  ), 10);

  it('should request the configuration file', done => {
    httpClient = new FakeHttpClient('./configuration.json');
    spyOn(httpClient, 'get').and.callFake(() => Observable.of(JSON_CONFIG));
    service = new ConfigService(httpClient, xmppService);

    service.loadConfig().then(() => {
      expect(httpClient.get).toHaveBeenCalledWith(httpClient.fake_url);
      done();
    }).catch(err => fail(err));
  });

  it('should call initialize on the xmpp service', done => {
    httpClient = new FakeHttpClient('./configuration.json');
    spyOn(httpClient, 'get').and.callFake(() => Observable.of(JSON_CONFIG));
    service = new ConfigService(httpClient, xmppService);

    service.loadConfig().then(config => {
      expect(xmppService.initialize).toHaveBeenCalledWith(config);
      done();
    }).catch(err => fail(err));
  });

  it('get client should return the config when loaded', done => {
    httpClient = new FakeHttpClient('./configuration.json');
    spyOn(httpClient, 'get').and.callFake(() => Observable.of(JSON_CONFIG));
    service = new ConfigService(httpClient, xmppService);

    expect(service.getConfig()).toBe(undefined);
    service.loadConfig().then(() => {
      expect(service.getConfig()).toBeDefined();
      done();
    }).catch(err => fail(err));
  });


  it('should parse the configuration json correctly', done => {
    httpClient = new FakeHttpClient('./configuration.json');
    spyOn(httpClient, 'get').and.callFake(() => Observable.of(JSON_CONFIG));
    service = new ConfigService(httpClient, xmppService);

    service.loadConfig().then((config: Config) => {
      const required = ['transport', 'boshUrl', 'useStreamManagement'];
      for (const name of required) {
        expect(config.xmpp[name]).toBe(REFERENCE_CONFIG.xmpp[name]);
      }

      expect(config.xmpp.server).toBe(REFERENCE_CONFIG.xmpp.server);
      expect(config.xmpp.sasl[0]).toBe(REFERENCE_CONFIG.xmpp.sasl[0]);
      done();
    }).catch(err => fail(err));
  });

  it('should throw error if configuration file does not exist', (done) => {
    httpClient = new FakeHttpClient('./bla.json');

    // Catch asynchronously thrown error from ConfigService.constructor
    const initialisation = async () => {
      service = new ConfigService(httpClient, xmppService);
      await service.loadConfig();
    };

    initialisation().then(() => fail('No error thrown!'), () => done());
  });

  it('should throw error if configuration file is invalid', (done) => {
    httpClient = new FakeHttpClient('./configuration.json');
    spyOn(httpClient, 'get').and.callFake(() => Observable.of({}));

    // Catch asynchronously thrown error from ConfigService.constructor
    const initialisation = async () => {
      service = new ConfigService(httpClient, xmppService);
      return await service.loadConfig();
    };

    initialisation().then(() => fail('No error thrown!'), () => done());
  });

  it('should throw error if configuration file is incomplete', (done) => {
    httpClient = new FakeHttpClient('./configuration.json');
    const incomplete_json_config = JSON_CONFIG;
    incomplete_json_config.xmpp.boshURL = undefined;

    spyOn(httpClient, 'get').and.callFake(() => Observable.of(incomplete_json_config));

    // Catch asynchronously thrown error from ConfigService.constructor
    const initialisation = async () => {
      service = new ConfigService(httpClient, xmppService);
      return await service.loadConfig();
    };

    initialisation()
      .then(() => fail('No error thrown!'), () => done());
  });
});

