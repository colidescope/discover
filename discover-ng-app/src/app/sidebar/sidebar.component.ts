import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {MenuItem} from "./menuitem.service";

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.sass']
})
export class SidebarComponent implements OnChanges {
  @Input() inverted: boolean = false;
  @Output() onStausChange: EventEmitter<SideBarStatus> = new EventEmitter<SideBarStatus>();
  @Input() menuItems: MenuItem[];
  @Input() selectedItem: number = -1;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.selectedItem) {
      this.open(this.selectedItem);
    }
  }

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
    this.onStausChange.emit({opened: false, selectedIndex: this.selectedItem})
  }

  open(idx: number) {
    this.selectedItem = idx;
    this.onStausChange.emit({opened: this.isOpen(), selectedIndex: this.selectedItem})
  }
}

export interface SideBarStatus {
  opened: boolean
  selectedIndex: number
}
