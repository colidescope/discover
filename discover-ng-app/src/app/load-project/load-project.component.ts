import {Component, EventEmitter, Input, Output} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {RealTimeService} from "../real-time.service";

@Component({
  selector: 'app-load-project',
  templateUrl: './load-project.component.html',
  styleUrls: ['./load-project.component.sass']
})
export class LoadProjectComponent {
  @Input() projectName: string = '';
  @Output() projectNameChange: EventEmitter<string> = new EventEmitter<string>();

  constructor(private http: HttpClient, private realtime: RealTimeService) {
  }

  fileSelected(files: FileList) {
    const file: File = files[0];
    console.log(file);
  }

  loadProject(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.projectName = (event.target as any).value;
      this.projectNameChange.emit(this.projectName);
      this.http.get("http://localhost:5000/api/v1.0/get_data/" + encodeURI(this.projectName)).subscribe(
        (response: Project) => {
          if (response.status === 'success') {
            const header: string[] = this.extractHeaders(response.data[0]);
            this.realtime.setHeader(header);
            for (let row of response.data) {
              let dataRow = [];
              for (let value of header) {
                dataRow.push(row[value])
              }
              this.realtime.addRow(dataRow);
            }
          }
        })
    }
  }

  extractHeaders(dataRow: any): string[] {
    return Object.keys(dataRow)
  }
}

export interface Project {
  status: string
  load_images: boolean
  data: any[]
}
