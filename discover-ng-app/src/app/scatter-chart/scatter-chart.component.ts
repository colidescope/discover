import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {ChartDataSets, ChartOptions, ChartType} from "chart.js";
import {RealTimeService} from "../real-time.service";

@Component({
  selector: 'app-scatter-chart',
  templateUrl: './scatter-chart.component.html',
  styleUrls: ['./scatter-chart.component.sass']
})
export class ScatterChartComponent implements OnChanges {
  @Input() xAxisLabel: string = '';
  @Input() yAxisLabel: string = '';
  public bubbleChartType: ChartType = 'bubble';
  public bubbleChartOptions: ChartOptions = this.getChartOptions();
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

  constructor(private realTimeService: RealTimeService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.xAxisLabel || changes.yAxisLabel) {
      this.bubbleChartOptions = this.getChartOptions();
    }
  }

  getChartOptions() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        xAxes: [{
          ticks: {
            min: 0,
            max: 30,
          },
          scaleLabel: {
            display: true,
            labelString: this.xAxisLabel
          }
        }],
        yAxes: [{
          ticks: {
            min: 0,
            max: 30,
          },
          scaleLabel: {
            display: true,
            labelString: this.yAxisLabel
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
  }

}
