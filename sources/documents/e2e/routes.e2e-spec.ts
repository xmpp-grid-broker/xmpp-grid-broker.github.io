import {browser} from 'protractor';

import {AppPage, TopicOverviewRootCollectionsTab, TopicsOverviewPage} from './page-objects';


describe('Routes', () => {
  let appPage: AppPage;

  beforeEach(async () => {
    appPage = new AppPage();
    await appPage.navigateTo();
  });

  it('root should redirect to topics overview', () => {
    const destination = new TopicOverviewRootCollectionsTab(appPage);
    expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + destination.landingUrl);
  });

  it('should list breadcrumbs', async () => {
    const destinationPage = new TopicsOverviewPage();
    const destinationTab = new TopicOverviewRootCollectionsTab(destinationPage);
    const breadCrumbs = await appPage.breadCrumbs.crumbContent();

    expect(breadCrumbs.pop()).toBe(destinationTab.breadCrumbText);
    expect(breadCrumbs.pop()).toBe('openfire');
  });
});
