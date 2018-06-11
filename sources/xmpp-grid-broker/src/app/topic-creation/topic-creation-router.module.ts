import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {TopicCreationComponent} from '.';
import {FeatureDetectionGuardService as XmppFeatureGuard} from '../core';

const routes: Routes = [
  {
    path: 'topics/new',
    canActivate: [XmppFeatureGuard],
    children: [
      {
        path: 'topic',
        component: TopicCreationComponent,
        data: {
          type: 'leaf',
          breadcrumb: 'Create New Topic'
        }
      },
      {
        path: 'collection',
        component: TopicCreationComponent,
        data: {
          type: 'collection',
          breadcrumb: 'Create New Collection'
        }
      }
    ],
    data: {
      breadcrumb: null
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TopicCreationRoutingModule {
}
