import {LeafTopic} from '../xmpp';
import {NavigationService} from './navigation.service';

describe(NavigationService.name, () => {

  let service: NavigationService;
  let mockRouter;

  beforeEach(() => {
    mockRouter = {
      navigateByUrl: jasmine.createSpy('navigateByUrl')
    };
    service = new NavigationService(mockRouter);
  });

  it('verify goToNewTopic', () => {
    service.goToNewTopic();
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/topics/new/topic');
  });
  it('verify goToNewCollection', () => {
    service.goToNewCollection();
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/topics/new/collection');
  });

  it('verify goToTopic by name works', () => {
    service.goToTopic('name');
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/topics/details/name');
  });

  it('verify goToTopic by topic works', () => {
    service.goToTopic(new LeafTopic('leafTopic'));
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/topics/details/leafTopic');
  });
  it('verify goToPersistedItems by topic works', () => {
    service.goToPersistedItems(new LeafTopic('leaf@?!Topic'));
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/topics/details/leaf%40%3F!Topic/items');
  });

  it('verify goToSubscription', () => {
    service.goToSubscription('l@a!fTo}ic/', 'ex@__pl/jx', '0101-23|');
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/topics/details/l%40a!fTo%7Dic%2F/subscriptions/ex%40__pl%2Fjx/0101-23%7C');
  });

  it('verify goToNewSubscription', () => {
    service.goToNewSubscription('l@a!fTo}ic/');
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/topics/details/l%40a!fTo%7Dic%2F/subscriptions/new');
  });

  it('verify goToSubscriptions', () => {
    service.goToSubscriptions('l@a!fTo}ic/');
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/topics/details/l%40a!fTo%7Dic%2F/subscriptions');
  });


});
