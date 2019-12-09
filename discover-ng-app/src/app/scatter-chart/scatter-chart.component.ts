import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import * as Chart from 'chart.js';
import {ChartDataSets, ChartOptions, ChartType, PointStyle} from 'chart.js';
import {BaseChartDirective} from 'ng2-charts';
import {JobData} from '../data/job';
import {Design} from '../designs-container/designs-container.component';
import * as chroma from 'chroma-js';
import {clipper} from './custom-clipper';
import {RealTimeService} from '../real-time.service';

@Component({
  selector: 'app-scatter-chart',
  templateUrl: './scatter-chart.component.html',
  styleUrls: ['./scatter-chart.component.sass']
})
export class ScatterChartComponent implements OnChanges, OnInit {

  constructor(private realTimeService: RealTimeService) {
    realTimeService.newRowAdded.subscribe(() => {
      if (this.jobData) {
        this.isolatePoints(this.isolate);
        this.bubbleChartData[0].borderColor = this.jobData.getChartData().map((v, idx) => this.getBorderColor(idx));
        this.bubbleChartData[0].backgroundColor = this.jobData.getChartData().map((v, idx) => this.getBackgroundColor(idx));
        this.bubbleChartData[0].pointStyle = this.jobData.getChartData().map((v, idx) => this.getStyle(idx));
        this.bubbleChartData[0].hoverBorderColor = this.jobData.getData().map((v, idx) => '#000');
        this.bubbleChartData[0].hoverBorderWidth = this.jobData.getData().map((v, idx) => 2);
        this._chart.chart.update();
      }
    });
  }

  @Input() xAxisLabel = '';
  @Input() yAxisLabel = '';
  @Input() radiusLabel = '';
  @Input() colorLabel = '';
  @Input() jobData: JobData = null;
  @Input() jobId = '';
  @Input() isolate: number;
  @Input() selectedPoints: Design[] = [];
  @Input() jobHaveImages = false;
  isolatedPoints: Design[] = [];

  @Output() selectedPointsChange: EventEmitter<Design[]> = new EventEmitter();

  @ViewChild(BaseChartDirective, {static: true}) _chart: BaseChartDirective;
  public bubbleChartType: ChartType = 'bubble';
  public bubbleChartOptions: ChartOptions = this.getChartOptions();
  public bubbleChartData: ChartDataSets[] = [];
  private lastMousePosition: number[];

  private static minMaxTickRemover(scale) {
    scale.ticks[0] = null;
    scale.ticks[scale.ticks.length - 1] = null;

    scale.ticksAsNumbers[0] = null;
    scale.ticksAsNumbers[scale.ticksAsNumbers.length - 1] = null;
  }

  ngOnInit(): void {
    Chart.pluginService.register(clipper); // Custom clipper to avoid points getting put of grid area.
  }

