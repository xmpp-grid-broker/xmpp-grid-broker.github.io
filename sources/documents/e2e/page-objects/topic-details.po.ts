import {by, element, ElementFinder} from 'protractor';

import {Form, List, Tab, Toast} from '../page-elements';
import {Component, promisePresenceOf, toPromise, UrlAddressableComponent} from '../utilities';

type TopicDetailsTab = TopicDetailsConfigurationTab | TopicDetailsAffiliationTab;

export class AffiliationListElement {
  constructor(
    readonly jid: string,
    readonly affiliation: ElementFinder,
    readonly removeButton: ElementFinder
  ) {
  }

  get affiliationText(): Promise<string> {
    return toPromise(this.affiliation.element(by.css('option[selected]')).getText()
      .then((text) => text.trim()));
  }

  public clickRemoveButton(): Promise<void> {
    return toPromise(this.removeButton.click());
  }

  public setAffiliation(affiliation: 'Owner' | 'Publisher' | 'PublishOnly' | 'Member' | 'Outcast'): Promise<void> {
    return toPromise(this.affiliation
      .element(by.cssContainingText('option', affiliation))
      .click());
  }
}

export class TopicDetailsConfigurationTab extends Tab {
  constructor(readonly topicId: string, parentElement: Component) {
    super(parentElement);
  }

  get locator(): ElementFinder {
    return this.parentElement.locator.element(by.css('xgb-topic-details-config'));
  }

  get landingUrl(): string {
    return `/topics/details/${encodeURIComponent(this.topicId)}/configuration`;
  }

  get linkText(): string {
    return 'Configuration';
  }

  get form(): Form {
    return new Form(this, parent => parent.locator.element(by.css('xgb-topic-config')));
  }

  get toast(): Toast {
    return new Toast(this);
  }

  public formSubmit(): Promise<void> {
    return toPromise(this.locator.element(by.cssContainingText('button[type=submit]', 'Update'))
      .click());
  }

  public awaitFormSuccess(): Promise<void> {
    return super.awaitFullyLoaded()
      .then(() => this.toast.awaitFullyLoaded());
  }

  public awaitFullyLoaded(): Promise<void> {
    return super.awaitFullyLoaded()
      .then(() => this.form.awaitFullyLoaded())
      .then(() => this.toast.awaitFullyLoaded());
  }
}

export class TopicDetailsAffiliationTab extends Tab {
  constructor(readonly topicId: string, parentElement: Component) {
    super(parentElement);
  }

  get locator(): ElementFinder {
    return this.parentElement.locator.element(by.css('xgb-topic-affiliations'));
  }

  get landingUrl(): string {
    return `/topics/details/${encodeURIComponent(this.topicId)}/affiliations`;
  }

  get linkText(): string {
    return 'Affiliations';
  }

  get list(): List {
    return new List(this);
  }

  get listObjects(): Promise<AffiliationListElement[]> {
    const listElementObjects = toPromise(this.list.listElements.then(elements => {
      return elements.map(listElement => TopicDetailsAffiliationTab.listElementToObjectMapper(listElement));
    }));

    return listElementObjects.then(elements => {
      return Promise.all(elements);
    });
  }

  get firstAffiliation(): Promise<AffiliationListElement> {
    return this.listObjects.then(list => list[0]);
  }

  get form(): Form {
    return new Form(this, parent => parent.locator);
  }

  private static async listElementToObjectMapper(listElement: ElementFinder): Promise<AffiliationListElement> {
    const jid = await toPromise(listElement.element(by.css('.jid')).getText());
    const affiliation = listElement.element(by.css('select'));
    const removeButton = listElement.element(by.css('button'));

    return new AffiliationListElement(
      jid,
      affiliation,
      removeButton);
  }

  public getListObjectsByJid(jid: string): Promise<AffiliationListElement[]> {
    return this.listObjects
      .then(affiliations => {
        return affiliations.filter(affiliation => affiliation.jid === jid);
      });
  }

  public formSubmit(): Promise<void> {
    return toPromise(this.locator.element(by.cssContainingText('button[type=submit]', 'add'))
      .click());
  }

  public awaitFullyLoaded(): Promise<void> {
    return super.awaitFullyLoaded()
      .then(() => this.list.awaitFullyLoaded())
      .then(() => this.form.awaitFullyLoaded());
  }
}

export class TopicDetailsPage extends UrlAddressableComponent {
  constructor(readonly topicId: string) {
    super();
  }

  get landingUrl(): string {
    return `/topics/details/${encodeURIComponent(this.topicId)}`;
  }

  get locator(): ElementFinder {
    return element(by.css('xgb-topic-details'));
  }

  private _tab: TopicDetailsTab = undefined;

  get tab(): TopicDetailsTab {
    if (this._tab === undefined) {
      // create default tab on first call, as the parent element might not be rendered earlier
      this._tab = new TopicDetailsConfigurationTab(this.topicId, this);
    }
    return this._tab;
  }

  set tab(tab: TopicDetailsTab) {
    this._tab = tab;
  }

  public awaitPresence(): Promise<void> {
    return promisePresenceOf(this.locator);
  }

  public awaitFullyLoaded(): Promise<void> {
    return this.tab.awaitFullyLoaded();
  }

  public navigateToTab(tab: TopicDetailsTab): Promise<void> {
    return toPromise(tab.linkElement.click())
      .then(() => {
        this.tab = tab;
      })
      .then(() => this.tab.awaitFullyLoaded());
  }
}
