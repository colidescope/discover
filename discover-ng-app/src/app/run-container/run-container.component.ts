import {Component, EventEmitter, Input, Output} from '@angular/core';
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
  mutationRateLabel: string = "Mutation rate";
  elitesLabel: string = "Elites";
  jobRunning: boolean = false;
  @Output() jobIdChange: EventEmitter<string> = new EventEmitter<string>();

  log: string = '';
  @Input() designPerGen: number = 0;
  @Input() numberGen: number = 0;
  @Input() mutationRate: number = 0.0;
  @Input() elites: number = 0.0;
  @Output() designPerGenChange: EventEmitter<number> = new EventEmitter<number>();
  @Output() numberGenChange: EventEmitter<number> = new EventEmitter<number>();
  @Output() mutationRateChange: EventEmitter<number> = new EventEmitter<number>();
  @Output() elitesChange: EventEmitter<number> = new EventEmitter<number>();

  constructor(logService: RealTimeService, private http: HttpClient) {
    logService.getLog().subscribe(value => {
      this.log = value;
    });
    logService.jobFinished.subscribe(() => {
      this.jobRunning = false;
    });
  }

  startJob() {
    this.jobRunning = true;
    const body = {
      options: {
        'Designs per generation': this.designPerGen,
        'Number of generations': this.numberGen,
        'Mutation rate': this.mutationRate,
        'Elites': this.elites,
      }
    };
    this.http.post("http://localhost:5000/api/v1.0/start", body).subscribe((response: any) => {
      this.jobIdChange.emit(response.job_id);
    }, (error) => {
      this.jobRunning = false;
      console.log(error);
    });
  }

  stopJob() {
    this.http.get('http://localhost:5000/api/v1.0/stop').subscribe(() => {
      this.jobRunning = false;
    })
  }
}
