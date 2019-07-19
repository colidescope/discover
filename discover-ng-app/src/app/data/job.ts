export class JobData {
  private readonly jobHeader: string[];
  private readonly jobOptions: string[];
  private readonly data: any[] = [];

  constructor(header: any) {
    this.jobHeader = header;
    this.jobOptions = this.filterOptions(header);
  }


  addRow(row: any) {
    this.data.push(row);
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

  private filterOptions(header: string[]) {
    return header.filter((el: string, idx, arr) => {
      console.log(el);
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
