import {Observable} from 'rxjs/Observable';

export class BreadCrumb {
  constructor(readonly url: Observable<string>,
              readonly label?: Observable<string>) {
  }
}

export type BreadCrumbs = BreadCrumb[];
