import {AfterViewInit, Component} from '@angular/core';
import {SideBarStatus} from "./sidebar/sidebar.component";
import {MenuitemService} from "./sidebar/menuitem.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent implements AfterViewInit {
  leftSideBarStatus: SideBarStatus = {opened: false, selectedIndex: -1};
  rightSideBarStatus: SideBarStatus = {opened: false, selectedIndex: -1};
  view: any[] = [700, 400];

  showGridLines = true;
  legend = true;
  legendTitle = "Dots Mf'er";
  legendPosition = "right";
  xAxis = true;
  yAxis = true;
  showXAxisLabel = true;
  showYAxisLabel = true;
  xAxisLabel = "LR";
  yAxisLabel = "Jobs";
  trimXAxisTicks = true;
  trimYAxisTicks = true;
  rotateXAxisTicks = true;
  maxXAxisTickLength = 16;
  maxYAxisTickLength = 16;
// xAxisTicks;
// yAxisTicks;
  roundDomains = false;
  maxRadius = 5;
  minRadius = 5;
  autoScale = true;
  schemeType = "ordinal";
  tooltipDisabled = false;

  public bubbleDemoTempData = [
    {
      "name": "Example1",
      "series": [
        {
          "name": "a",
          "x": 0,
          "y": 0,
          "r": 1
        },
        {
          "name": "b",
          "x": 10,
          "y": 3,
          "r": 10
        }
      ]
    },
    {
      "name": "Example2",
      "series": [
        {
          "name": "1",
          "x": 20,
          "y": 1,
          "r": 30
        },
        {
          "name": "2",
          "x": 3,
          "y": 3,
          "r": 500
        }
      ]
    }
  ];

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

  ngAfterViewInit(): void {
    setInterval(_ => {
      console.log('resize');
      window.dispatchEvent(new Event('resize'))
    }, 250)
  }

}
