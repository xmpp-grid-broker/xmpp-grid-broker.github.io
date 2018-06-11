import {Injectable} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {of} from 'rxjs/observable/of';
import {distinctUntilChanged, filter, map, multicast, refCount} from 'rxjs/operators';
import {Subject} from 'rxjs/Subject';

import {ErrorLogService} from '../errors';
import {XmppService} from '../xmpp';
import {BreadCrumb, BreadCrumbs} from './bread-crumb';
import {getAllUrlParameters, getUrlFromRoute, placeParamsIn} from './bread-crumb-utils';

/**
 * Service that provides BreadCrumbs based on routing events.
 */
@Injectable()
export class BreadCrumbService {

  /**
   * Subject of the current bread crumbs.
   * Is updated whenever the URL changes.
   */
  private readonly _breadcrumbs: Observable<BreadCrumbs>;

  /**
   * Subject that handles multicast of breadcrumbs observable
   */
  private readonly _subject = new Subject<BreadCrumbs>();

  constructor(private activatedRoute: ActivatedRoute,
              private router: Router,
              private xmppService: XmppService,
              private errorLogService: ErrorLogService) {
    // noinspection SuspiciousInstanceOfGuard
    this._breadcrumbs = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      distinctUntilChanged(),
      map(() => this.activatedRoute.root),
      map(route => this.buildBreadCrumbs(route)),
      multicast(this._subject),
      refCount()
    );
  }

  public getBreadCrumbs(): Observable<BreadCrumbs> {
    return this._breadcrumbs;
  }

  /**
   * Reconstructs BreadCrumbs recursively from tree path root
   */
  private buildBreadCrumbs(route: ActivatedRoute): BreadCrumbs {
    const url = getUrlFromRoute(route);

    // ActiveRoute can only have one child
    const breadCrumbs = route.firstChild ? this.buildBreadCrumbs(route.firstChild) : [];

    const isRouteConfigured = route.routeConfig && route.routeConfig.data && route.routeConfig.data['breadcrumb'] !== undefined;
    const crumb: any = isRouteConfigured ? route.routeConfig.data['breadcrumb'] : undefined;

    if (route === route.root) {
      breadCrumbs.unshift(new BreadCrumb(url, of(this.xmppService.getServerTitle())));

    } else if (crumb && typeof crumb === 'string') {
      const crumbLabel = getAllUrlParameters(route).pipe(placeParamsIn(crumb));
      breadCrumbs.unshift(new BreadCrumb(url, crumbLabel));

    } else if (crumb !== null) {
      this.errorLogService.warn(
        'This route has no properly configured breadcrumb. Should either be a string or null.',
        route
      );
    }

    return breadCrumbs;
  }
}
