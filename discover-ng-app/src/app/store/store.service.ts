import {Injectable} from '@angular/core';
import {RealTimeService} from "../real-time.service";

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  exploreParameters: ExploreParameters;

  constructor(realTimeService: RealTimeService) {
    realTimeService.jobData.subscribe((jobData) => {
      this.initExploreParameters(jobData.getOptions());
    })
  }

  initExploreParameters(options: string[]) {
    if (options.length > 0) {
      this.exploreParameters = {
        xLabel: options[0],
        yLabel: options[0],
        radiusLabel: options[0],
        colorLabel: options[0]
      }
    }
  }

}

export interface ExploreParameters {
  xLabel: string,
  yLabel: string;
  radiusLabel: string;
  colorLabel: string;
}
