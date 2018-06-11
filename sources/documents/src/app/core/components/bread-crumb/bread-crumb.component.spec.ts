import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {Observable} from 'rxjs/Observable';
import {of} from 'rxjs/observable/of';

import {BreadCrumb, BreadCrumbService} from '../../';
import {BreadCrumbComponent} from './bread-crumb.component';

describe(BreadCrumbComponent.name, () => {
  let fixture: ComponentFixture<BreadCrumbComponent>;
  let el: HTMLElement;
  let breadCrumbService: jasmine.SpyObj<BreadCrumbService>;

  beforeEach(fakeAsync(() => {
    breadCrumbService = jasmine.createSpyObj(BreadCrumbService.name, ['getBreadCrumbs']);
    breadCrumbService.getBreadCrumbs.and.returnValue(Observable.of([
      new BreadCrumb(of(''), of('Romeo')),
      new BreadCrumb(of('topics/details/julia'), of('Topic Julia'))
    ]));

    TestBed.configureTestingModule({
      declarations: [BreadCrumbComponent],
      imports: [RouterTestingModule],
      providers: [
        {provide: BreadCrumbService, useValue: breadCrumbService},
      ]
    });

    fixture = TestBed.createComponent(BreadCrumbComponent);
    el = fixture.debugElement.nativeElement;

    // Wait until component is fully rendered
    fixture.detectChanges();
    tick();
  }));

  it('should render breadcrumbs', () => {
    const breadcrumbs: any = el.querySelectorAll('.breadcrumb-item > a');

    expect(breadcrumbs.length).toBe(2);

    expect(breadcrumbs[0].innerHTML.trim()).toBe('Romeo');
    expect(breadcrumbs[0]['href'].endsWith('')).toBe(true);

    expect(breadcrumbs[1].innerHTML.trim()).toBe('Topic Julia');
    expect(breadcrumbs[1]['href'].endsWith('/topics/details/julia')).toBe(true);
  });
});
