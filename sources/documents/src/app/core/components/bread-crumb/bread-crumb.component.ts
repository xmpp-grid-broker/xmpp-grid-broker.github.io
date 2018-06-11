import {Component, ViewEncapsulation} from '@angular/core';

import {BreadCrumbService} from '../../bread-crumb/';

/**
 * Component that renders bread crumbs based on the
 * values of the currently active route.
 */
@Component({
  selector: 'xgb-bread-crumb',
  templateUrl: './bread-crumb.component.html',
  styleUrls: ['./bread-crumb.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class BreadCrumbComponent {
  constructor(readonly breadCrumbService: BreadCrumbService) {
  }
}
