import {Component, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {ChartDataSets, ChartOptions, ChartPoint, ChartType} from "chart.js";
import {Color} from "ng2-charts";
import {JobData} from "../data/job";

@Component({
  selector: 'app-scatter-chart',
  templateUrl: './scatter-chart.component.html',
  styleUrls: ['./scatter-chart.component.sass']
})
export class ScatterChartComponent implements OnChanges {
  @Input() xAxisLabel: string = '';
  @Input() yAxisLabel: string = '';
  @Input() radiusLabel: string = '';
  @Input() colorLabel: string = '';
  @Input() jobData: JobData = null;
  @ViewChild('#chart', {static: true}) _chart;
  public bubbleChartType: ChartType = 'bubble';
  public bubbleChartOptions: ChartOptions = this.getChartOptions();
  public bubbleChartData: ChartDataSets[] = [
    {
      data: [
        {x: 10, y: 10, r: 10},
        {x: 15, y: 5, r: 15},
        {x: 26, y: 12, r: 23},
        {x: 7, y: 8, r: 8}
      ]
    }
  ];
  bubbleChartColors: Color[] = [{backgroundColor: ["#FF0000", "#00FFFF", "#FF00FF", "#0000FF", "#00FF00"]}];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.jobData || changes.xAxisLabel || changes.yAxisLabel || changes.radiusLabel) {
      this.computeData();
      this.bubbleChartOptions = this.getChartOptions();
    } else if (changes.colorLabel) {
      // this.computeColors();
    }
  }

  getChartOptions(): ChartOptions {
    return {
      responsive: true,
      maintainAspectRatio: false,
      tooltips: {
        enabled: false,
        custom: this.customTooltip
      },
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

  private computeData() {
    if (this.jobData) {
      const data: any[] = this.jobData.getData();
      const positions: number[] = this.getPositions(this.jobData.getHeader());
      const chartData: ChartPoint[] = [];
      for (let row of data) {
        chartData.push({x: row[positions[0]], y: row[positions[1]], r: Math.round(row[positions[2]])});
      }
      this.bubbleChartData = [{data: chartData}]
    }
  }

  private getPositions(headers: string[]): number[] {
    return [headers.indexOf(this.xAxisLabel),
      headers.indexOf(this.yAxisLabel),
      headers.indexOf(this.radiusLabel)];
  }

  customTooltip(tooltip) {
    // Tooltip Element
    var tooltipEl: any = document.getElementById('chartjs-tooltip');

    if (!tooltipEl) {
      tooltipEl = document.createElement('div');
      tooltipEl.id = 'chartjs-tooltip';
      tooltipEl.innerHTML = '<table></table>';
      this._chart.canvas.parentNode.appendChild(tooltipEl);
    }

    // Hide if no tooltip
    if (tooltip.opacity === 0) {
      tooltipEl.style.opacity = 0;
      return;
    }

    // Set caret Position
    tooltipEl.classList.remove('above', 'below', 'no-transform');
    if (tooltip.yAlign) {
      tooltipEl.classList.add(tooltip.yAlign);
    } else {
      tooltipEl.classList.add('no-transform');
    }

    function getBody(bodyItem) {
      return bodyItem.lines;
    }

    // Set Text
    if (tooltip.body) {
      var titleLines = tooltip.title || [];
      var bodyLines = tooltip.body.map(getBody);
      console.log(tooltip);
      var innerHtml = '<div> Design #' + tooltip.dataPoints[0].index;
      innerHtml += '</div>';

      var tableRoot = tooltipEl.querySelector('table');
      tableRoot.innerHTML = innerHtml;
    }

    const positionY = this._chart.canvas.offsetTop;
    const positionX = this._chart.canvas.offsetLeft;

    // Display, position, and set styles for font
    tooltipEl.style.opacity = 1;
    tooltipEl.style.left = positionX + tooltip.caretX + 'px';
    tooltipEl.style.top = positionY + tooltip.caretY + 'px';
    tooltipEl.style.fontFamily = tooltip._bodyFontFamily;
    tooltipEl.style.fontSize = tooltip.bodyFontSize + 'px';
    tooltipEl.style.fontStyle = tooltip._bodyFontStyle;
    tooltipEl.style.padding = tooltip.yPadding + 'px ' + tooltip.xPadding + 'px';
  };
}
