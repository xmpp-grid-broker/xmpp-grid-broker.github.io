import {Component} from '@angular/core';

/**
 * A simple wrapper component to represent a list.
 * Use in conjunction with xgb-list-item.
 *
 * ```
 * <xgb-list>
 *     <xgb-list-item>First element</xgb-list-item>
 *     <xgb-list-item>
 *         Second element
 *         <xgb-list-action><button>delete me</button></xgb-list-action>
 *     </xgb-list-item>
 *     <xgb-list-item>
 *         Third element
 *         <xgb-list-body>More details on this topic displayed here...</xgb-list-body>
 *     </xgb-list-item>
 * </xgb-list>
 * ```
 */
@Component({
  selector: 'xgb-list',
  template: '<ng-content></ng-content>',
  styleUrls: ['./list.component.css']
})
export class ListComponent {

}
