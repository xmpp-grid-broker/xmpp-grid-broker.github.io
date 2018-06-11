import {browser} from 'protractor';
import {
  TopicOverviewAllCollectionsTab,
  TopicOverviewAllTopicsTab,
  TopicOverviewRootCollectionsTab,
  TopicsOverviewPage
} from './page-objects';


describe('TopicOverview', () => {
  let page: TopicsOverviewPage;

  beforeEach(async () => {
    page = new TopicsOverviewPage();
    await page.navigateTo();
  });

  it('should go to the default tab on launch', () => {
    expect(browser.getCurrentUrl()).toEqual(page.tab.fullUrl);
  });

  it('should go to new topic on button click', async () => {
    const newPage = await page.clickNewTopic();
    expect(browser.getCurrentUrl()).toBe(newPage.fullUrl);
  });

  it('should go to new collection on button click', async () => {
    const newPage = await page.clickNewCollection();
    expect(browser.getCurrentUrl()).toBe(newPage.fullUrl);
  });

  describe('TopicOverviewRootCollectionsTab', () => {
    let tab: TopicOverviewRootCollectionsTab;

    beforeEach(async () => {
      tab = new TopicOverviewRootCollectionsTab(page);
      await page.navigateToTab(tab);
    });

    it('should have the tabs url', () => {
      expect(browser.getCurrentUrl()).toEqual(page.tab.fullUrl);
    });

    it('should list all default root collections', async () => {
      const listContent = await tab.list.listContent();

      expect(listContent.length).toBe(4);
      expect(listContent).toContain('collection1');
      expect(listContent).toContain('collection2');
      expect(listContent).toContain('topic1');
      expect(listContent).toContain('topic2');
    });
  });

  describe('TopicOverviewAllTopicsTab', () => {
    let tab: TopicOverviewAllTopicsTab;

    beforeEach(async () => {
      tab = new TopicOverviewAllTopicsTab(page);
      await page.navigateToTab(tab);
    });

    it('should have the tabs url', () => {
      expect(browser.getCurrentUrl()).toEqual(page.tab.fullUrl);
    });


    it('should list all default topics', async () => {
      const listContent = await tab.list.listContent();
      expect(listContent.length).toBe(3);
      expect(listContent).toContain('topic1');
      expect(listContent).toContain('topic1.1');
      expect(listContent).toContain('topic2');
    });
  });

  describe('TopicOverviewAllCollectionsTab', () => {
    let tab: TopicOverviewAllCollectionsTab;

    beforeEach(async () => {
      tab = new TopicOverviewAllCollectionsTab(page);
      await page.navigateToTab(tab);
    });

    it('should have the tabs url', () => {
      expect(browser.getCurrentUrl()).toEqual(page.tab.fullUrl);
    });


    it('should list all default collections', async () => {
      const listContent = await tab.list.listContent();
      expect(listContent.length).toBe(3);
      expect(listContent).toContain('collection1');
      expect(listContent).toContain('collection1.1');
      expect(listContent).toContain('collection2');
    });
  });
});
