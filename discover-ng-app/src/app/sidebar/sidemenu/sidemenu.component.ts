import {Component, EventEmitter, Input, Output} from '@angular/core';
import {MenuItem} from "../menuitem.service";

@Component({
  selector: 'app-sidemenu',
  templateUrl: './sidemenu.component.html',
  styleUrls: ['./sidemenu.component.sass']
})
export class SidemenuComponent {
  @Input() inverted: boolean = false;
  @Input() itemSelected: number = -1;
  @Output() onItemSelected: EventEmitter<number> = new EventEmitter<number>();
  @Input() menuItems: MenuItem[];

  onClickItem(index: number) {
    if (this.itemSelected == index) {
      this.itemSelected = -1;
    } else {
      this.itemSelected = index;
    }
    this.onItemSelected.emit(this.itemSelected)
  }

}
