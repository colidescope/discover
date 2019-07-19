import {Injectable} from '@angular/core';
import {Socket} from "ngx-socket-io";
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class RealTimeService {

  private log: BehaviorSubject<string> = new BehaviorSubject<string>('');

  constructor(socket: Socket) {
    socket.on('connect', () => {
      this.log.next('Established connection to server');
    });
    socket.on('disconnect', (socket) => {
      this.log.next(this.log.value + '\nDisconnected from server');
    });
    socket.on('server message', (msg) => {
      this.log.next(this.log.value + '\n' + msg.message);
    });
  }

  getLog() {
    return this.log;
  }
}
