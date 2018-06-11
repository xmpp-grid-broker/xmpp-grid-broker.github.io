import {TopicDetailsConfigurationService} from '..';
import {XmppDataForm, XmppDataFormField, XmppDataFormFieldType, XmppErrorCondition, XmppIqType, XmppService} from '../../core';


describe(TopicDetailsConfigurationService.name, () => {

  let service: TopicDetailsConfigurationService;
  let xmppService: jasmine.SpyObj<XmppService>;
  beforeEach(() => {
    xmppService = jasmine.createSpyObj('XmppService', ['executeIqToPubsub']);
    service = new TopicDetailsConfigurationService(xmppService);
  });

  it('should be created', () => {
      expect(service).toBeTruthy();
    }
  );

  describe('concerning the topic configuration', () => {
    beforeEach(() => {
      xmppService.executeIqToPubsub.and.returnValue(Promise.resolve({'pubsubOwner': {'config': {'form': {fields: []}}}}));
    });

    it('should execute an iq to fetch the form', (done) => {
      service.loadConfigurationForm('testing').then(() => {
        expect(xmppService.executeIqToPubsub).toHaveBeenCalled();
        const cmd = xmppService.executeIqToPubsub.calls.mostRecent().args[0];
        expect(cmd.type).toBe('get');
        expect(cmd.pubsubOwner.config.node).toBe('testing');
        done();
      });
    });

    it('should reject the promise if sendIq fails', (done) => {
      xmppService.executeIqToPubsub.and.returnValue(
        Promise.reject({condition: XmppErrorCondition.Forbidden})
      );
      service.loadConfigurationForm('testing')
        .then(() => {
          fail('Expected an error instead of a successful result!');
        })
        .catch((error) => {
          expect(error.condition).toBe(XmppErrorCondition.Forbidden);
          done();
        });
    });


    it('should execute an 2 iqs to submit the form', (done) => {
      const form = new XmppDataForm([
        new XmppDataFormField(
          XmppDataFormFieldType.hidden,
          'FORM_TYPE',
          '...'
        ),
        new XmppDataFormField(
          XmppDataFormFieldType.boolean,
          'example1',
          true
        ),
      ]);

      service.updateTopicConfiguration('testing', form).then(() => {
        expect(xmppService.executeIqToPubsub).toHaveBeenCalledTimes(2);

        const cmd = xmppService.executeIqToPubsub.calls.first().args[0];
        const fields = cmd.pubsubOwner.config.form.fields;
        expect(cmd.type).toBe('set');
        expect(cmd.pubsubOwner.config.node).toBe('testing');
        expect(fields.length).toBe(2);
        expect(fields[0].name).toBe('FORM_TYPE');
        expect(fields[1].name).toBe('example1');

        done();

      });
    });
  });

  describe('concerning the deletion of a topic', () => {
    beforeEach(() => {
      xmppService.executeIqToPubsub.and.returnValue(Promise.resolve({}));
    });
    it('should resolve when successful', (done) => {
      service.deleteTopic(
        'testing'
      ).then(() => {
        done();
      });
    });

    it('should execute an iq to delete the topic', (done) => {
      service.deleteTopic(
        'testing'
      ).then(() => {
        expect(xmppService.executeIqToPubsub).toHaveBeenCalledTimes(1);
        const cmd = xmppService.executeIqToPubsub.calls.mostRecent().args[0];
        expect(cmd.type).toBe(XmppIqType.Set);
        expect(cmd.pubsubOwner.del).toBe('testing');
        done();
      });
    });
  });

});
