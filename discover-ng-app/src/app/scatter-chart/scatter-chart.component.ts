import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild} from '@angular/core';
import {ChartDataSets, ChartOptions, ChartType} from "chart.js";
import {BaseChartDirective} from "ng2-charts";
import {JobData} from "../data/job";
import {Design} from "../designs-container/designs-container.component";
import * as chroma from 'chroma-js';

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
  @Input() jobId: string = '';
  @Input() isolate: number;
  @Output() selectedPointsChange: EventEmitter<Design[]> = new EventEmitter();
  @ViewChild(BaseChartDirective, {static: true}) _chart: BaseChartDirective;
  public bubbleChartType: ChartType = 'bubble';
  public bubbleChartOptions: ChartOptions = this.getChartOptions();
  public selectedPoints: boolean[] = [];
  public bubbleChartData: ChartDataSets[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.jobData || changes.xAxisLabel || changes.yAxisLabel || changes.radiusLabel || changes.colorLabel) {
      if (this.jobData) {
        this.jobData.updateSelectors(this.xAxisLabel, this.yAxisLabel, this.radiusLabel, this.colorLabel);
        let chartData = this.jobData.getCharData();
        this.selectedPoints = [];
        this.bubbleChartData = [{
          data: chartData,
          borderWidth: [].fill(1, 0, chartData.length),
          hoverBorderWidth: [].fill(1, 0, chartData.length),
          borderColor: [].fill('#0222', 0, chartData.length),
          backgroundColor: this.jobData.getCharColors()
        }];
      }
      this.bubbleChartOptions = this.getChartOptions();
      if (this.isolate != -1) {
        this.computeOpacity(this.isolate);
      }
    } else if (changes.isolate) {
      this.computeOpacity(this.isolate);
      this._chart.chart.update();
    }
  }

  getChartOptions(): ChartOptions {
    return {
      responsive: true,
      maintainAspectRatio: false,
      tooltips: {
        enabled: false,
        custom: (tooltip) => {
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
            let index = tooltip.dataPoints[0].index;
            let innerHtml = '<img style="max-width: 200px" src="http://localhost:5000/api/v1.0/get_image/' + encodeURI(this.jobId) + '/' + index + '"/>';
            innerHtml += '<div> Design #' + index;
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
        }
      },
      scales: {
        xAxes: [{
          scaleLabel: {
            display: true,
            labelString: this.xAxisLabel
          }
        }],
        yAxes: [{
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

  onClick(event: { event?: MouseEvent; active: any[] }) {
    for (let point of event.active) {
      this.selectedPoints[point._index] = !this.selectedPoints[point._index];
      this.bubbleChartData[0].borderWidth[point._index] = this.selectedPoints[point._index] ? 2 : 1;
      this.bubbleChartData[0].hoverBorderWidth[point._index] = this.selectedPoints[point._index] ? 2 : 1;
      this.bubbleChartData[0].borderColor[point._index] = this.selectedPoints[point._index] ? '#222' : '#0222';
      this.computeOpacity(this.isolate);
      console.log(this.bubbleChartData[0].backgroundColor[180]);
      this.selectedPointsChange.emit(this.getSelectedDesigns());
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
    this.bubbleChartData[0].borderColor = [].fill('#0222', this.bubbleChartData[0].data.length);
    this.computeOpacity(this.isolate);
    this.selectedPointsChange.emit([]);
    this._chart.chart.update();
  }

  private getSelectedDesigns(): Design[] {
    const designs: Design[] = [];
    this.selectedPoints.forEach((value, index) => {
      if (value) {
        designs.push({
          index: index,
          imageUri: "http://localhost:5000/api/v1.0/get_image/" + encodeURI(this.jobId) + "/" + index
        })
      }
    });
    return designs;
  }

  private computeOpacity(mode: number) {
    if (mode == 0) {
      const optimal: any[] = this.jobData.computeOptimal();
      this.bubbleChartData[0].backgroundColor = (this.bubbleChartData[0].backgroundColor as string[]).map((hex, idx) => {
        if (!optimal.find((optim) => {
          return optim.id == idx
        })) {
          return chroma(hex).alpha(0.05).hex()
        } else {
          return chroma(hex).alpha(1).hex();
        }
      });
    } else if (mode == 1) {
      this.bubbleChartData[0].backgroundColor = (this.bubbleChartData[0].backgroundColor as string[]).map((hex, idx) => {
        if (!this.selectedPoints[idx]) {
          return chroma(hex).alpha(0.05).hex()
        } else {
          return chroma(hex).alpha(1).hex();
        }
      });
    } else {
      this.bubbleChartData[0].backgroundColor = this.jobData.getCharColors();
    }
    console.log(this.bubbleChartData[0].backgroundColor[180]);
  }
}