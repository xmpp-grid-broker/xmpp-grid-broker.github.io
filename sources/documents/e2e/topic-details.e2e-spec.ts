import {browser} from 'protractor';

import {ToastContent} from './page-elements';
import {TopicDetailsAffiliationTab, TopicDetailsConfigurationTab, TopicDetailsPage} from './page-objects';


describe('TopicDetails', () => {
  const defaultTopicId = 'topic1.1';
  let page: TopicDetailsPage;

  beforeEach(async () => {
    page = new TopicDetailsPage(defaultTopicId);
    await page.navigateTo();
  });

  it('should go to the default tab on launch', () => {
    expect(browser.getCurrentUrl()).toEqual(page.tab.fullUrl);
  });

  describe('TopicDetailsConfigurationTab', () => {
    let tab: TopicDetailsConfigurationTab;

    beforeEach(async () => {
      tab = new TopicDetailsConfigurationTab(defaultTopicId, page);
      await page.navigateToTab(tab);
    });

    it('should have the tabs url', () => {
      expect(browser.getCurrentUrl()).toEqual(page.tab.fullUrl);
    });

    it('should have a current topic id input', async () => {
      expect(await tab.form.getFieldValue('nodeID')).toBe(defaultTopicId);
    });

    it('should save a new topic title', async () => {
      const titleValue = 'julietta';
      await tab.form.setFieldValue('title', titleValue);
      await tab.formSubmit();
      await page.awaitFullyLoaded();

      const toastContents = await tab.toast.messages;
      expect(toastContents.length).toBe(1);
      expect(await toastContents[0]).toEqual(new ToastContent(
        'Form successfully updated!',
        true
      ));
      expect(await tab.form.getFieldValue('nodeID')).toEqual(defaultTopicId);
      expect(await tab.form.getFieldValue('title')).toEqual(titleValue);
    });
  });

  describe('TopicDetailsAffiliationTab', () => {
    let tab: TopicDetailsAffiliationTab;

    const testJid = 'juliet@openfire';

    beforeEach(async () => {
      tab = new TopicDetailsAffiliationTab(defaultTopicId, page);
      await page.navigateToTab(tab);
    });

    it('should list admin', async () => {
      const affiliation = await tab.firstAffiliation;
      expect(affiliation.jid).toBe('admin@openfire');
      expect(await affiliation.affiliationText).toBe('Owner');
    });

    it('should add an affiliation', async () => {
      const testAffiliation = 'Publisher';
      await tab.form.setFieldValue('jid', testJid);
      await tab.form.setFieldValue('affiliation', testAffiliation);

      await tab.formSubmit();
      await tab.awaitFullyLoaded();

      const listObjects = await tab.getListObjectsByJid(testJid);
      expect(listObjects.length).toBe(1);

      const affiliation = listObjects[0];
      expect(affiliation.jid).toBe(testJid);

      expect(await affiliation.affiliationText).toBe(testAffiliation);
    });

    it('should change affiliation', async () => {
      const testAffiliation = 'Publisher';

      // Limit scope of variables, as they are invalid after page reload.
      await (async () => {
        await tab.form.setFieldValue('jid', testJid);
        const affiliations = await tab.getListObjectsByJid(testJid);
        expect(affiliations.length).toBe(1);

        const affiliation = affiliations[0];
        expect(affiliation.jid).toBe(testJid);
        expect(await affiliation.affiliationText).toBe(testAffiliation);

        await affiliation.setAffiliation('Outcast');
      })();

      await page.navigateToTab(tab);

      await (async () => {
        const affiliations = await tab.getListObjectsByJid(testJid);
        expect(affiliations.length).toBe(1);

        const affiliation = affiliations[0];
        expect(affiliation.jid).toBe(testJid);
        expect(await affiliation.affiliationText).toBe('Outcast');
      })();
    });

    it('should remove on delete', async () => {
      // Limit scope of variables, as they are invalid after page reload.
      await (async () => {
        const affiliations = await tab.getListObjectsByJid(testJid);
        expect(affiliations.length).toBe(1);

        const affiliation = affiliations[0];
        expect(affiliation.jid).toBe(testJid);

        await affiliation.clickRemoveButton();
      })();

      await page.navigateToTab(tab);

      await (async () => {
        const listObjects = await tab.getListObjectsByJid(testJid);
        expect(listObjects.length).toBe(0);
      })();
    });
  });
});
