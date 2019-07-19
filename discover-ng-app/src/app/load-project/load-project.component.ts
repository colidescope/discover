import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-load-project',
  templateUrl: './load-project.component.html',
  styleUrls: ['./load-project.component.sass']
})
export class LoadProjectComponent {
  @Input() projectName: string = '';

  fileSelected(event: FileList) {
    console.log(event);
  }
}
