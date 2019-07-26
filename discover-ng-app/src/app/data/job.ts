import {ChartPoint} from "chart.js";
import * as chroma from 'chroma-js';

declare const getDominantSet;

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

  getData(): any[] {
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
    const radiusData: number[] = this.getData().map((element) => {
      return element[positions[2]] as number;
    });
    const min = Math.min(...radiusData);
    const max = Math.max(...radiusData);
    let i = 0;
    for (let point of this.getCharData()) {
      const percent = (radiusData[i] - min) / (max - min);
      point.r = 5 + (percent * 10);
      i++;
    }
    const percent = (row[positions[2]] - min) / (max - min);
    this.chartData.push({x: row[positions[0]], y: row[positions[1]], r: 5 + (percent * 10)});
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
    const radiusData: number[] = data.map((element) => {
      return element[positions[2]] as number;
    });
    const min = Math.min(...radiusData);
    const max = Math.max(...radiusData);
    this.chartData = [];
    for (let row of data) {
      const percent = (row[positions[2]] - min) / (max - min);
      let point = {x: row[positions[0]], y: row[positions[1]], r: 5 + (percent * 10)};
      this.chartData.push(point);
    }
  }

  private computeColors() {
    const data: any[] = this.getData();
    const position: number = this.jobHeader.indexOf(this.colorSelector);
    const values: number[] = data.map((element) => {
      return element[position] as number;
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

  public computeOptimal(): any[] {
    const optHeader = JobData.filterForOptimal(this.getHeader());
    const transformedData: any[] = [];
    for (let row of this.getData()) {
      const transformedRow = {};
      for (let h of optHeader) {
        let indexOf = this.getHeader().indexOf(h);
        transformedRow[h] = row[indexOf];
      }
      transformedData.push(transformedRow);
    }
    return getDominantSet(transformedData);
  }

  static filterOptions(header: string[]) {
    return header.filter((el: string) => {
      return el === 'id' || el === 'generation' || el.startsWith('[Maximize]') || el.startsWith('[Minimize]');
    });
  }

  static filterForOptimal(header: string[]) {
    return header.filter((el: string) => {
      return el === 'id' || el.startsWith('[Maximize]') || el.startsWith('[Minimize]');
    });
  }
}
