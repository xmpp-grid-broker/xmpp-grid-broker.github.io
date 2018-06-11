import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';

import {TopicOverviewComponent, TopicOverviewService} from '.';
import {SharedModule} from '../shared/shared.module';
import {TopicWidgetsModule} from '../topic-widgets/topic-widgets.module';
import {TopicOverviewRoutingModule} from './topic-overview-router.module';

@NgModule({
  imports: [
    CommonModule,
    TopicOverviewRoutingModule,
    SharedModule,
    TopicWidgetsModule
  ],
  declarations: [TopicOverviewComponent],
  exports: [],
  providers: [TopicOverviewService]
})
export class TopicOverviewModule {
}
