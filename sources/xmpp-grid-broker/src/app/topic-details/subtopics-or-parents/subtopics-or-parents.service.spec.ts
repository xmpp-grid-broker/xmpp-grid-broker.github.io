import {SubtopicsOrParentsService} from '..';
import {TopicIteratorHelperService} from '../../topic-widgets';

describe(SubtopicsOrParentsService.name, () => {

  let iteratorHelper: jasmine.SpyObj<TopicIteratorHelperService>;
  let service: SubtopicsOrParentsService;
  beforeEach(() => {
    iteratorHelper = jasmine.createSpyObj(TopicIteratorHelperService.name,
      ['createChildTopicsIterator', 'createParentsTopicsIterator']);
    service = new SubtopicsOrParentsService(iteratorHelper);
  });

  describe('when calling subtopics', () => {
    it('should just return the result of the call to the helper service', () => {
      const fakeResult = jasmine.createSpyObj('AsyncIterableIterator', ['next']);
      iteratorHelper.createChildTopicsIterator.and.returnValue(fakeResult);

      const result = service.subtopics('topicName');

      expect(result).toBe(fakeResult);
    });

    it('should call the helper service with the topic name and recursive flag', () => {
      service.subtopics('topicName');

      expect(iteratorHelper.createChildTopicsIterator).toHaveBeenCalledTimes(1);
      expect(iteratorHelper.createChildTopicsIterator).toHaveBeenCalledWith('topicName', true);
    });
  });

  describe('when calling parents', () => {
    it('should just return the result of the call to the helper service', () => {
      const fakeResult = jasmine.createSpyObj('AsyncIterableIterator', ['next']);
      iteratorHelper.createParentsTopicsIterator.and.returnValue(fakeResult);

      const result = service.parents('topicName');

      expect(result).toBe(fakeResult);
    });

    it('should call the helper service with the topic name and recursive flag', () => {
      service.parents('topicName');

      expect(iteratorHelper.createParentsTopicsIterator).toHaveBeenCalledTimes(1);
      expect(iteratorHelper.createParentsTopicsIterator).toHaveBeenCalledWith('topicName', true);
    });
  });
});
