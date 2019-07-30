import {Component, ViewChild} from '@angular/core';
import {SideBarStatus} from "./sidebar/sidebar.component";
import {MenuitemService} from "./sidebar/menuitem.service";
import {JobData} from "./data/job";
import {RealTimeService} from "./real-time.service";
import {ScatterChartComponent} from "./scatter-chart/scatter-chart.component";
import {Design} from "./designs-container/designs-container.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {
  leftSideBarStatus: SideBarStatus = {opened: false, selectedIndex: -1};
  rightSideBarStatus: SideBarStatus = {opened: false, selectedIndex: -1};
  jobId: string = '';
  jobData: JobData = null;

  //Run Panel State
  designPerGen: number = 5;
  numberGen: number = 5;
  mutationRate: number = 0.05;
  elites: number = 1;

  //Explore Panel State
  xAxisLabel: string = undefined;
  yAxisLabel: string = undefined;
  radiusLabel: string = undefined;
  colorLabel: string = undefined;


  selectedDesigns: Design[] = [];
  isolate: number = -1;
  @ViewChild('scatter', {static: false}) scatterChart: ScatterChartComponent;

  constructor(private menuItemService: MenuitemService, private realTimeService: RealTimeService) {
    realTimeService.jobData.subscribe((data) => {
      this.jobData = data;
      if (this.jobData) {
        const options = this.jobData.getOptions();
        this.xAxisLabel = options[options.length - 2];
        this.yAxisLabel = options[options.length - 1];
        this.colorLabel = 'generation';
        this.radiusLabel = 'id';
      }
    })
  }

  getLeftMenuItems() {
    return this.menuItemService.leftMenuItems;
  }

  getRightMenuItems() {
    return this.menuItemService.rightMenuItems;
  }

  updateLeftSideBarStatus(status: SideBarStatus) {
    this.leftSideBarStatus = status;
  }

  updateRightSideBarStatus(status: SideBarStatus) {
    this.rightSideBarStatus = status;
  }

  getWidthClass() {
    if (this.leftSideBarStatus.opened && this.rightSideBarStatus.opened) {
      return 'two-panel-opened';
    } else if (this.leftSideBarStatus.opened || this.rightSideBarStatus.opened) {
      return 'one-panel-opened'
    } else {
      return '';
    }
  }

  updateJobId(jobId: string) {
    this.jobId = jobId;
  }

  resetZoom() {
    this.scatterChart.resetZoom();
  }

  clearSelected() {
    this.scatterChart.clearSelected();
  }

  updateSelectedDesigns(event: Design[]) {
    this.selectedDesigns = event;
  }
}
