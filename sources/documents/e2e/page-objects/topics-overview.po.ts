import {by, element, ElementFinder} from 'protractor';
import {List, Locatable, Spinner, Tab, UrlAddressableComponent} from '../page-elements';
import {CreateCollectionPage} from './create-collection.po';
import {CreateTopicPage} from './create-topic.po';

type TopicsOverviewTab = TopicOverviewRootCollectionsTab | TopicOverviewAllTopicsTab | TopicOverviewAllCollectionsTab;

export class TopicOverviewRootCollectionsTab extends Tab {
  constructor(parentElement: Locatable) {
    super(parentElement);
  }

  get list(): List {
    return new List(this);
  }

  get landingUrl(): string {
    return '/topics/root';
  }

  get linkText(): string {
    return 'Root Topics';
  }

  get breadCrumbText(): string {
    return 'Root Topics';
  }

}

export class TopicOverviewAllTopicsTab extends Tab {
  constructor(parentElement: Locatable) {
    super(parentElement);
  }

  get list(): List {
    return new List(this);
  }

  get landingUrl(): string {
    return '/topics/all';
  }

  get linkText(): string {
    return 'All Topics';
  }
}

export class TopicOverviewAllCollectionsTab extends Tab {
  constructor(parentElement: Locatable) {
    super(parentElement);
  }

  get list(): List {
    return new List(this);
  }

  get landingUrl(): string {
    return '/topics/collections';
  }

  get linkText(): string {
    return 'All Collections';
  }
}

export class TopicsOverviewPage extends UrlAddressableComponent implements Locatable {
  get landingUrl(): string {
    return '/topics';
  }

  get locator(): ElementFinder {
    return element(by.tagName('xgb-topic-overview'));
  }

  private _tab: TopicsOverviewTab = undefined;

  get tab(): TopicsOverviewTab {
    if (this._tab === undefined) {
      // create default tab on first call, as the parent element might not be rendered earlier
      this._tab = new TopicOverviewRootCollectionsTab(this);
    }
    return this._tab;
  }

  set tab(tab: TopicsOverviewTab) {
    this._tab = tab;
  }

  private get newTopicButton(): ElementFinder {
    return element(by.cssContainingText('button', 'New Topic'));
  }

  private get newCollectionButton(): ElementFinder {
    return element(by.cssContainingText('button', 'New Collection'));
  }

  async navigateToTab(tab: TopicsOverviewTab): Promise<void> {
    await tab.linkElement.click();
    return Spinner.waitOnNone().then(() => {
      this.tab = tab;
    });
  }

  async clickNewTopic(): Promise<CreateTopicPage> {
    await this.newTopicButton.click();
    await Spinner.waitOnNone();

    return new CreateTopicPage();
  }

  async clickNewCollection(): Promise<CreateCollectionPage> {
    await this.newCollectionButton.click();
    await Spinner.waitOnNone();

    return new CreateCollectionPage();
  }

}
