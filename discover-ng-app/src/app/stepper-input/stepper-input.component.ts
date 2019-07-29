import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-stepper-input',
  templateUrl: './stepper-input.component.html',
  styleUrls: ['./stepper-input.component.sass']
})
export class StepperInputComponent {
  @Input() label: string;
  @Input() min: number = 0;
  @Input() max: number;
  @Input() step: number = 1;
  @Input() value: number = 0;
  @Output() valueChange: EventEmitter<number> = new EventEmitter<number>();

  increment() {
    if (this.value + this.step <= this.max) {
      this.value = parseFloat((this.value + this.step).toFixed(2));
      this.valueChange.emit(this.value);
    }
  }

  decrement() {
    if (this.value - this.step >= this.min) {
      this.value = parseFloat((this.value - this.step).toFixed(2));
      this.valueChange.emit(this.value);
    }
  }
}
