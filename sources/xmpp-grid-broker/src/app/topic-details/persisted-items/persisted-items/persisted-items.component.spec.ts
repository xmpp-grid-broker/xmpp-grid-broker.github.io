import {DebugElement} from '@angular/core';
import {async, ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {RouterTestingModule} from '@angular/router/testing';

import {CurrentTopicDetailService, PersistedItemsComponent, PersistedItemsService} from '../..';
import {Config, ConfigService, LeafTopic, NotificationService, PersistedItem, XmppError, XmppErrorCondition} from '../../../core';
import {SharedModule} from '../../../shared/shared.module';

describe(PersistedItemsComponent.name, () => {
  let component: PersistedItemsComponent;
  let fixture: ComponentFixture<PersistedItemsComponent>;
  let persistedItemsService: jasmine.SpyObj<PersistedItemsService>;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let de: DebugElement;

  beforeEach(async(() => {
    persistedItemsService = jasmine.createSpyObj('PersistedItemsService', [
      'persistedItems',
      'loadPersistedItemContent',
      'deletePersistedItem',
      'purgePersistedItem']);
    notificationService = jasmine.createSpyObj('NotificationService', ['confirm']);
    const currentTopicDetailService = jasmine.createSpyObj('CurrentTopicDetailService', ['currentTopic']);
    currentTopicDetailService.currentTopic.and.returnValue(new LeafTopic('testing'));

    const configService = jasmine.createSpyObj(ConfigService.name, ['getConfig']);
    configService.getConfig.and.returnValue(new Config(undefined, 10));

    TestBed.configureTestingModule({
      declarations: [PersistedItemsComponent],
      imports: [RouterTestingModule, SharedModule],
      providers: [
        {provide: CurrentTopicDetailService, useValue: currentTopicDetailService},
        {provide: PersistedItemsService, useValue: persistedItemsService},
        {provide: NotificationService, useValue: notificationService},
        {provide: ConfigService, useValue: configService},
      ]
    });
  }));

  beforeEach(fakeAsync(() => {
    fixture = TestBed.createComponent(PersistedItemsComponent);
    component = fixture.componentInstance;
    de = fixture.debugElement;
  }));

  it('should call persistedItems on init', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    expect(persistedItemsService.persistedItems).toHaveBeenCalledTimes(1);
    expect(persistedItemsService.persistedItems).toHaveBeenCalledWith('testing');
  }));

  it('should render spinner while loading', fakeAsync(() => {
    // return empty data from server
    persistedItemsService.persistedItems.and.callFake(function* () {
    });

    // on init
    fixture.detectChanges();
    tick();

    // Spinner should be visible
    expect(de.query(By.css('xgb-spinner')).nativeElement).toBeDefined();

    fixture.detectChanges();
    tick();

    // Spinner should be gone
    expect(de.queryAll(By.css('xgb-spinner')).length).toBe(0);
  }));

  it('should render list state when no elements are returned', fakeAsync(() => {
    // return empty data from server
    persistedItemsService.persistedItems.and.callFake(function* () {
    });

    // on init
    fixture.detectChanges();
    tick();

    // Loading complete
    fixture.detectChanges();
    tick();

    // check Empty state
    expect(de.query(By.css('.empty-title')).nativeElement.innerHTML).toBe('No Persisted Items found');
    // No items shall be rendered
    expect(de.queryAll(By.css('xgb-list-item')).length).toBe(0);
    // Purge persisted items button is not visible
    expect(de.queryAll(By.css('button[danger]')).length).toBe(0);
  }));


  it('should render an error when an error occurs while loading', fakeAsync(() => {
    // return error from server
    persistedItemsService.persistedItems.and.callFake(function* () {
      throw new XmppError('Error Message', XmppErrorCondition.NotAcceptable);
    });

    // on init
    fixture.detectChanges();
    tick();

    // Loading complete
    fixture.detectChanges();
    tick();

    expect(de.query(By.css('[toast-error]')).nativeElement.innerHTML).toBe('Error Message');
  }));

  it('should render purge all button when some items are loaded', fakeAsync(() => {
    // return some persisted items
    persistedItemsService.persistedItems.and.callFake(function* () {
      yield new PersistedItem('001');
      yield new PersistedItem('002');
      yield new PersistedItem('003');
    });

    // on init
    fixture.detectChanges();
    tick();

    // while loading, the button is not yet visible
    expect(de.queryAll(By.css('button[danger]')).length).toBe(0);

    // Loading complete
    fixture.detectChanges();
    tick();

    expect(de.query(By.css('button[danger]')).nativeElement).toBeDefined();
  }));


  it('should render a list of persisted items with remove buttons', fakeAsync(() => {
    // return some persisted items
    persistedItemsService.persistedItems.and.callFake(function* () {
      yield new PersistedItem('001');
      yield new PersistedItem('002');
      yield new PersistedItem('003');
    });

    // on init
    fixture.detectChanges();
    tick();

    // while loading, the list is empty
    expect(de.queryAll(By.css('xgb-list-item')).length).toBe(0);

    // Loading complete
    fixture.detectChanges();
    tick();

    // List of 3 elements
    expect(de.queryAll(By.css('xgb-list-item')).length).toBe(3);
    const titleElements = de.queryAll(By.css('xgb-list-item .item-title'));
    expect(titleElements[0].nativeElement.innerHTML).toBe('001');
    expect(titleElements[1].nativeElement.innerHTML).toBe('002');
    expect(titleElements[2].nativeElement.innerHTML).toBe('003');
    const removeButtons = de.queryAll(By.css('xgb-list-item [xgbActionButton]'));
    expect(removeButtons.length).toBe(3);
    removeButtons.forEach(btn => {
      expect(btn.nativeElement.innerHTML).toBe('remove');
    });
  }));


  it('should lazy load item content when title is clicked', fakeAsync(() => {
    // return some persisted items
    persistedItemsService.persistedItems.and.callFake(function* () {
      yield new PersistedItem('001');
      yield new PersistedItem('002');
      yield new PersistedItem('003');
    });
    persistedItemsService.loadPersistedItemContent.and.callFake((node: string, item: PersistedItem) => {
      return Promise.resolve().then(() => {
        item.rawXML = `<example-xml>${item.id}</example-xml>`;
      });
    });

    // on init
    fixture.detectChanges();
    tick();

    // Loading complete
    fixture.detectChanges();
    tick();

    // Click on the second header element
    const secondElementTitle = de.queryAll(By.css('xgb-list-item .item-title'))[1];
    secondElementTitle.nativeElement.click();
    fixture.detectChanges();
    tick();

    // Spinner should be visible
    expect(de.query(By.css('xgb-spinner')).nativeElement).toBeDefined();

    fixture.detectChanges();
    tick();

    // Spinner should be gone
    expect(de.queryAll(By.css('xgb-spinner')).length).toBe(0);

    // Only one code element is toggled
    const codeElements = de.queryAll(By.css('xgb-list-item .code'));
    expect(codeElements.length).toBe(1);
    expect(codeElements[0].nativeElement.innerHTML).toBe('&lt;example-xml&gt;002&lt;/example-xml&gt;');

  }));

  it('should show an error when lazy loading fails', fakeAsync(() => {
    // return some persisted items
    persistedItemsService.persistedItems.and.callFake(function* () {
      yield new PersistedItem('001');
      yield new PersistedItem('002');
      yield new PersistedItem('003');
    });
    persistedItemsService.loadPersistedItemContent.and.callFake(() => {
      return Promise.reject(new XmppError('Error Message', XmppErrorCondition.NotAcceptable));
    });

    // on init
    fixture.detectChanges();
    tick();

    // Loading complete
    fixture.detectChanges();
    tick();

    // Click on the third header element
    const secondElementTitle = de.queryAll(By.css('xgb-list-item .item-title'))[2];
    secondElementTitle.nativeElement.click();
    fixture.detectChanges();
    tick();

    // Spinner should be visible
    expect(de.query(By.css('xgb-spinner')).nativeElement).toBeDefined();

    fixture.detectChanges();
    tick();

    // Spinner should be gone
    expect(de.queryAll(By.css('xgb-spinner')).length).toBe(0);

    // Error should be visible - but no code element
    const codeElements = de.queryAll(By.css('xgb-list-item .code'));
    expect(codeElements.length).toBe(0);
    expect(de.query(By.css('[toast-error]')).nativeElement.innerHTML).toBe('Error Message');

  }));

  it('should show an error when lazy loading fails', fakeAsync(() => {
    // yield 25 items
    persistedItemsService.persistedItems.and.callFake(function* () {
      for (let i = 0; i < 25; i++) {
        yield new PersistedItem(`${i}`);
      }
    });
    // Load the first 10 items
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    tick();

    expect(de.queryAll(By.css('xgb-list-item')).length).toBe(10);

    // Load the next 10 items using the load more button
    let loadMoreButton = de.query(By.css('.has-more [xgbActionButton]')).nativeElement;
    expect(loadMoreButton).toBeDefined();
    loadMoreButton.click();

    // items 11-20 are loaded now
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    tick();

    // Load the next 5 items using the load more button
    expect(de.queryAll(By.css('xgb-list-item')).length).toBe(20);
    loadMoreButton = de.query(By.css('.has-more [xgbActionButton]')).nativeElement;
    expect(loadMoreButton).toBeDefined();
    loadMoreButton.click();
    loadMoreButton.click();

    // items 21-25 are loaded now
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    tick();
    expect(de.queryAll(By.css('xgb-list-item')).length).toBe(25);

    // load more button is no longer visible
    loadMoreButton = de.query(By.css('.has-more [xgbActionButton]'));
    expect(loadMoreButton).toBeNull();

  }));

  describe('when deleting an item', () => {

    const clickRemoveAndWaitForRefresh = () => {
      // yield some
      persistedItemsService.persistedItems.and.callFake(function* () {
        for (let i = 1; i <= 10; i++) {
          yield new PersistedItem(`item #${i}`);
        }
      });
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      tick();

      // get 8th item & click it
      const itemToDelete = de.queryAll(By.css('xgb-list-item .item-title'))[7];
      expect(itemToDelete.nativeElement.innerHTML).toBe('item #8');
      const removeButton = de.queryAll(By.css('xgb-list-item [xgbActionButton]'))[7];
      removeButton.nativeElement.click();
      fixture.detectChanges();
      tick();
    };

    it('should call delete on the service when confirmed', fakeAsync(() => {
      notificationService.confirm.and.returnValue(true);
      clickRemoveAndWaitForRefresh();

      expect(notificationService.confirm).toHaveBeenCalledTimes(1);
      expect(persistedItemsService.persistedItems).toHaveBeenCalledTimes(2);
      expect(persistedItemsService.deletePersistedItem).toHaveBeenCalledTimes(1);
      expect(persistedItemsService.deletePersistedItem.calls.mostRecent().args[0]).toBe('testing');
      expect(persistedItemsService.deletePersistedItem.calls.mostRecent().args[1].id).toBe('item #8');

    }));


    it('should show an error when deletion fails', fakeAsync(() => {
      notificationService.confirm.and.returnValue(true);
      persistedItemsService.persistedItems.and.callFake(function* () {
        yield new PersistedItem('item #1');
      });
      persistedItemsService.deletePersistedItem.and.callFake(() => Promise.reject({condition: 'unknown'}));

      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      tick();

      const removeButton = de.query(By.css('xgb-list-item [xgbActionButton]'));
      removeButton.nativeElement.click();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      tick();

      expect(de.query(By.css('[toast-error]')).nativeElement.innerHTML).toBe('An unknown error has occurred: {"condition":"unknown"}');

      expect(notificationService.confirm).toHaveBeenCalledTimes(1);
      expect(persistedItemsService.persistedItems).toHaveBeenCalledTimes(2);
      expect(persistedItemsService.deletePersistedItem).toHaveBeenCalledTimes(1);
      expect(persistedItemsService.deletePersistedItem.calls.mostRecent().args[0]).toBe('testing');
      expect(persistedItemsService.deletePersistedItem.calls.mostRecent().args[1].id).toBe('item #1');

    }));


    it('should not refresh and not call delete on the service when not confirmed', fakeAsync(() => {
      notificationService.confirm.and.returnValue(false);
      clickRemoveAndWaitForRefresh();

      expect(notificationService.confirm).toHaveBeenCalledTimes(1);
      expect(persistedItemsService.persistedItems).toHaveBeenCalledTimes(1);
      expect(persistedItemsService.deletePersistedItem).toHaveBeenCalledTimes(0);
    }));

  });

  describe('when purging all items', () => {
    const clickPurge = () => {
      persistedItemsService.persistedItems.and.callFake(function* () {
        yield new PersistedItem('item #1');
      });

      // wait until it's loaded
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      tick();

      de.query(By.css('button[danger]')).nativeElement.click();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      tick();

    };
    it('should call purge on the service when confirmed', fakeAsync(() => {
      notificationService.confirm.and.returnValue(true);
      clickPurge();

      expect(notificationService.confirm).toHaveBeenCalledTimes(1);
      expect(persistedItemsService.persistedItems).toHaveBeenCalledTimes(2);
      expect(persistedItemsService.purgePersistedItem).toHaveBeenCalledTimes(1);
      expect(persistedItemsService.purgePersistedItem.calls.mostRecent().args[0]).toBe('testing');
    }));


    it('should show an error when purge fails', fakeAsync(() => {
      notificationService.confirm.and.returnValue(true);
      persistedItemsService.purgePersistedItem.and.callFake(() => Promise.reject({condition: 'unknown'}));

      clickPurge();

      expect(de.query(By.css('[toast-error]')).nativeElement.innerHTML).toBe('An unknown error has occurred: {"condition":"unknown"}');

      expect(notificationService.confirm).toHaveBeenCalledTimes(1);
      expect(persistedItemsService.persistedItems).toHaveBeenCalledTimes(2);
      expect(persistedItemsService.purgePersistedItem).toHaveBeenCalledTimes(1);
      expect(persistedItemsService.purgePersistedItem.calls.mostRecent().args[0]).toBe('testing');

    }));


    it('should not refresh and not call purge on the service when not confirmed', fakeAsync(() => {
      notificationService.confirm.and.returnValue(false);

      clickPurge();

      expect(notificationService.confirm).toHaveBeenCalledTimes(1);
      expect(persistedItemsService.persistedItems).toHaveBeenCalledTimes(1);
      expect(persistedItemsService.purgePersistedItem).toHaveBeenCalledTimes(0);
    }));
  });
});
