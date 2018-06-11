import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {TopicCreationComponent, TopicCreationService} from '.';
import {SharedModule} from '../shared/shared.module';
import {TopicWidgetsModule} from '../topic-widgets/topic-widgets.module';
import {TopicCreationRoutingModule} from './topic-creation-router.module';

@NgModule({
  imports: [
    CommonModule,
    TopicCreationRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    TopicWidgetsModule
  ],
  declarations: [TopicCreationComponent],
  exports: [],
  providers: [TopicCreationService]
})
export class TopicCreationModule {
}
