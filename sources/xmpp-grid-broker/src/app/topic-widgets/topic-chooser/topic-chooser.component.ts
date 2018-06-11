import {Component, forwardRef, Input} from '@angular/core';
import {ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR, Validators} from '@angular/forms';

import {XmppDataFormFieldType} from '../../core';

/**
 * This is a specific form control to simplify the management
 * of child topics and parent collections.
 */
@Component({
  selector: 'xgb-topic-chooser',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TopicChooserComponent),
      multi: true
    }
  ],
  templateUrl: './topic-chooser.component.html',
})
export class TopicChooserComponent implements ControlValueAccessor {

  @Input()
  public type: XmppDataFormFieldType;
  topics: string[] = [];
  form: FormGroup;
  private _propagateChange: any;

  constructor() {
    this.form = new FormGroup({
      'topic': new FormControl('', [Validators.required])
    });
  }

  get maxNoOfTopicsReached() {
    return this.type === XmppDataFormFieldType.textSingle && this.topics.length === 1;
  }

  onSubmit() {
    const topicToAdd = this.form.value.topic;

    if (!this.form.valid || this.maxNoOfTopicsReached || this.topics.indexOf(topicToAdd) > -1) {
      return;
    }

    this.topics.push(topicToAdd);
    this.propagateChanges();
    this.form.reset();
    if (this.maxNoOfTopicsReached) {
      this.form.disable();
    }
  }

  removeTopic(topicName: string) {
    const maxWasReached = this.maxNoOfTopicsReached;
    this.topics.splice(this.topics.indexOf(topicName), 1);
    if (maxWasReached && !this.maxNoOfTopicsReached) {
      this.form.enable();
    }
    this.propagateChanges();
  }

  writeValue(value: any): void {
    if (value !== undefined && value !== null) {
      if (this.type === XmppDataFormFieldType.textSingle) {
        this.topics = [value];
      } else if (Array.isArray(value)) {
        this.topics = value;
      } else {
        this.topics = value.split('\n');
      }
    } else {
      this.topics = [];
    }
    if (this.maxNoOfTopicsReached) {
      this.form.disable();
    }
  }

  registerOnChange(fn: any): void {
    this._propagateChange = fn;
  }

  registerOnTouched(): void {
  }

  private propagateChanges() {
    this._propagateChange(this.topics.join('\n'));
  }

}
