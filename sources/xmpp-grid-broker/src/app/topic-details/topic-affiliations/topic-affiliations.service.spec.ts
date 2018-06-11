import {JID} from 'xmpp-jid';

import {Affiliation, JidAffiliation, XmppIqType, XmppService} from '../../core';
import {TopicAffiliationsService} from './topic-affiliations.service';


describe(TopicAffiliationsService.name, () => {

  let service: TopicAffiliationsService;
  let xmppService: jasmine.SpyObj<XmppService>;
  beforeEach(() => {
    xmppService = jasmine.createSpyObj('XmppService', ['getClient', 'executeIqToPubsub']);
    service = new TopicAffiliationsService(xmppService);
  });

  it('should be created', () => {
      expect(service).toBeTruthy();
    }
  );

  describe('concerning loading affiliations', () => {

    beforeEach(() => {
      xmppService.executeIqToPubsub
        .and.returnValue(Promise.resolve({
        'pubsubOwner': {
          'affiliations': {
            list: [
              {type: Affiliation.Owner, jid: new JID('hamlet@denmark.lit')},
              {type: Affiliation.Publisher, jid: new JID('bard@shakespeare.lit')}
            ]
          }
        }
      }));
    });

    it('should execute an iq to load the affiliations', (done) => {
      service.loadJidAffiliations('testing').then(() => {
        expect(xmppService.executeIqToPubsub).toHaveBeenCalledTimes(1);
        const cmd = xmppService.executeIqToPubsub.calls.mostRecent().args[0];
        expect(cmd.type).toBe(XmppIqType.Get);
        expect(cmd.pubsubOwner.affiliations.node).toBe('testing');
        done();
      });
    });

    it('should return a list of JIDAffiliations', (done) => {
      service.loadJidAffiliations('testing').then((result) => {
        expect(result.length).toBe(2);
        expect(result[0].affiliation).toBe(Affiliation.Owner);
        expect(result[0].jid).toBe('hamlet@denmark.lit');
        expect(result[1].affiliation).toBe(Affiliation.Publisher);
        expect(result[1].jid).toBe('bard@shakespeare.lit');
        done();
      });
    });
  });
  describe('concerning loading affiliations', () => {
    beforeEach(() => {
      xmppService.executeIqToPubsub.and.returnValue(Promise.resolve({}));
    });
    it('should resolve when successful', (done) => {
      service.modifyJidAffiliation(
        'testing',
        new JidAffiliation('bard@shakespeare.lit', Affiliation.Publisher)
      ).then(() => {
        done();
      });
    });

    it('should execute an iq to update the given affiliation', (done) => {
      service.modifyJidAffiliation(
        'testing',
        new JidAffiliation('bard@shakespeare.lit', Affiliation.Publisher)
      ).then(() => {
        expect(xmppService.executeIqToPubsub).toHaveBeenCalledTimes(1);
        const cmd = xmppService.executeIqToPubsub.calls.mostRecent().args[0];
        expect(cmd.type).toBe(XmppIqType.Set);
        expect(cmd.pubsubOwner.affiliations.node).toBe('testing');
        expect(cmd.pubsubOwner.affiliations.affiliation.type).toBe(Affiliation.Publisher);
        expect(cmd.pubsubOwner.affiliations.affiliation.jid).toBe('bard@shakespeare.lit');
        done();
      });
    });
  });
});
