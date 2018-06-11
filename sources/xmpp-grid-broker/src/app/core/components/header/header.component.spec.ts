import {ComponentFixture, TestBed} from '@angular/core/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {HeaderComponent} from './index';


describe(HeaderComponent.name, () => {
  let fixture: ComponentFixture<HeaderComponent>;
  let de: HTMLElement;

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [HeaderComponent]
    });

    fixture = TestBed.createComponent(HeaderComponent);
    de = fixture.debugElement.nativeElement;
    fixture.detectChanges();
    return {fixture, de};
  });

  it('should link to / on the title', () => {
    expect(de.querySelector('a').getAttribute('href')).toBe('/');
  });
});