  chagesPoint() {
    if (this.jobData) {
      this.jobData.updateSelectors(this.xAxisLabel, this.yAxisLabel, this.radiusLabel, this.colorLabel);
      this.isolatePoints(this.isolate);
      const chartData = this.jobData.getChartData();
      const borderWidth = chartData.map((v, idx) => this.isSelected(idx) ? 2 : 1);
      const hoverBorderWidth = chartData.map((v, idx) => {
        return 2;
      });
      const hoverBorderColor = chartData.map((v, idx) => {
        return '#000';
      });
      const borderColor = chartData.map((v, idx) => this.getBorderColor(idx));
      const pointStyles: PointStyle[] = chartData.map((v, idx) => this.getStyle(idx));
      const chartColors = chartData.map((v, idx) => this.getBackgroundColor(idx));


      this.bubbleChartData = [{
        data: chartData,
        borderWidth,
        hoverBorderWidth,
        hoverBorderColor,
        borderColor,
        backgroundColor: chartColors,
        pointStyle: pointStyles,
        hoverRadius: 0
      }];
      this.bubbleChartOptions = this.getChartOptions();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.jobData) {
      this.chagesPoint();
    } else if (changes.xAxisLabel || changes.yAxisLabel || changes.radiusLabel || changes.colorLabel) {
      if (this.jobData) {
        this.jobData.updateSelectors(this.xAxisLabel, this.yAxisLabel, this.radiusLabel, this.colorLabel);
        this.isolatePoints(this.isolate);
        if (changes.xAxisLabel || changes.yAxisLabel) {
          const options = this._chart.chart.config.options;
          options.scales.xAxes[0].scaleLabel.labelString = this.xAxisLabel;
          options.scales.yAxes[0].scaleLabel.labelString = this.yAxisLabel;
        }
        if (changes.colorLabel) {
          this.bubbleChartData[0].borderColor = this.jobData.getChartData().map((v, idx) => this.getBorderColor(idx));
          this.bubbleChartData[0].backgroundColor = this.jobData.getChartData().map((v, idx) => this.getBackgroundColor(idx));
        }
        this._chart.chart.update();
      }
    } else if (changes.isolate) {
      this.isolatePoints(this.isolate);
      this.bubbleChartData[0].borderColor = this.jobData.getChartData().map((v, idx) => this.getBorderColor(idx));
      this.bubbleChartData[0].backgroundColor = this.jobData.getChartData().map((v, idx) => this.getBackgroundColor(idx));

      this._chart.chart.update();
    }
  }

