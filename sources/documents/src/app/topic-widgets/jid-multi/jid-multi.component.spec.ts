import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {By} from '@angular/platform-browser';

import {JidMultiComponent} from '..';

describe(JidMultiComponent.name, () => {
  let component: JidMultiComponent;
  let fixture: ComponentFixture<JidMultiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, FormsModule],
      declarations: [JidMultiComponent]
    });
  }));

  const getJidItemsElement = (): any[] => {
    return fixture.debugElement.query(By.css('.jid-items')).nativeElement.children;
  };
  const getAddButton = (): HTMLButtonElement => {
    return fixture.debugElement.nativeElement.querySelector('button[type=submit]');
  };
  const getInputField = (): HTMLInputElement => {
    return fixture.debugElement.nativeElement.querySelector('input[type=text]');
  };

  beforeEach(() => {
    fixture = TestBed.createComponent(JidMultiComponent);
    component = fixture.componentInstance;
    component.writeValue(['a@example.com', 'b@example.com']);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('it should render all jids on bind', () => {
    const jidItemsElement = getJidItemsElement();

    expect(jidItemsElement.length).toBe(2 * 2); // 2 jid-divs + 2 buttons
    expect(jidItemsElement[0].innerText).toBe('a@example.com');
    expect(jidItemsElement[2].innerText).toBe('b@example.com');

  });

  it('it should remove a jid when remove is clicked', () => {
    component.registerOnChange(() => {
    });

    const removeButton = getJidItemsElement()[1].querySelector('button');
    removeButton.click();

    fixture.detectChanges();
    expect(getJidItemsElement().length).toBe(2);

  });

  it('it should notify OnChangeFn when item is removed', (done) => {
    component.registerOnChange((arg) => {
      expect(arg.length).toBe(1);
      expect(arg).toContain('a@example.com');
      done();
    });

    const removeButton = getJidItemsElement()[3].querySelector('button');
    removeButton.click();

    fixture.detectChanges();
  });

  it('it should add a jid when add is clicked', () => {
    component.registerOnChange(() => {
    });

    const inputField = getInputField();
    inputField.value = 'c@example.com';
    inputField.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    getAddButton().click();
    fixture.detectChanges();
    expect(getJidItemsElement().length).toBe(6);
    expect(getJidItemsElement()[4].innerText).toBe('c@example.com');

  });


  it('it should notify OnChangeFn when new item is added', (done) => {
    component.registerOnChange((arg) => {
      expect(arg.length).toBe(3);
      expect(arg[0]).toBe('a@example.com');
      expect(arg[1]).toBe('b@example.com');
      expect(arg[2]).toBe('c@example.com');
      done();
    });

    expect(getAddButton().disabled).toBe(true);

    const inputField = getInputField();
    inputField.value = 'c@example.com';
    inputField.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(getAddButton().disabled).toBe(false);
    getAddButton().click();
    fixture.detectChanges();

  });

  it('it should prevent adding duplicates', () => {
    component.registerOnChange(() => {
      fail();
    });

    const inputField = getInputField();
    inputField.value = 'a@example.com';
    inputField.dispatchEvent(new Event('input'));
    inputField.dispatchEvent(new Event('textInput'));
    fixture.detectChanges();

    getAddButton().click();
    fixture.detectChanges();
    expect(getJidItemsElement().length).toBe(4); // still 4 elements..
  });
});
