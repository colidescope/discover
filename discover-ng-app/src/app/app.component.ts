import {Component} from '@angular/core';
import {SideBarStatus} from "./sidebar/sidebar.component";
import {MenuitemService} from "./sidebar/menuitem.service";
import {ChartDataSets, ChartOptions, ChartType} from "chart.js";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {
  leftSideBarStatus: SideBarStatus = {opened: false, selectedIndex: -1};
  rightSideBarStatus: SideBarStatus = {opened: false, selectedIndex: -1};
  jobId: string = '';

  constructor(private menuItemService: MenuitemService) {
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

  public bubbleChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      xAxes: [{
        ticks: {
          min: 0,
          max: 30,
        }
      }],
      yAxes: [{
        ticks: {
          min: 0,
          max: 30,
        }
      },]
    },
    plugins: {
      zoom: {
        pan: {
          enabled: true,
          mode: 'xy'
        },
        zoom: {
          enabled: true,
          mode: 'xy'
        }
      }
    }
  };
  public bubbleChartType: ChartType = 'bubble';
  public bubbleChartLegend = true;

  public bubbleChartData: ChartDataSets[] = [
    {
      data: [
        {x: 10, y: 10, r: 10},
        {x: 15, y: 5, r: 15},
        {x: 26, y: 12, r: 23},
        {x: 7, y: 8, r: 8},
      ],
      label: 'Series A',
    },
  ];
}
