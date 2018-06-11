import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {
  FormFieldNamePipe,
  GenericFormConfigComponent,
  JidMultiComponent,
  TopicChooserComponent,
  TopicConfigComponent,
  TopicIteratorHelperService,
  TopicListComponent
} from '.';
import {SharedModule} from '../shared/shared.module';

const EXPORTED_DECLARATIONS = [
  TopicListComponent,
  GenericFormConfigComponent,
  TopicConfigComponent,
  FormFieldNamePipe,
  TopicChooserComponent
];

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SharedModule],
  declarations: [...EXPORTED_DECLARATIONS, JidMultiComponent],
  exports: [...EXPORTED_DECLARATIONS],
  providers: [TopicIteratorHelperService]

})
export class TopicWidgetsModule {
}
