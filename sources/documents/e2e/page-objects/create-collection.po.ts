import {UrlAddressableComponent} from '../page-elements';

export class CreateCollectionPage extends UrlAddressableComponent {
  get landingUrl(): string {
    return '/topics/new/collection';
  }
}
