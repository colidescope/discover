import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.sass']
})
export class SidebarComponent {
  @Input() inverted: boolean = false;
  @Output() onStausChange: EventEmitter<SideBarStatus> = new EventEmitter<SideBarStatus>();
  selectedItem: number = -1;

  selectItem(idx: number) {
    if (idx == -1 || this.selectedItem == idx) {
      this.close();
    } else {
      this.open(idx);
    }
  }

  isOpen() {
    return this.selectedItem != -1;
  }

  close() {
    this.selectedItem = -1;
    this.onStausChange.emit({opened: false})
  }

  open(idx: number) {
    this.selectedItem = idx;
    this.onStausChange.emit({opened: this.isOpen()})
  }
}

export interface SideBarStatus {
  opened: boolean
}
