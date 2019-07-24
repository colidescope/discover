import {Component, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {ChartDataSets, ChartOptions, ChartType} from "chart.js";
import {BaseChartDirective, Color} from "ng2-charts";
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
  @ViewChild(BaseChartDirective, {static: true}) _chart: BaseChartDirective;
  public bubbleChartType: ChartType = 'bubble';
  public bubbleChartOptions: ChartOptions = this.getChartOptions();
  public selectedPoints: boolean[] = [];
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
      if (this.jobData) {
        this.jobData.updateSelectors(this.xAxisLabel, this.yAxisLabel, this.radiusLabel);
        let chartData = this.jobData.getCharData();
        this.selectedPoints = [];
        this.bubbleChartData = [{
          data: chartData,
          borderWidth: [].fill(1, 0, chartData.length),
          hoverBorderWidth: [].fill(1, 0, chartData.length),
          borderColor: '#222222'
        }];
      }
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
            mode: 'xy',
            speed: 0.05
          }
        }
      }
    };
  }

  customTooltip(tooltip) {
    // Tooltip Element
    let tooltipEl: any = document.getElementById('chartjs-tooltip');

    if (!tooltipEl) {
      tooltipEl = document.createElement('div');
      tooltipEl.id = 'chartjs-tooltip';
      tooltipEl.innerHTML = '<table></table>';
      this._chart.chart.canvas.parentNode.appendChild(tooltipEl);
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

    // Set Text
    if (tooltip.body) {
      let innerHtml = '<div> Design #' + tooltip.dataPoints[0].index;
      innerHtml += '</div>';

      const tableRoot = tooltipEl.querySelector('table');
      tableRoot.innerHTML = innerHtml;
    }

    const positionY = this._chart.chart.canvas.offsetTop;
    const positionX = this._chart.chart.canvas.offsetLeft;

    // Display, position, and set styles for font
    tooltipEl.style.opacity = 1;
    tooltipEl.style.left = positionX + tooltip.caretX + 'px';
    tooltipEl.style.top = positionY + tooltip.caretY + 'px';
    tooltipEl.style.fontFamily = tooltip._bodyFontFamily;
    tooltipEl.style.fontSize = tooltip.bodyFontSize + 'px';
    tooltipEl.style.fontStyle = tooltip._bodyFontStyle;
    tooltipEl.style.padding = tooltip.yPadding + 'px ' + tooltip.xPadding + 'px';
  };

  onClick(event: { event?: MouseEvent; active: any[] }) {
    for (let point of event.active) {
      this.selectedPoints[point._index] = !this.selectedPoints[point._index];
      this.bubbleChartData[0].borderWidth[point._index] = this.selectedPoints[point._index] ? 3 : 1;
      this.bubbleChartData[0].hoverBorderWidth[point._index] = this.selectedPoints[point._index] ? 3 : 1;
      this._chart.chart.update();
    }
  }

  public resetZoom() {
    (this._chart.chart as any).resetZoom(); //Method available only trough plugin
  }

  public clearSelected() {
    this.selectedPoints = [];
    this.bubbleChartData[0].borderWidth = [].fill(1, this.bubbleChartData[0].data.length);
    this.bubbleChartData[0].hoverBorderWidth = [].fill(1, this.bubbleChartData[0].data.length);
    this._chart.chart.update();
  }

}
