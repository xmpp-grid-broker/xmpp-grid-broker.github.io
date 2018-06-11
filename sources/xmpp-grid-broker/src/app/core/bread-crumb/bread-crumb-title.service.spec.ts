import {fakeAsync, tick} from '@angular/core/testing';
import {Title} from '@angular/platform-browser';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {of} from 'rxjs/observable/of';

import {BreadCrumb, BreadCrumbs} from './bread-crumb';
import {BreadCrumbTitleService} from './bread-crumb-title.service';

describe(BreadCrumbTitleService.name, () => {
  let titleService: jasmine.SpyObj<Title>;
  let breadCrumbTitleService: BreadCrumbTitleService;
  let breadCrumbs: BehaviorSubject<BreadCrumbs>;

  beforeEach(() => {
    titleService = jasmine.createSpyObj(Title.name, ['setTitle']);
    breadCrumbs = new BehaviorSubject<BreadCrumbs>([]);

    const breadCrumbService = jasmine.createSpyObj(BreadCrumbTitleService.name, ['getBreadCrumbs']);
    breadCrumbService.getBreadCrumbs.and.returnValue(breadCrumbs);

    breadCrumbTitleService = new BreadCrumbTitleService(titleService, breadCrumbService);
    breadCrumbTitleService.activate();
  });

  it('should translate breadcrumbs into title', fakeAsync(() => {
    breadCrumbs.next([
      new BreadCrumb(of('./'), of('Random')),
      new BreadCrumb(of('./stuff'), of('Stuff'))
    ]);

    tick();

    return expect(titleService.setTitle).toHaveBeenCalledWith('XMPP-Grid Broker: Random → Stuff');
  }));

  it('should replace breadcrumbs when they change', fakeAsync(() => {
    // Provide initial values
    breadCrumbs.next([
      new BreadCrumb(of('./'), of('Random')),
    ]);
    tick();
    expect(titleService.setTitle).toHaveBeenCalledWith('XMPP-Grid Broker: Random');

    // Update breadcrumbs & verify new values
    breadCrumbs.next([
      new BreadCrumb(of('./'), of('Foo')),
      new BreadCrumb(of('./baa'), of('Baa')),
    ]);
    tick();
    expect(titleService.setTitle).toHaveBeenCalledWith('XMPP-Grid Broker: Foo → Baa');

  }));


  it('should change the title when no breadcrumbs are provided', fakeAsync(() => {
    tick();

    return expect(titleService.setTitle).toHaveBeenCalledTimes(0);
  }));
});
