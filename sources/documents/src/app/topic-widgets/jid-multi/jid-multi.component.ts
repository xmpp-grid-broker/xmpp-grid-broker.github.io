import {Component, forwardRef} from '@angular/core';
import {ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR, Validators} from '@angular/forms';

/**
 * This component can be used as a form control for `jid-multi`
 * as defined in XEP-0004.
 */
@Component({
  selector: 'xgb-jid-multi',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => JidMultiComponent),
      multi: true
    }
  ],
  templateUrl: './jid-multi.component.html',
  styleUrls: ['./jid-multi.component.css']
})
export class JidMultiComponent implements ControlValueAccessor {

  jids: string[] = [];

  form: FormGroup;

  private propagateChange: any;

  constructor() {
    this.form = new FormGroup({
      'jid': new FormControl('', [Validators.required])
    });
  }

  onSubmit() {
    const newJid = this.form.value.jid;

    if (!this.form.valid || this.jids.indexOf(newJid) > -1) {
      return;
    }

    this.jids.push(newJid);
    this.propagateChange(this.jids);
    this.form.reset();
  }

  removeJid(jid: string) {
    this.jids.splice(this.jids.indexOf(jid), 1);
    this.propagateChange(this.jids);
  }

  writeValue(value: any): void {
    if (value) {
      this.jids = value;
    } else {
      this.jids = [];
    }
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(): void {
  }

}
