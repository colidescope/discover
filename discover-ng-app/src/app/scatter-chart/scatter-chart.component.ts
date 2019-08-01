import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import * as Chart from "chart.js";
import {ChartDataSets, ChartOptions, ChartType} from "chart.js";
import {BaseChartDirective} from "ng2-charts";
import {JobData} from "../data/job";
import {Design} from "../designs-container/designs-container.component";
import * as chroma from 'chroma-js';
import {clipper} from "./custom-clipper";

@Component({
  selector: 'app-scatter-chart',
  templateUrl: './scatter-chart.component.html',
  styleUrls: ['./scatter-chart.component.sass']
})
export class ScatterChartComponent implements OnChanges, OnInit {
  @Input() xAxisLabel: string = '';
  @Input() yAxisLabel: string = '';
  @Input() radiusLabel: string = '';
  @Input() colorLabel: string = '';
  @Input() jobData: JobData = null;
  @Input() jobId: string = '';
  @Input() isolate: number;
  @Input() selectedPoints: Design[] = [];
  @Output() selectedPointsChange: EventEmitter<Design[]> = new EventEmitter();
  @ViewChild(BaseChartDirective, {static: true}) _chart: BaseChartDirective;
  public bubbleChartType: ChartType = 'bubble';
  public bubbleChartOptions: ChartOptions = this.getChartOptions();
  public bubbleChartData: ChartDataSets[] = [];

