import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {
  ModifySubscriptionComponent,
  NewPersistedItemComponent,
  NewTopicSubscriptionComponent,
  PersistedItemsComponent,
  SubtopicsOrParentsComponent,
  TopicAffiliationsComponent,
  TopicDetailsComponent,
  TopicDetailsConfigComponent,
  TopicSubscriptionComponent
} from '.';
import {FeatureDetectionGuardService as XmppFeatureGuard} from '../core';


const routes: Routes = [
  {
    path: 'topics/details/:id',
    canActivate: [XmppFeatureGuard],
    component: TopicDetailsComponent,
    children: [
      {path: '', redirectTo: 'configuration', pathMatch: 'full', data: {breadcrumb: 'Topic :id'}},
      {path: 'configuration', component: TopicDetailsConfigComponent, data: {breadcrumb: 'Configuration'}},
      {path: 'affiliations', component: TopicAffiliationsComponent, data: {breadcrumb: 'Affiliations'}},
      {path: 'subscriptions', component: TopicSubscriptionComponent, data: {breadcrumb: 'Subscriptions'}},
      {path: 'subtopics', component: SubtopicsOrParentsComponent, data: {subtopics: true, breadcrumb: 'Subtopics'}},
      {path: 'parents', component: SubtopicsOrParentsComponent, data: {subtopics: false, breadcrumb: 'Parent Collections'}},
      {path: 'items', component: PersistedItemsComponent, data: {breadcrumb: 'Persisted Items'}},
    ],
    data: {
      breadcrumb: 'Topic :id'
    }
  },
  {
    path: 'topics/details/:id',
    canActivate: [XmppFeatureGuard],
    children: [
      {
        path: 'items/new',
        canActivate: [XmppFeatureGuard],
        component: NewPersistedItemComponent,
        data: {
          breadcrumb: 'New Persisted Item'
        }
      }, {
        path: 'subscriptions/new',
        canActivate: [XmppFeatureGuard],
        component: NewTopicSubscriptionComponent,
        data: {
          breadcrumb: 'New Subscription'
        }
      },
      {
        path: 'subscriptions/:jid/:subId',
        canActivate: [XmppFeatureGuard],
        component: ModifySubscriptionComponent,
        data: {
          breadcrumb: 'Modify Subscription :jid'
        }
      }
    ],
    data: {
      breadcrumb: 'Topic :id'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TopicDetailsRouterModule {
}
