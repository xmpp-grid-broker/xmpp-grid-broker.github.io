import {fakeAsync, TestBed} from '@angular/core/testing';
import {ActivatedRoute, Router} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';
import {Observable} from 'rxjs/Observable';
import {take} from 'rxjs/operators';

import {BreadCrumbs, ErrorLogService, XmppService} from '../';
import {BreadCrumbService} from './bread-crumb.service';

describe(BreadCrumbService.name, () => {

  let service: BreadCrumbService;
  let xmppService: jasmine.SpyObj<XmppService>;
  let errorLogService: jasmine.SpyObj<ErrorLogService>;
  let activatedRoute: ActivatedRoute;
  let router: Router;

  async function breadCrumbs$ToValues(breadcrumbs$: Observable<BreadCrumbs>): Promise<{ label: string, url: string }[]> {
    const breadcrumbs = await breadcrumbs$.pipe(take(1)).toPromise();

    const values = breadcrumbs.map(async (breadcrumb) => {
      const url = await breadcrumb.url.pipe(take(1)).toPromise();
      const label = await breadcrumb.label.pipe(take(1)).toPromise();
      return {label: label, url: url};
    });

    return Promise.all(values);
  }

  beforeEach(fakeAsync(() => {
    const mockComponent = jasmine.createSpyObj('root', ['ngOnInit']);
    const routes = [
      {path: '', component: mockComponent, data: {breadcrumb: null}},
      {path: 'topics/all', component: mockComponent, data: {breadcrumb: 'All Topics'}},
      {
        path: 'topics/details/:id', data: {breadcrumb: 'Topic :id'},
        children: [
          {path: 'undef', component: mockComponent},
          {path: '', component: mockComponent, data: {breadcrumb: null}},
          {path: 'subscription/:subid', component: mockComponent, data: {breadcrumb: 'Subscription :subid'}}
        ]
      },
    ];

    xmppService = jasmine.createSpyObj(XmppService.name, ['getServerTitle']);
    xmppService.getServerTitle.and.returnValue('xmpp.hsr.ch');
    errorLogService = jasmine.createSpyObj(ErrorLogService.name, ['warn']);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(routes)],
      providers: [
        {provide: ErrorLogService, useValue: errorLogService},
        {provide: XmppService, useValue: xmppService},
      ]
    });

    router = TestBed.get(Router);
    activatedRoute = TestBed.get(ActivatedRoute);

    // Trigger initial navigation
    router.initialNavigation();

    service = new BreadCrumbService(activatedRoute, router, xmppService, errorLogService);
  }));

  it('should generate root and first breadcrumb', async () => {
    router.navigateByUrl('topics/all');

    const breadcrumbs = await breadCrumbs$ToValues(service.getBreadCrumbs());


    expect(xmppService.getServerTitle).toHaveBeenCalledTimes(1);
    expect(breadcrumbs.length).toBe(2);

    expect(breadcrumbs[0]).toEqual({label: 'xmpp.hsr.ch', url: ''});
    expect(breadcrumbs[1]).toEqual({label: 'All Topics', url: 'topics/all'});
  });

  it('should not return null breadcrumbs and not log a warning', async () => {
    router.navigateByUrl('topics/details/12');

    const breadcrumbs = await breadCrumbs$ToValues(service.getBreadCrumbs());

    expect(xmppService.getServerTitle).toHaveBeenCalledTimes(1);
    expect(breadcrumbs.length).toBe(2);

    expect(breadcrumbs[0]).toEqual({label: 'xmpp.hsr.ch', url: ''});
    expect(breadcrumbs[1]).toEqual({label: 'Topic 12', url: 'topics/details/12'});
    expect(errorLogService.warn).toHaveBeenCalledTimes(0);
  });

  it('should substitute multiple parameter values in the labels and parameters', async () => {
    const fullUrl = 'topics/details/12/subscription/xyz';
    router.navigateByUrl(fullUrl);

    const breadcrumbs = await breadCrumbs$ToValues(service.getBreadCrumbs());

    expect(breadcrumbs.length).toBe(3);
    expect(breadcrumbs[0]).toEqual({label: 'xmpp.hsr.ch', url: ''});
    expect(breadcrumbs[1]).toEqual({label: 'Topic 12', url: 'topics/details/12'});
    expect(breadcrumbs[2]).toEqual({label: 'Subscription xyz', url: fullUrl});
  });

  it('should report a warning if a breadcrumb value is undefined', async () => {
    router.navigateByUrl('topics/details/123/undef');

    const breadcrumbs = await breadCrumbs$ToValues(service.getBreadCrumbs());

    expect(breadcrumbs.length).toBe(2);
    expect(breadcrumbs[0]).toEqual({label: 'xmpp.hsr.ch', url: ''});
    expect(breadcrumbs[1]).toEqual({label: 'Topic 123', url: 'topics/details/123'});

    expect(errorLogService.warn).toHaveBeenCalledTimes(1);
    expect(errorLogService.warn.calls.mostRecent().args[0])
      .toBe('This route has no properly configured breadcrumb. Should either be a string or null.');
  });
});