  getChartOptions(): ChartOptions {
    return {
      responsive: true,
      showLines: true,
      maintainAspectRatio: false,
      tooltips: {
        enabled: false,
        intersect: true,
        custom: (tooltip) => {
          let tooltipEl: any = document.getElementById('chartjs-tooltip');

          const canvas = this._chart.chart.canvas;
          if (!tooltipEl) {
            tooltipEl = document.createElement('div');
            tooltipEl.id = 'chartjs-tooltip';
            tooltipEl.innerHTML = '<table></table>';
            canvas.parentNode.appendChild(tooltipEl);
          }
          // Hide if no tooltip
          if (tooltip.opacity === 0 || !this.isMouseInsideChart() || !this.isIsolated(tooltip.dataPoints[0].index)) {
            tooltipEl.style.opacity = 0;
            return;
          }
          // Set Text
          if (tooltip.body) {
            const index = tooltip.dataPoints[0].index;
            let innerHtml = '';
            innerHtml += '<div> Design #' + index;
            innerHtml += '</div>';
            if (this.jobHaveImages) {
              innerHtml += '<img style="max-width: 200px" src="http://localhost:5000/api/v1.0/get_image/' + encodeURI(this.jobId) + '/' + index + '"/>';
            }

            const tableRoot = tooltipEl.querySelector('table');
            tableRoot.innerHTML = innerHtml;
          }

          const positionY = canvas.offsetTop;
          const positionX = canvas.offsetLeft;

          // Display, position, and set styles for font
          tooltipEl.style.opacity = 1;
          const left = positionX + tooltip.caretX;
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
          // Above or below
          if (positionY + tooltip.caretY < 180) {
            tooltipEl.classList.add('below');
          } else {
            tooltipEl.classList.remove('below');
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
          gridLines: {
            display: true, drawTicks: true,
            lineWidth: 1
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
            mode: () => {
              const yMode = this.lastMousePosition[0] < this._chart.chart.chartArea.left;
              const xMode = this.lastMousePosition[1] > this._chart.chart.chartArea.bottom;
              if (xMode && yMode) {
                return 'xy';
              } else if (xMode) {
                return 'x';
              } else if (yMode) {
                return 'y';
              }
              return 'xy';
            },
            speed: 0.05
          }
        }
      },
      animation: {
        duration: 0
      },
      hover: {
        onHover: (event, activeElements) => {
          this.lastMousePosition = [event.layerX, event.layerY];
          this._chart.chart.canvas.style.cursor = this.isMouseInsideChart() && activeElements[0] ? 'pointer' : 'default';
        }
      }
    };
  }

  onClick(event: { event?: MouseEvent; active: any[] }) {
    for (const point of event.active) {
      const selected: Design = this.selectedPoints.find((design => design && design.index == point._index));
      if (!selected) {
        this.selectedPoints.push({
          index: point._index,
          imageUri: 'http://localhost:5000/api/v1.0/get_image/' + encodeURI(this.jobId) + '/' + point._index
        });
      } else {
        this.selectedPoints.splice(this.selectedPoints.findIndex((design) => design === selected), 1);
      }
      this.isolatePoints(this.isolate);
      this.bubbleChartData[0].borderWidth[point._index] = selected ? 1 : 2;
      this.bubbleChartData[0].hoverBorderWidth[point._index] = selected ? 1 : 2;
      this.bubbleChartData[0].borderColor[point._index] = this.getBorderColor(point._index);
      this.bubbleChartData[0].backgroundColor[point._index] = this.getBackgroundColor(point._index);

      this.selectedPointsChange.emit(this.selectedPoints);
      this._chart.chart.update();
    }
  }

  public resetZoom() {
    (this._chart.chart as any).resetZoom(); // Method available only trough plugin
  }

  public clearSelected() {
    this.selectedPoints = [];
    this.isolatePoints(this.isolate);
    this.bubbleChartData[0].borderWidth = [].fill(1, this.bubbleChartData[0].data.length);
    this.bubbleChartData[0].hoverBorderWidth = [].fill(1, this.bubbleChartData[0].data.length);
    this.bubbleChartData[0].borderColor = this.jobData.getChartData().map((v, idx) => this.getBorderColor(idx));
    this.bubbleChartData[0].backgroundColor = this.jobData.getChartData().map((v, idx) => this.getBackgroundColor(idx));

    this.selectedPointsChange.emit([]);
    this._chart.chart.update();
  }

  private isolatePoints(mode: number) {
    this.isolatedPoints = [];
    if (mode == 0) {
      const optimal: any[] = this.jobData.computeOptimal();
      this.jobData.getData().forEach((v, idx) => {
        if (optimal.find((optim) => {
          return optim.id == idx;
        })) {
          this.isolatedPoints.push({index: idx});
        }
      });
    } else if (mode == 1) {
      this.jobData.getData().forEach((v, idx) => {
        if (this.isSelected(idx)) {
          this.isolatedPoints.push({index: idx});
        }
      });
    }
  }

  private isSelected(idx: number): boolean {
    return this.selectedPoints.find((design) => design.index === idx) != undefined;
  }

  private isIsolated(idx: number): boolean {
    return this.isolate < 0 || this.isolatedPoints.find((design) => design.index === idx) != undefined;
  }

  getBorderColor(idx: number): string {
    if (this.isSelected(idx)) {
      return '#222';
    }

    if (!this.isIsolated(idx) && (!this.jobData.isFeasible(idx) || this.jobData.isFeasible(idx))) {
      return chroma(this.jobData.getChartColors()[idx]).alpha(0.01).hex();
    }

    if (this.jobData.isFeasible(idx)) {
      return '#0222';
    } else if (this.isIsolated(idx)) {
      return this.jobData.getChartColors()[idx];
    } else {
      return '#0222';
    }
  }

  getBackgroundColor(idx: number): string {
    if (!this.jobData.isFeasible(idx)) {
      return '#0000';
    }
    if (this.isIsolated(idx)) {
      return this.jobData.getChartColors()[idx];
    } else {
      return chroma(this.jobData.getChartColors()[idx]).alpha(0.05).hex();
    }
  }

  getStyle(idx: number): PointStyle {
    return this.jobData.isFeasible(idx) ? 'circle' : 'rect';
  }

  private isMouseInsideChart() {
    return this.lastMousePosition[0] > this._chart.chart.chartArea.left && this.lastMousePosition[0] < this._chart.chart.chartArea.right
      && this.lastMousePosition[1] > this._chart.chart.chartArea.top && this.lastMousePosition[1] < this._chart.chart.chartArea.bottom;
  }
}
