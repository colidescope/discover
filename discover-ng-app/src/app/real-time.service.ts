import {Injectable} from '@angular/core';
import {Socket} from "ngx-socket-io";
import {BehaviorSubject} from "rxjs";
import {JobData} from "./data/job";

@Injectable({
  providedIn: 'root'
})
export class RealTimeService {

  private log: BehaviorSubject<string> = new BehaviorSubject<string>('');
  private jobData: JobData;

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
    socket.on('job header', (header: any) => {
      this.jobData = new JobData(header);
    });
    socket.on('job data', (dataRow: any) => {
      this.jobData.addRow(dataRow);
    })
  }

  getLog() {
    return this.log;
  }

  getJobData() {
    return this.jobData;
  }
}
