import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
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
  @Input() jobRunning: boolean = false;
  @Output() jobRunningChange: EventEmitter<boolean> = new EventEmitter();
  @Output() jobIdChange: EventEmitter<string> = new EventEmitter<string>();
  @ViewChild('logArea', {static: true}) logArea: ElementRef;

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
      if (this.logArea) {
        setTimeout(() => {
          this.logArea.nativeElement.scrollTop = this.logArea.nativeElement.scrollHeight;
        }, 200);
      }
    });
  }

  startJob() {
    this.jobRunning = true;
    this.jobRunningChange.emit(true);
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
      this.jobRunningChange.emit(false);
      console.log(error);
    });
  }

  stopJob() {
    this.http.get('http://localhost:5000/api/v1.0/stop').subscribe(() => {
      this.jobRunning = false;
      this.jobRunningChange.emit(false);
    })
  }
}
