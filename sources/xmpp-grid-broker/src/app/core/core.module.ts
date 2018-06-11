import {CommonModule} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {ErrorHandler, NgModule, Optional, SkipSelf} from '@angular/core';
import {RouterModule} from '@angular/router';

import {
  AlertNotificationComponent,
  BreadCrumbComponent,
  BreadCrumbService,
  BreadCrumbTitleService,
  ConfigService,
  ConfirmNotificationComponent,
  ErrorLogService,
  ErrorPageComponent,
  FeatureDetectionGuardService,
  FeatureService,
  GlobalErrorHandlerService,
  HeaderComponent,
  NavigationService,
  NotificationService,
  XmppClientFactory,
  XmppService
} from '.';

const EXPORTED_DECLARATIONS = [
  HeaderComponent,
  BreadCrumbComponent,
  AlertNotificationComponent,
  ConfirmNotificationComponent
];

@NgModule({
  imports: [CommonModule, RouterModule, HttpClientModule],
  declarations: [
    ...EXPORTED_DECLARATIONS,
    ErrorPageComponent
  ],
  exports: [
    ...EXPORTED_DECLARATIONS
  ],
  entryComponents: [
    AlertNotificationComponent,
    ConfirmNotificationComponent
  ],
  providers: [
    BreadCrumbService,
    BreadCrumbTitleService,
    {provide: ErrorHandler, useClass: GlobalErrorHandlerService},
    NotificationService,
    NavigationService,
    XmppService,
    XmppClientFactory,
    FeatureService,
    FeatureDetectionGuardService,
    ConfigService,
    ErrorLogService
  ]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import it in the AppModule only');
    }
  }
}
