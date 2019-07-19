import {Component} from '@angular/core';
import {RealTimeService} from "../real-time.service";
import {JobData} from "../data/job";

@Component({
  selector: 'app-explore-container',
  templateUrl: './explore-container.component.html',
  styleUrls: ['./explore-container.component.sass']
})
export class ExploreContainerComponent {
  isolate: number = -1;

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

}