  ngOnInit(): void {
    Chart.pluginService.register(clipper); //Custom clipper to avoid points getting put of grid area.
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.jobData) {
      if (this.jobData) {
        this.jobData.updateSelectors(this.xAxisLabel, this.yAxisLabel, this.radiusLabel, this.colorLabel);
        let chartData = this.jobData.getCharData();
        let borderWidth = chartData.map((v, idx) => this.isSelected(idx) ? 2 : 1);
        let hoverBorderWidth = chartData.map((v, idx) => this.isSelected(idx) ? 2 : 1);
        let borderColor = chartData.map((v, idx) => this.isSelected(idx) ? '#222' : '#0222');

        if (changes.jobData) {
          this.bubbleChartData = [{
            data: chartData,
            borderWidth: borderWidth,
            hoverBorderWidth: hoverBorderWidth,
            borderColor: borderColor,
            backgroundColor: this.jobData.getCharColors()
          }];
          this.bubbleChartOptions = this.getChartOptions();
        }
      }
      if (this.isolate != -1) {
        this.computeOpacity(this.isolate);
        this._chart.chart.update();
      }
    } else if (changes.xAxisLabel || changes.yAxisLabel || changes.radiusLabel || changes.colorLabel) {
      if (this.jobData) {
        this.jobData.updateSelectors(this.xAxisLabel, this.yAxisLabel, this.radiusLabel, this.colorLabel);
        let options = this._chart.chart.config.options;
        options.scales.xAxes[0].scaleLabel.labelString = this.xAxisLabel;
        options.scales.yAxes[0].scaleLabel.labelString = this.yAxisLabel;
        this._chart.chart.update();
      }
      if (this.isolate != -1) {
        this.computeOpacity(this.isolate);
        this._chart.chart.update();
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

          let canvas = this._chart.chart.canvas;
          if (!tooltipEl) {
            tooltipEl = document.createElement('div');
            tooltipEl.id = 'chartjs-tooltip';
            tooltipEl.innerHTML = '<table></table>';
            canvas.parentNode.appendChild(tooltipEl);
          }

          // Hide if no tooltip
          if (tooltip.opacity === 0) {
            tooltipEl.style.opacity = 0;
            return;
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

          const positionY = canvas.offsetTop;
          const positionX = canvas.offsetLeft;

          // Display, position, and set styles for font
          tooltipEl.style.opacity = 1;
          let left = positionX + tooltip.caretX;
          if (left < 100) {
            tooltipEl.style.left = '100px';
          } else if (left > canvas.width - 100) {
            tooltipEl.style.left = canvas.width - 100 + 'px';
          } else {
            tooltipEl.style.left = left + 'px';
          }
          tooltipEl.style.top = positionY + tooltip.caretY + 'px';
          tooltipEl.style.fontFamily = tooltip._bodyFontFamily;
          tooltipEl.style.fontSize = tooltip.bodyFontSize + 'px';
          tooltipEl.style.fontStyle = tooltip._bodyFontStyle;
          tooltipEl.style.padding = tooltip.yPadding + 'px ' + tooltip.xPadding + 'px';
          //Above or below
          if (positionY + tooltip.caretY < 180) {
            tooltipEl.classList.add('below');
          } else {
            tooltipEl.classList.remove('below')
          }
        }
      },
      scales: {
        xAxes: [{
          afterTickToLabelConversion: ScatterChartComponent.minMaxTickRemover,
          scaleLabel: {
            display: true,
            labelString: this.xAxisLabel
          },
          beforeFit: (scale?: any) => {
            scale.options.ticks.suggestedMax = this.jobData.getMaxX();
            scale.options.ticks.suggestedMin = this.jobData.getMinX();
          }
        }],
        yAxes: [{
          afterTickToLabelConversion: ScatterChartComponent.minMaxTickRemover,
          scaleLabel: {
            display: true,
            labelString: this.yAxisLabel
          },
          beforeFit: (scale?: any) => {
            scale.options.ticks.suggestedMax = this.jobData.getMaxY();
            scale.options.ticks.suggestedMin = this.jobData.getMinY();
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
      },
      hover: {
        onHover: (event, activeElements) => {
          this._chart.chart.canvas.style.cursor = activeElements[0] ? 'pointer' : 'default';
        }
      }
    };
  }

  onClick(event: { event?: MouseEvent; active: any[] }) {
    for (let point of event.active) {
      const selected: Design = this.selectedPoints.find((design => design && design.index == point._index));
      this.bubbleChartData[0].borderWidth[point._index] = selected ? 1 : 2;
      this.bubbleChartData[0].hoverBorderWidth[point._index] = selected ? 1 : 2;
      this.bubbleChartData[0].borderColor[point._index] = selected ? '#0222' : '#222';
      if (!selected) {
        this.selectedPoints.push({
          index: point._index,
          imageUri: "http://localhost:5000/api/v1.0/get_image/" + encodeURI(this.jobId) + "/" + point._index
        });
      } else {
        this.selectedPoints.splice(this.selectedPoints.findIndex((design) => design === selected), 1)
      }
      this.computeOpacity(this.isolate);
      this.selectedPointsChange.emit(this.selectedPoints);
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

  private computeOpacity(mode: number) {
    if (mode == 0) {
      const optimal: any[] = this.jobData.computeOptimal();
      this.bubbleChartData[0].backgroundColor = (this.bubbleChartData[0].backgroundColor as string[]).map((hex, idx) => {
        if (!optimal.find((optim) => {
          return optim.id == idx
        })) {
          return chroma(this.jobData.getCharColors()[idx]).alpha(0.05).hex()
        } else {
          return chroma(this.jobData.getCharColors()[idx]).alpha(1).hex();
        }
      });
    } else if (mode == 1) {
      this.bubbleChartData[0].backgroundColor = (this.bubbleChartData[0].backgroundColor as string[]).map((hex, idx) => {
        if (!this.isSelected(idx)) {
          return chroma(this.jobData.getCharColors()[idx]).alpha(0.05).hex()
        } else {
          return chroma(this.jobData.getCharColors()[idx]).alpha(1).hex();
        }
      });
    } else {
      this.bubbleChartData[0].backgroundColor = this.jobData.getCharColors();
    }
  }

  private isSelected(idx: number): boolean {
    return this.selectedPoints.find((design) => design.index === idx) != undefined;
  }

  private static minMaxTickRemover(scale) {
    scale.ticks[0] = null;
    scale.ticks[scale.ticks.length - 1] = null;

    scale.ticksAsNumbers[0] = null;
    scale.ticksAsNumbers[scale.ticksAsNumbers.length - 1] = null;
  }
}
