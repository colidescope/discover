import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-select-input',
  templateUrl: './select-input.component.html',
  styleUrls: ['./select-input.component.sass']
})
export class SelectInputComponent {
  @Input() label: string;
  @Input() options: string[] = [];
  @Input() value: string;
  @Output() valueChange: EventEmitter<string> = new EventEmitter<string>();

  setValue(value: string) {
    this.value = value;
    this.valueChange.emit(this.value);
  }
}
