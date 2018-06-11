import {Component, ComponentRef} from '@angular/core';

@Component({
  selector: 'xgb-notifications',
  templateUrl: './alert-notification.component.html',
  styleUrls: ['./alert-notification.component.css']
})
export class AlertNotificationComponent {

  /**
   * The title of the alert modal.
   */
  public title: string;

  /**
   * A user friendly message to be displayed. Technical details
   * should be placed in the details field.
   */
  public message: string;

  /**
   * Alert details, eg. the stack trace for an error message.
   */
  public details: any;

  /*
   * If set to false, alert can be closed.
   * Otherwise, it stays opened and the browser must be reloaded
   * (eg. unrecoverable error).
   * USE WITH CAUTION!
   */
  public canHide = true;

  /**
   * True, if the message shall be rendered as HTML.
   * DANGEROUS: THIS CAN RESULT IN XSS-ATTACKS WHEN NOT USED PROPERLY!
   */
  public messageIsHtml: boolean;

  /**
   * Reference to this component, allowing to dispose it when closed.
   */
  private componentRef: ComponentRef<AlertNotificationComponent>;

  /**
   * Hide / destroy this notification.
   */
  public hide() {
    if (this.canHide) {
      this.componentRef.destroy();
    }
  }

  /**
   * Sets the reference to this view to be able to destroy it.
   */
  public setViewRef(componentRef: ComponentRef<AlertNotificationComponent>) {
    this.componentRef = componentRef;
  }
}
