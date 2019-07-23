import {Component, EventEmitter, Input, Output} from '@angular/core';
import {RealTimeService} from "../real-time.service";
import {JobData} from "../data/job";

@Component({
  selector: 'app-explore-container',
  templateUrl: './explore-container.component.html',
  styleUrls: ['./explore-container.component.sass']
})
export class ExploreContainerComponent {
  isolate: number = -1;
  @Input() xAxis: string = undefined;
  @Input() yAxis: string = undefined;
  @Input() size: string = undefined;
  @Input() color: string = undefined;
  @Output() xAxisChange: EventEmitter<string> = new EventEmitter<string>();
  @Output() yAxisChange: EventEmitter<string> = new EventEmitter<string>();
  @Output() sizeChange: EventEmitter<string> = new EventEmitter<string>();
  @Output() colorChange: EventEmitter<string> = new EventEmitter<string>();
  private jobData: JobData = null;

  constructor(private realTimeService: RealTimeService) {
    this.realTimeService.jobData.subscribe((data) => {
      this.jobData = data;
    })
  }

  isolateOptimal(checked: boolean) {
    this.isolate = checked ? 0 : -1;
  }

  isolateSelected(checked: boolean) {
    this.isolate = checked ? 1 : -1;
  }

  getOptions(): string[] {
    if (this.jobData) {
      return this.jobData.getOptions();
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
