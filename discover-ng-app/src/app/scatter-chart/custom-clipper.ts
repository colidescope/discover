import * as Chart from "chart.js";
import {PluginServiceRegistrationOptions} from "chart.js";

export const clipper: PluginServiceRegistrationOptions = {
  beforeDatasetsDraw: (chart: Chart) => {
    Chart.helpers.canvas.clipArea(chart.ctx, chart.chartArea);
  },
  afterDatasetsDraw: (chart: Chart) => {
    Chart.helpers.canvas.unclipArea(chart.ctx);
  }
};
