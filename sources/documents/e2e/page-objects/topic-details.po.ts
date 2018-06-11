import {by, element, ElementFinder} from 'protractor';
import {toPromise} from '../helpers';
import {Form, List, Locatable, Spinner, Tab, Toast, UrlAddressableComponent} from '../page-elements';

type TopicDetailsTab = TopicDetailsConfigurationTab | TopicDetailsAffiliationTab;

export class AffiliationListElement {
  constructor(
    readonly jid: string,
    readonly affiliation: ElementFinder,
    readonly removeButton: ElementFinder
  ) {
  }

  get affiliationText(): Promise<string> {
    return toPromise(this.affiliation.element(by.css('option[selected]')).getText())
      .then((text) => text.trim());
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
  constructor(readonly topicId: string, parentElement: Locatable) {
    super(parentElement);
  }

  get landingUrl(): string {
    return `/topics/details/${encodeURIComponent(this.topicId)}/configuration`;
  }

  get linkText(): string {
    return 'Configuration';
  }

  get form(): Form {
    return new Form(this);
  }

  get toast(): Toast {
    return new Toast(this);
  }

  public formSubmit(): Promise<void> {
    return toPromise(this.locator.element(by.cssContainingText('button[type=submit]', 'Update'))
      .click());
  }
}

export class TopicDetailsAffiliationTab extends Tab {
  constructor(readonly topicId: string, parentElement: Locatable) {
    super(parentElement);
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
    return toPromise(
      this.list.listElements.then((elements: ElementFinder[]) => elements
        .map(listElement => TopicDetailsAffiliationTab.listElementToObjectMapper(listElement))
      )
    ).then(
      (elements: Promise<AffiliationListElement>[]) => Promise.all(elements)
    );
  }

  get firstAffiliation(): Promise<AffiliationListElement> {
    return this.listObjects.then(list => list[0]);
  }

  get form(): Form {
    return new Form(this);
  }

  private static async listElementToObjectMapper(listElement: ElementFinder): Promise<AffiliationListElement> {
    const jid = await listElement.element(by.css('.jid')).getText();
    const affiliation = await listElement.element(by.css('select'));
    const removeButton = await listElement.element(by.css('button'));

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

}

export class TopicDetailsPage extends UrlAddressableComponent implements Locatable {
  constructor(readonly topicId: string) {
    super();
  }

  get landingUrl(): string {
    return `/topics/details/${encodeURIComponent(this.topicId)}`;
  }

  get locator(): ElementFinder {
    return element(by.tagName('xgb-topic-details'));
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

  async navigateToTab(tab: TopicDetailsTab): Promise<void> {
    await tab.linkElement.click();
    return Spinner.waitOnNone()
      .then(() => Spinner.waitOnNone()) // wait for topic to be loaded
      .then(() => {
        this.tab = tab;
      });
  }
}
