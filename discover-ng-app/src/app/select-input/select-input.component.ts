import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';

@Component({
  selector: 'app-select-input',
  templateUrl: './select-input.component.html',
  styleUrls: ['./select-input.component.sass']
})
export class SelectInputComponent implements OnChanges {

  @Input() label: string;
  @Input() options: string[] = [];
  @Input() value: string;
  @Output() valueChange: EventEmitter<string> = new EventEmitter<string>();

  setValue(value: string) {
    this.value = value;
    this.valueChange.emit(this.value);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.options) {
      if (this.options.length > 0 && this.value == undefined) {
        this.setValue(changes.options.currentValue[0])
      }
    }
  }

}
