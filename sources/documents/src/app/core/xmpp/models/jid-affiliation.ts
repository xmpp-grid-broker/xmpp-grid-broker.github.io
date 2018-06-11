import {Affiliation} from './affiliation';

/**
 * A class that represents the affiliation
 * of a JID (to a node) as defied in xep-0060.
 */
export class JidAffiliation {
  constructor(public jid: string,
              public affiliation: Affiliation) {

  }
}
