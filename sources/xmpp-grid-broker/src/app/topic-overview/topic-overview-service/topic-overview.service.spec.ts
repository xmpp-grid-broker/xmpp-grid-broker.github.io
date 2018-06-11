import {TopicOverviewService} from '..';
import {CollectionTopic, LeafTopic} from '../../core';
import {TopicIteratorHelperService} from '../../topic-widgets';

describe(TopicOverviewService.name, () => {

  let iteratorHelper: jasmine.SpyObj<TopicIteratorHelperService>;
  let service: TopicOverviewService;
  beforeEach(() => {
    iteratorHelper = jasmine.createSpyObj(TopicIteratorHelperService.name,
      ['createChildTopicsIterator', 'filterTopicsIterator']);
    service = new TopicOverviewService(iteratorHelper);
  });

  describe('when calling rootTopics', () => {
    it('should just return the result of the call to the helper service', () => {
      const fakeResult = jasmine.createSpyObj('AsyncIterableIterator', ['next']);
      iteratorHelper.createChildTopicsIterator.and.returnValue(fakeResult);

      const result = service.rootTopics();

      expect(result).toBe(fakeResult);
    });

    it('should call the helper service with undefined and recursive flag', () => {
      service.rootTopics();

      expect(iteratorHelper.createChildTopicsIterator).toHaveBeenCalledTimes(1);
      expect(iteratorHelper.createChildTopicsIterator).toHaveBeenCalledWith(undefined, false);
    });
  });
  describe('when calling allTopics', () => {
    it('should return a filtered iterator', () => {
      const fakeResult = jasmine.createSpyObj('AsyncIterableIterator', ['next']);
      iteratorHelper.filterTopicsIterator.and.returnValue(fakeResult);

      const result = service.allTopics();

      expect(result).toBe(fakeResult);
    });
    it('should call the helper service with undefined and recursive flag', () => {
      service.allTopics();

      expect(iteratorHelper.createChildTopicsIterator).toHaveBeenCalledTimes(1);
      expect(iteratorHelper.createChildTopicsIterator).toHaveBeenCalledWith(undefined, true);
    });

    it('should call the the filter method with a simple predicate', () => {
      service.allTopics();

      expect(iteratorHelper.filterTopicsIterator).toHaveBeenCalledTimes(1);
      const filterFn = iteratorHelper.filterTopicsIterator.calls.mostRecent().args[1];
      expect(filterFn(new LeafTopic('foo'))).toBe(true);
      expect(filterFn(new CollectionTopic('foo'))).toBe(false);
    });

  });

  describe('when calling allCollections', () => {
    it('should return a filtered iterator', () => {
      const fakeResult = jasmine.createSpyObj('AsyncIterableIterator', ['next']);
      iteratorHelper.filterTopicsIterator.and.returnValue(fakeResult);

      const result = service.allCollections();

      expect(result).toBe(fakeResult);
    });
    it('should call the helper service with undefined and recursive flag', () => {
      service.allCollections();

      expect(iteratorHelper.createChildTopicsIterator).toHaveBeenCalledTimes(1);
      expect(iteratorHelper.createChildTopicsIterator).toHaveBeenCalledWith(undefined, true);
    });

    it('should call the the filter method with a simple predicate', () => {
      service.allCollections();

      expect(iteratorHelper.filterTopicsIterator).toHaveBeenCalledTimes(1);
      const filterFn = iteratorHelper.filterTopicsIterator.calls.mostRecent().args[1];
      expect(filterFn(new LeafTopic('foo'))).toBe(false);
      expect(filterFn(new CollectionTopic('foo'))).toBe(true);
    });

  });
});
