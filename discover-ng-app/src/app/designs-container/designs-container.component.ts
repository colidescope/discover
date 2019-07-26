import {Component, Input} from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'app-designs-container',
  templateUrl: './designs-container.component.html',
  styleUrls: ['./designs-container.component.sass']
})
export class DesignsContainerComponent {
  @Input() designsList: Design[] = [];
  @Input() jobId: string = '';

  constructor(private http: HttpClient) {
  }

  regenerateDesign(index: number) {
    const design: Design = this.designsList[index];
    this.http.get("http://localhost:5000/api/v1.0/get_design/" + encodeURI(this.jobId) + "/" + design.index).subscribe((response) => {
      console.log(response);
    });
  }
}

export interface Design {
  index: number
  imageUri?: string
}
