import {Component, EventEmitter, Output} from '@angular/core';
import {RealTimeService} from "../real-time.service";
import {JobData} from "../data/job";

@Component({
  selector: 'app-explore-container',
  templateUrl: './explore-container.component.html',
  styleUrls: ['./explore-container.component.sass']
})
export class ExploreContainerComponent {
  isolate: number = -1;
  @Output() xAxisChange: EventEmitter<string> = new EventEmitter<string>();
  @Output() yAxisChange: EventEmitter<string> = new EventEmitter<string>();
  @Output() sizeChange: EventEmitter<string> = new EventEmitter<string>();
  @Output() colorChange: EventEmitter<string> = new EventEmitter<string>();

  constructor(private realTimeService: RealTimeService) {
  }


  isolateOptimal(checked: boolean) {
    this.isolate = checked ? 0 : -1;
  }

  isolateSelected(checked: boolean) {
    this.isolate = checked ? 1 : -1;
  }

  getOptions(): string[] {
    const jobData: JobData = this.realTimeService.getJobData();
    if (jobData) {
      return jobData.getOptions();
    }
    return [];
  }

  xAxisChanged(event: string) {
    this.xAxisChange.emit(event)
  }

  yAxisChanged(event: string) {
    this.yAxisChange.emit(event)
  }

  colorChanged(event: string) {
    this.colorChange.emit(event)
  }

  sizeChanged(event: string) {
    this.sizeChange.emit(event)
  }

}
