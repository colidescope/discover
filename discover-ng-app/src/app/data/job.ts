import {ChartPoint} from "chart.js";
import * as chroma from 'chroma-js';

export class JobData {
  private readonly jobHeader: string[];
  private readonly jobOptions: string[];
  private readonly data: any[] = [];
  private chartData: ChartPoint[] = [];
  private chartColors: string[] = [];
  private xSelector: string;
  private ySelector: string;
  private rSelector: string;
  private colorSelector: string;
  private scale = chroma.scale(['red', 'green', 'blue']).mode('hsl');

  constructor(header: string[]) {
    this.jobHeader = header;
    this.jobOptions = JobData.filterOptions(header);
  }

  addRow(row: any) {
    this.data.push(row);
    this.addDataRow(row);
    this.computeColors();
  }

  getRow(idx: number) {
    return this.data[idx];
  }

  getData() {
    return this.data;
  }

  getHeader(): string[] {
    return this.jobHeader;
  }

  getOptions() {
    return this.jobOptions;
  }

  public updateSelectors(xSelector: string, ySelector: string, rSelector: string, colorSelector: string) {
    this.xSelector = xSelector;
    this.ySelector = ySelector;
    this.rSelector = rSelector;
    this.colorSelector = colorSelector;
    this.computeData();
    this.computeColors();
  }

  private addDataRow(row: any) {
    const positions: number[] = this.getPositions(this.xSelector, this.ySelector, this.rSelector);
    this.chartData.push({x: row[positions[0]], y: row[positions[1]], r: Math.round(row[positions[2]])});
    this.computeColors();
  }

  public getCharData(): ChartPoint[] {
    return this.chartData;
  }

  public getCharColors(): string[] {
    return this.chartColors;
  }

  public computeData() {
    const data: any[] = this.getData();
    const positions: number[] = this.getPositions(this.xSelector, this.ySelector, this.rSelector);
    this.chartData = [];
    for (let row of data) {
      let point = {x: row[positions[0]], y: row[positions[1]], r: Math.round(row[positions[2]])};
      this.chartData.push(point);
    }
  }

  private computeColors() {
    const data: any[] = this.getData();
    const position: number = this.jobHeader.indexOf(this.colorSelector);
    const values: number[] = data.map((element) => {
      return element[position] as number
    });
    this.chartColors.length = 0;
    const min = Math.min(...values);
    const max = Math.max(...values);
    for (let val of values) {
      const percent = (val - min) / (max - min);
      this.chartColors.push(this.scale(percent).hex());
    }
  }

  private getPositions(xSelector: string, ySelector: string, rSelector: string): number[] {
    return [this.jobHeader.indexOf(xSelector), this.jobHeader.indexOf(ySelector), this.jobHeader.indexOf(rSelector)];
  }

  static filterOptions(header: string[]) {
    return header.filter((el: string, idx, arr) => {
      if (el === 'id') {
        return true;
      } else if (el === 'generation') {
        return true;
      } else if (el.startsWith('[Maximize]') || el.startsWith('[Minimize]')) {
        return true;
      }
      return false;
    });
  }
}
