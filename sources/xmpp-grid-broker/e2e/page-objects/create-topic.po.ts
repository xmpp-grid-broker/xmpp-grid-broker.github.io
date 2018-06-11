import {UrlAddressableComponent} from '../page-elements';

export class CreateTopicPage extends UrlAddressableComponent {
  get landingUrl(): string {
    return '/topics/new/topic';
  }
}
