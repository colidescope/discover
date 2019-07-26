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
  xAxisLabel: string = undefined;
  yAxisLabel: string = undefined;
  radiusLabel: string = undefined;
  colorLabel: string = undefined;
  selectedDesigns: Design[] = [];
  @ViewChild('scatter', {static: false}) scatterChart: ScatterChartComponent;

  constructor(private menuItemService: MenuitemService, private realTimeService: RealTimeService) {
    realTimeService.jobData.subscribe((data) => {
      this.jobData = data;
      if (this.jobData) {
        const options = this.jobData.getOptions();
        this.xAxisLabel = options[0];
        this.yAxisLabel = options[0];
        this.colorLabel = options[0];
        this.radiusLabel = options[0];
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

  setXAxis(xLabel: string) {
    this.xAxisLabel = xLabel;
  }

  setYAxis(yLabel: string) {
    this.yAxisLabel = yLabel;
  }

  setRadiusLabel(radiusLabel: string) {
    this.radiusLabel = radiusLabel;
  }

  setColorLabel(colorLabel: string) {
    this.colorLabel = colorLabel;
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
