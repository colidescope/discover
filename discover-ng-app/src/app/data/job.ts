import {ChartPoint} from "chart.js";

export class JobData {
  private readonly jobHeader: string[];
  private readonly jobOptions: string[];
  private readonly data: any[] = [];
  private chartData: ChartPoint[] = [];

  private xSelector: string;
  private ySelector: string;
  private rSelector: string;

  constructor(header: any) {
    this.jobHeader = header;
    this.jobOptions = JobData.filterOptions(header);
  }

  addRow(row: any) {
    this.data.push(row);
    this.addDataRow(row)
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

  public updateSelectors(xSelector: string, ySelector: string, rSelector: string) {
    this.xSelector = xSelector;
    this.ySelector = ySelector;
    this.rSelector = rSelector;
    this.computeData()
  }

  private addDataRow(row: any) {
    const positions: number[] = this.getPositions(this.xSelector, this.ySelector, this.rSelector);
    this.chartData.push({x: row[positions[0]], y: row[positions[1]], r: Math.round(row[positions[2]])});
  }

  public getCharData(): ChartPoint[] {
    return this.chartData;
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
