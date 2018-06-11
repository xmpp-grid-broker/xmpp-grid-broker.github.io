import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {
  CurrentTopicDetailService,
  ModifySubscriptionComponent,
  NewPersistedItemComponent,
  NewTopicSubscriptionComponent,
  PersistedItemsComponent,
  PersistedItemsService,
  SubtopicsOrParentsComponent,
  SubtopicsOrParentsService,
  TopicAffiliationsComponent,
  TopicAffiliationsService,
  TopicDetailsComponent,
  TopicDetailsConfigComponent,
  TopicDetailsConfigurationService,
  TopicSubscriptionComponent,
  TopicSubscriptionService
} from '.';
import {SharedModule} from '../shared/shared.module';
import {TopicWidgetsModule} from '../topic-widgets/topic-widgets.module';
import {TopicDetailsRouterModule} from './topic-details-router.module';

@NgModule({
  imports: [
    CommonModule,
    TopicDetailsRouterModule,
    SharedModule,
    TopicWidgetsModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  declarations: [
    TopicDetailsComponent,
    TopicDetailsConfigComponent,
    TopicAffiliationsComponent,
    PersistedItemsComponent,
    NewPersistedItemComponent,
    TopicSubscriptionComponent,
    NewTopicSubscriptionComponent,
    ModifySubscriptionComponent,
    SubtopicsOrParentsComponent
  ],
  providers: [
    TopicDetailsConfigurationService,
    CurrentTopicDetailService,
    TopicAffiliationsService,
    PersistedItemsService,
    TopicSubscriptionService,
    SubtopicsOrParentsService]
})
export class TopicDetailsModule {
}
