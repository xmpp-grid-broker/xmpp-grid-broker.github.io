import {ComponentFixture, fakeAsync, TestBed} from '@angular/core/testing';
import {ActivatedRoute} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';
import 'rxjs/add/observable/of';
import {Observable} from 'rxjs/Observable';

import {ErrorPageComponent} from './';

describe(ErrorPageComponent.name, () => {

  let component: ErrorPageComponent;
  let fixture: ComponentFixture<ErrorPageComponent>;
  let de: HTMLElement;
  let routeData: Observable<{ errorCode: string }>;

  function setup(errorCode: string) {
    routeData = Observable.of({errorCode});

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [ErrorPageComponent],
      providers: [{provide: ActivatedRoute, useValue: {data: routeData}}]
    });

    fixture = TestBed.createComponent(ErrorPageComponent);
    component = fixture.componentInstance;
    de = fixture.debugElement.nativeElement;
  }

  describe('given 404 as an error code', () => {
    beforeEach(() => {
      setup('404');
      fixture.detectChanges();
    });

    it('should contain 404 message', () => {
      expect(de.querySelector('p').textContent).toBe('We can\'t seem to find the page you\'re looking for.');
      expect(de.querySelector('.error-code').textContent).toBe('Error Code: 404');
    });

  });

  describe('given 500 as an error code', () => {
    beforeEach(() => {
      setup('500');
      fixture.detectChanges();
    });

    it('should contain generic message', () => {
      expect(component.errorCode).toBe('500');
      expect(de.querySelector('p').textContent).toBe('Something didn\'t work out the way we planned!');
      expect(de.querySelector('.error-code').textContent).toBe('Error Code: 500');
    });

    it('should contain show a link to home', () => {
      expect(component.errorCode).toBe('500');
      expect(de.querySelectorAll('p').item(2).textContent).toBe('Go back to home');
      expect(de.querySelector('p > a').getAttribute('href')).toBe('/');
    });

  });


  it('should subscribe to router data on init', fakeAsync(() => {
    setup('404');
    const routeSpy = spyOn(routeData, 'subscribe').and.callThrough();

    fixture.detectChanges();

    expect(routeSpy.calls.count()).toBe(1);
    expect(component.errorCode).toBe('404');
  }));

});
