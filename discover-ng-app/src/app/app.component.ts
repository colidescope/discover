import {Component} from '@angular/core';
import {Socket} from "ngx-socket-io";
import {SideBarStatus} from "./sidebar/sidebar.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {
  leftSideBarStatus: SideBarStatus = {opened: false};
  rightSideBarStatus: SideBarStatus = {opened: false};

  constructor(socket: Socket) {
    socket.on('connect', (socket) => {
      console.log('Socket Connected');
    });
    socket.on('disconnect', (socket) => {
      console.log('Socket Disconnected')
    })
  }

  updateLeftSideBarStatus(status: SideBarStatus) {
    this.leftSideBarStatus = status;
  }

  updateRightSideBarStatus(status: SideBarStatus) {
    this.rightSideBarStatus = status;
  }

  getWidthClass() {
    if (this.leftSideBarStatus.opened && this.rightSideBarStatus.opened) {
      return 'two-panel-opened';
    } else if (this.leftSideBarStatus.opened || this.rightSideBarStatus.opened) {
      return 'one-panel-opened'
    } else {
      return '';
    }
  }
}
