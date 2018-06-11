import {Component, ComponentRef} from '@angular/core';

@Component({
  selector: 'xgb-notifications',
  templateUrl: './confirm-notification.component.html'
})
export class ConfirmNotificationComponent {

  /**
   * The title of the alert modal.
   */
  public title: string;

  /**
   * A user friendly message to be displayed.
   */
  public message: string;

  public confirmButtonLabel: string;
  public cancelButtonLabel: string;


  /**
   * Promise to resolve when either the confirm or
   * the cancel button is clicked.
   *
   * If confirmed, the promised value is true, false otherwise.
   */
  public resolvePromise: Promise<boolean>;

  /**
   * Reference to this component, allowing to dispose it when closed.
   */
  private componentRef: ComponentRef<ConfirmNotificationComponent>;
  // noinspection TypeScriptFieldCanBeMadeReadonly
  private resolve: (value?: (PromiseLike<boolean> | boolean)) => void;


  constructor() {
    this.resolvePromise = new Promise<boolean>((resolve) => {
      this.resolve = resolve;
    });
  }

  /**
   * Hide / destroy this notification.
   */
  public complete(isConfirmed: boolean) {
    this.resolve(isConfirmed);
    this.componentRef.destroy();
  }

  /**
   * Sets the reference to this view to be able to destroy it.
   */
  public setViewRef(componentRef: ComponentRef<ConfirmNotificationComponent>) {
    this.componentRef = componentRef;
  }
}
