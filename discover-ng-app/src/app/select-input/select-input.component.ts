import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-select-input',
  templateUrl: './select-input.component.html',
  styleUrls: ['./select-input.component.sass']
})
export class SelectInputComponent {
  @Input() label: string;
  @Input() options: string[] = [];
  value: string;
}
