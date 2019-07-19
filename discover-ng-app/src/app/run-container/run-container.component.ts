import {Component} from '@angular/core';
import {RealTimeService} from "../real-time.service";

@Component({
  selector: 'app-run-container',
  templateUrl: './run-container.component.html',
  styleUrls: ['./run-container.component.sass']
})
export class RunContainerComponent {
  log: string = '';

  constructor(logService: RealTimeService) {
    logService.getLog().subscribe(value => {
      this.log = value;
    })
  }
}
