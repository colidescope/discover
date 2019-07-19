import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-sidepanel',
  templateUrl: './sidepanel.component.html',
  styleUrls: ['./sidepanel.component.sass']
})
export class SidepanelComponent {
  @Input() inverted: boolean = false;
  @Output() onClose: EventEmitter<any> = new EventEmitter<any>();

  close() {
    this.onClose.emit(true);
  }
}
