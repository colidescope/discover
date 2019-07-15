import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-sidemenu',
  templateUrl: './sidemenu.component.html',
  styleUrls: ['./sidemenu.component.sass']
})
export class SidemenuComponent {
  @Input() inverted: boolean = false;
  @Input() itemSelected: number = -1;
  @Output() onItemSelected: EventEmitter<number> = new EventEmitter<number>();

  menuItems: MenuItem[] = [
    {label: 'O1'},
    {label: 'O2'},
    {label: 'O3'}
  ];

  onClickItem(index: number) {
    if (this.itemSelected == index) {
      this.itemSelected = -1;
    } else {
      this.itemSelected = index;
    }
    this.onItemSelected.emit(this.itemSelected)
  }

}

interface MenuItem {
  label: string
}
