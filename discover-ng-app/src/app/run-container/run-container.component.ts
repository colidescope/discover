import {Component, EventEmitter, Output} from '@angular/core';
import {RealTimeService} from "../real-time.service";
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'app-run-container',
  templateUrl: './run-container.component.html',
  styleUrls: ['./run-container.component.sass']
})
export class RunContainerComponent {
  designPerGenLabel: string = "Designs per generation";
  numberGenLabel: string = "Number of generations";
  muatationRateLabel: string = "Mutation rate";
  elitesLabel: string = "Elites";
  jobRunning: boolean = false;
  @Output() jobIdChange: EventEmitter<string> = new EventEmitter<string>();

  log: string = '';
  designPerGen: number = 0;
  numberGen: number = 0;
  mutationRate: number = 0.0;
  elites: number = 0.0;

  constructor(logService: RealTimeService, private http: HttpClient) {
    logService.getLog().subscribe(value => {
      this.log = value;
    })
  }

  startJob() {
    const body = {
      options: {
        'Designs per generation': this.designPerGen,
        'Number of generations': this.numberGen,
        'Mutation rate': this.mutationRate,
        'Elites': this.elites,
      }
    };
    this.jobRunning = true;
    try {
      this.http.post("http://localhost:5000/api/v1.0/start", body).subscribe((response: any) => {
        this.jobIdChange.emit(response.job_id);
        this.jobRunning = false;
      });
    } catch (e) {
      this.jobRunning = false;
    }
  }

  stopJob() {
    this.http.get('http://localhost:5000/api/v1.0/stop').subscribe(() => {
      this.jobRunning = false;
    })
  }
}
