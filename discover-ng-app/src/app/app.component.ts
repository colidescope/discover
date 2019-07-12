import {Component} from '@angular/core';
import {Socket} from "ngx-socket-io";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {
  title = 'Discover a design optimization tool built for Rhino Grasshopper';

  constructor(socket: Socket) {
    socket.on('connect', (socket) => {
      console.log('Socket Connected');
    });
    socket.on('disconnect', (socket) => {
      console.log('Socket Disconnected')
    })
  }
}
