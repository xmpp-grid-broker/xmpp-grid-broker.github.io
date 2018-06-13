import {ElementFinder} from 'protractor';

/**
 * A web page component, that is locatable and can be waited for to be present.
 */
export abstract class Component {

  /**
   * Element finding selector
   */
  abstract get locator(): ElementFinder;

  /**
   * Promise resolves if the element is fully loaded (without children)
   */
  abstract awaitPresence(): Promise<void>;

  /**
   * Promise resolves if the element is fully loaded (with children)
   */
  abstract awaitFullyLoaded(): Promise<void>;
}
