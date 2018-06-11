import {ErrorToString} from '../../core';

/**
 * This class abstracts paging, loading and error handling
 * to simplify the usage of lists.
 */
export class IteratorListPager<T> {
  /**
   * set to true, if not in the process of loading.
   */
  isLoaded = false;

  /**
   * set to true if an error has occurred while loading
   * elements.
   * Check error for more details.
   */
  hasError = false;

  /**
   * Detailed error message that is set when an error has occurred while loading
   * elements.
   */
  errorMessage: string;

  /**
   * All items loaded that shall be displayed.
   */
  items: T[];

  /**
   * set to true if more elements can be loaded.
   * Evaluated from the the underlying iterator.
   */
  hasMore: boolean;

  /**
   * The iterator used to fetch (more) elements.
   */
  private iterator: AsyncIterableIterator<T>;

  /**
   * @param {number} PAGE_SIZE the number of elements to load in at once.
   */
  constructor(private readonly PAGE_SIZE: number) {
  }

  /**
   * Use the given iterator to load (more) elements.
   * The returned promise must not necessarily be handled
   * as error handling is the responsibility of this class.
   */
  public useIterator(iterator: AsyncIterableIterator<T>): Promise<void> {
    this.iterator = iterator;
    this.items = [];
    this.hasMore = false;
    this.errorMessage = undefined;
    return this.loadMore();
  }

  /**
   * Load the next page of elements.
   */
  public loadMore(): Promise<void> {
    this.isLoaded = false;
    this.hasError = false;
    return this.loadNextPage()
      .then((loadedItems) => {
        this.items.push(...loadedItems);
        this.isLoaded = true;
      })
      .catch((error) => {
        this.hasError = true;
        this.errorMessage = ErrorToString(error);
      });
  }

  private async loadNextPage(): Promise<T[]> {
    const unresolvedIterators = [];
    for (let i = 0; i < this.PAGE_SIZE; i++) {
      unresolvedIterators.push(this.iterator.next());
    }
    const result = [];
    const resolvedIterators = await Promise.all(unresolvedIterators);
    for (const next of resolvedIterators) {
      if (next.done) {
        this.hasMore = false;
        break;
      }
      result.push(next.value);
      this.hasMore = true;
    }

    return result;
  }
}
