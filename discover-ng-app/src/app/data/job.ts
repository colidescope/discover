import {ChartPoint} from "chart.js";
import * as chroma from 'chroma-js';
import {BehaviorSubject} from "rxjs";

declare const getDominantSet;

export class JobData {
  private readonly jobHeader: string[];
  private readonly jobOptions: string[];
  private readonly data: any[] = [];
  private chartData: ChartPoint[] = [];
  private chartColors: string[] = [];
  private xAxisRange: number[] = [0, 100];
  private yAxisRange: number[] = [0, 100];
  private i = 0;
  public rangesChange: BehaviorSubject<number> = new BehaviorSubject(this.i);
  private xSelector: string;
  private ySelector: string;
  private rSelector: string;
  private colorSelector: string;
  private scale = chroma.scale(['#FF0000', '#00FF00', '#0000FF']).mode('hsl');

  constructor(header: string[]) {
    this.jobHeader = header;
    this.jobOptions = JobData.filterOptions(header);
  }

  addRow(row: any) {
    this.data.push(row);
    this.addDataRow(row);
    this.computeColors();
    this.computeRanges();
    this.rangesChange.next(++this.i);
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
    this.computeRanges();
  }

  private addDataRow(row: any) {
    const positions: number[] = this.getPositions(this.xSelector, this.ySelector, this.rSelector);
    const radiusData: number[] = this.getData().map((element) => {
      return (positions[2] > -1 ? element[positions[2]] : 0) as number;
    });
    const min = Math.min(...radiusData);
    const max = Math.max(...radiusData);
    let i = 0;
    for (let point of this.getCharData()) {
      const percent = positions[2] > -1 ? (radiusData[i] - min) / (max - min) : 0;
      point.r = 5 + (percent * 10);
      i++;
    }
    const percent = positions[2] > -1 ? (row[positions[2]] - min) / (max - min) : 0;
    this.chartData.push({x: row[positions[0]], y: row[positions[1]], r: 5 + (percent * 10)});
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
      return (positions[2] > -1 ? element[positions[2]] : 0) as number;
    });
    const min = Math.min(...radiusData);
    const max = Math.max(...radiusData);
    let i: number = 0;
    for (let row of data) {
      const percent = positions[2] > -1 ? (row[positions[2]] - min) / (max - min) : 0;
      let point = this.chartData[i];
      point.x = row[positions[0]];
      point.y = row[positions[1]];
      point.r = 5 + (percent * 10);
      i++;
    }
  }

  private computeColors() {
    const data: any[] = this.getData();
    const position: number = this.jobHeader.indexOf(this.colorSelector);
    if (position > -1) {
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
    } else {
      this.chartColors.length = 0;
      for (let val of data) {
        this.chartColors.push('#6c757d');
      }
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


  private computeRanges() {
    const positions = this.getPositions(this.xSelector, this.ySelector, this.rSelector);
    const xValues = this.getData().map(value => value[positions[0]]);
    const yValues = this.getData().map(value => value[positions[1]]);
    let max = Math.max(...xValues);
    let min = Math.min(...xValues);
    let offset = (max - min) * 0.05;
    this.xAxisRange = [min - offset, max + offset];
    max = Math.max(...yValues);
    min = Math.min(...yValues);
    offset = (max - min) * 0.05;
    this.yAxisRange = [min - offset, max + offset];
  }

  public getMinX(): number {
    return this.xAxisRange[0];
  }

  public getMaxX(): number {
    return this.xAxisRange[1]
  }

  public getMinY(): number {
    return this.yAxisRange[0]
  }

  public getMaxY(): number {
    return this.yAxisRange[1]
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
