import {Injectable} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {combineLatest} from 'rxjs/observable/combineLatest';
import {flatMap, map, take} from 'rxjs/operators';

import {BreadCrumbService} from './bread-crumb.service';

/**
 * This service can be used to update the page title to represent
 * the bread crumb value.
 */
@Injectable()
export class BreadCrumbTitleService {
  constructor(private title: Title,
              private breadCrumbService: BreadCrumbService) {
  }

  /**
   * Call this method (eg. in the root app component) to activate
   * the service.
   */
  public activate() {
    const path$ = this.breadCrumbService.getBreadCrumbs().pipe(
      map(breadcrumbs => breadcrumbs.map(crumb => crumb.label)),
      flatMap(labels$ => combineLatest(labels$).pipe(take(1))),
      map(labels => labels.join(' → '))
    );

    path$.subscribe(path => {
      this.title.setTitle(`XMPP-Grid Broker: ${path}`);
    });
  }
}
