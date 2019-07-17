import {Component} from '@angular/core';

@Component({
  selector: 'app-explore-container',
  templateUrl: './explore-container.component.html',
  styleUrls: ['./explore-container.component.sass']
})
export class ExploreContainerComponent {

  isolate: number = -1;

  isolateOptimal(checked: boolean) {
    this.isolate = checked ? 0 : -1;
  }

  isolateSelected(checked: boolean) {
    this.isolate = checked ? 1 : -1;
  }

}
