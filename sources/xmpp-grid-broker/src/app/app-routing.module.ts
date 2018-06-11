import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {ErrorPageComponent} from './core/';
import {TopicCreationModule} from './topic-creation/topic-creation.module';
import {TopicDetailsModule} from './topic-details/topic-details.module';
import {TopicOverviewModule} from './topic-overview/topic-overview.module';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'topics',
    pathMatch: 'full',
    data: {
      breadcrumb: 'Root'
    }
  },
  {
    path: '**',
    component: ErrorPageComponent,
    data: {
      errorCode: '404',
      breadcrumb: 'Oops! 404 Not Found'
    }
  },
];

@NgModule({
  imports: [
    TopicOverviewModule,
    TopicCreationModule,
    TopicDetailsModule,
    RouterModule.forRoot(routes),
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {
}

