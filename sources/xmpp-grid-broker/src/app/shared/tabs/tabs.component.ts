import {Component, ContentChildren, QueryList} from '@angular/core';

import {TabComponent} from './tab.component';

/**
 * A simple tab view.
 *
 * ```
 * <xgb-tabs>
 *   <xgb-tab [routerLink]="['x']" tabTitle="X"></xgb-tab>
 *   <xgb-tab [routerLink]="['y']" tabTitle="Y"></xgb-tab>
 *   <xgb-tab [routerLink]="['z']" tabTitle="Z"></xgb-tab>
 * </xgb-tabs>
 * ```
 */
@Component({
  selector: 'xgb-tabs',
  template: `
    <ul class="tab tab-block">
      <li *ngFor="let tab of tabs" class="tab-item">
        <a [routerLink]="tab.routerLink" routerLinkActive="active">{{tab.tabTitle}}</a>
      </li>
    </ul>
  `
})
export class TabsComponent {

  @ContentChildren(TabComponent) tabs: QueryList<TabComponent>;

}
