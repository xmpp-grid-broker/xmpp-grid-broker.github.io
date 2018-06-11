import {Component, Input} from '@angular/core';

/**
 * A tab entry.
 * See {@type TabsComponent}.
 */
@Component({
  selector: 'xgb-tab',
  template: ``
})
export class TabComponent {
  @Input() tabTitle: string;
  @Input() routerLink: any[] | string;
}
