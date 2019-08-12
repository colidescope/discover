import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-checkbox-input',
  templateUrl: './checkbox-input.component.html',
  styleUrls: ['./checkbox-input.component.sass']
})
export class CheckboxInputComponent {
  @Input() value: string;
  @Input() checked: boolean = false;
  @Output() checkedChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  onClick() {
    this.checked = !this.checked;
    this.checkedChange.emit(this.checked);
  }

  getImage(): string {
    if (this.checked) {
      return '/assets/ic_22px_box_selected.svg'
    } else {
      return '/assets/ic_22px_box.svg'
    }
  }
}
